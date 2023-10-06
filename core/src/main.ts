import express from "express";
import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./AppModule";
import { env } from "./env";
import { logger } from "@blockspaces/shared/loggers/bscLogger";
import axios from "axios";
import { DocumentBuilder, SwaggerModule, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ErpModule } from "./external-api/erp/ErpModule";
import { BipApiModule } from "./external-api/bip/BipApiModule";
import { ExternalBitcoinModule } from "./external-api/bitcoin/ExternalBitcoinModule";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  app.enableCors({ origin: "*" });
  // Stripe integration requires raw body
  app.use("/api/stripe/integration", express.raw({ type: "*/*", limit: "50mb" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser(env.backend.httpCookieSig));

  app.setGlobalPrefix("/api");

  setAxiosDefaults();

  app.enableShutdownHooks(["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]);

  // these event handlers are needed in order for the Nest.js shutdown hooks to fire properly when the app is started via "npm start"
  process.once("SIGINT", () => { });
  process.once("SIGTERM", () => { });
  process.once("SIGHUP", () => { });
  process.once("SIGBREAK", () => { });

  const configErp = new DocumentBuilder()
    .setTitle("BlockSpaces External API")
    .setDescription("OpenAPI Spec for BlockSpaces ERP Integrations.")
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, "ApiKey")
    .build();

  const configBip = new DocumentBuilder()
    .setTitle("BlockSpaces External API")
    .setDescription("OpenAPI Spec for BlockSpaces BIP Partner Integrations.")
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, "ApiKey")
    .build();

  const optionsErp: SwaggerDocumentOptions = {
    include: [ ErpModule, ExternalBitcoinModule ],
  };

  const optionsBip: SwaggerDocumentOptions = {
    include: [ BipApiModule, ExternalBitcoinModule ],
  };

  const documentBip = SwaggerModule.createDocument(app, configBip, optionsBip);
  const documentErp = SwaggerModule.createDocument(app, configErp, optionsErp);
  SwaggerModule.setup('api/docs/erp', app, documentErp);
  SwaggerModule.setup('api/docs/bip', app, documentBip);

  await app.listen(env.app.port);
}

/**
 * This code handles exceptions that are not covered by the GlobalExceptionFilter
 */
process.on("uncaughtException", (err: Error) => {
  logger.error(`uncaughtException {error: ${err?.toString()} ${err?.stack?.toString()}`);
  process.exit(1);
});
process.on("unhandledRejection", (err: Error, promise) => {
  logger.error(`Unhandled rejection at ${promise} {error: ${err?.toString()} ${err?.stack?.toString()}`);
  process.exit(1);
});

bootstrap();

/**
 * Set defaults for all Axios requests
 */
function setAxiosDefaults() {
  axios.defaults.timeout = env.app.axiosTimeout;
}

