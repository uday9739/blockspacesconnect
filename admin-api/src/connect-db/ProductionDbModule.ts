import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { ProductionDbDataContext, ProductionDbConnectionManager } from ".";
import { PRODUCTION_DATABASE_ENV } from "./constants";

const mongooseProviders = [
  {
    provide: ProductionDbConnectionManager,
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const databaseEnv = 'productionDatabase';
      const connectionManager = new ProductionDbConnectionManager(logger, env);
      // connectionManager.setEnvironment('productionDatabase')
      await connectionManager.init(databaseEnv);
      return connectionManager;
    }
  },
  ProductionDbDataContext
]

/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections
  providers: [
    ...mongooseProviders,
    ProductionDbConnectionManager,
    ProductionDbDataContext,
  ],
  exports: [
    ProductionDbConnectionManager,
    ProductionDbDataContext
  ]
})
export class ProductionDbModule { }
