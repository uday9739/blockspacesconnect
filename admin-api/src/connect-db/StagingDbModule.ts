import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { StagingDbDataContext, StagingDbConnectionManager } from ".";
import { STAGING_DATABASE_ENV } from "./constants";

const mongooseProviders = [
  {
    provide: StagingDbConnectionManager,
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const databaseEnv = 'stagingDatabase';
      const connectionManager = new StagingDbConnectionManager(logger, env);
      // connectionManager.setEnvironment('productionDatabase')
      await connectionManager.init(databaseEnv);
      return connectionManager;
    }
  },
  StagingDbDataContext
]

/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections
  providers: [
    ...mongooseProviders,
    StagingDbConnectionManager,
    StagingDbDataContext,
  ],
  exports: [
    StagingDbConnectionManager,
    StagingDbDataContext
  ]
})
export class StagingDbModule { }
