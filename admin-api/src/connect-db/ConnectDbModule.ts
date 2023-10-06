import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { ConnectDbConnectionManager } from "./services/ConnectDbConnectionManager";
import { ConnectDbDataContext } from "./services/ConnectDbDataContext";

const mongooseProviders = [
  {
    provide: 'ADMIN_PORTAL_DATABASE',
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const connectionManager = new ConnectDbConnectionManager(logger, env);
      await connectionManager.init('database');
      return connectionManager;
    },
    ConnectDbDataContext
  },
  {
    provide: 'STAGING_DATABASE',
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const connectionManager = new ConnectDbConnectionManager(logger, env);
      // connectionManager.setEnvironment('stagingDatabase')
      await connectionManager.init('stagingDatabase');
      return connectionManager;
    },
    ConnectDbDataContext
  },
  {
    provide: 'PRODUCTION_DATABASE',
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const connectionManager = new ConnectDbConnectionManager(logger, env);
      // connectionManager.setEnvironment('productionDatabase')
      await connectionManager.init('productionDatabase');
      return connectionManager;
    },
    ConnectDbDataContext
  },
]

/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections
  providers: [
    ...mongooseProviders,
    ConnectDbConnectionManager,
    ConnectDbDataContext
  ],
  exports: [
    ...mongooseProviders,
    ConnectDbDataContext
  ]
})
export class ConnectDbModule { }
