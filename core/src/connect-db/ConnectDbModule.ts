import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { ConnectDbConnectionManager } from "./services/ConnectDbConnectionManager";
import { ConnectDbDataContext } from "./services/ConnectDbDataContext";

/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections

  providers: [
    {
      provide: ConnectDbConnectionManager,
      inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
      useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
        const connectionManager = new ConnectDbConnectionManager(logger, env);
        await connectionManager.init();
        return connectionManager;
      }
    },
    ConnectDbDataContext
  ],
  exports: [ConnectDbConnectionManager, ConnectDbDataContext]
})
export class ConnectDbModule {}
