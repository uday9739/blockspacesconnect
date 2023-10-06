import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { DataContextManager } from "./services/DataContextManager";
import { DataContext } from "./services/DataContext";
/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections
  providers: [
    {
      provide: DataContextManager,
      inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
      useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
        const connectionManager = new DataContextManager(logger, env);
        await connectionManager.init();
        return connectionManager;
      }
    },
    DataContext
  ],
  exports: [DataContextManager, DataContext]
})
export class DataContextModule { }