import { Module } from "@nestjs/common";
import { ConnectLogger } from "../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../env";
import { DEFAULT_LOGGER_TOKEN } from "../logging/constants";
import { AdminDbConnectionManager, AdminDbDataContext } from ".";
import { ADMIN_DATABASE_ENV } from "./constants";

const mongooseProviders = [
  {
    provide: AdminDbConnectionManager,
    inject: [DEFAULT_LOGGER_TOKEN, ENV_TOKEN],
    useFactory: async (logger: ConnectLogger, env: EnvironmentVariables) => {
      const databaseEnv = 'database';
      const connectionManager = new AdminDbConnectionManager(logger, env);
      await connectionManager.init(databaseEnv);
      return connectionManager;
    }
  },
  AdminDbDataContext
]

/** Provides configuration and connectivity for the Connect database */
@Module({
  // TODO either use NestJS MongooseModule or custom dynamic module for creating connections
  providers: [
    ...mongooseProviders,
    AdminDbConnectionManager,
    AdminDbDataContext,
  ],
  exports: [
    AdminDbConnectionManager,
    AdminDbDataContext,
  ]
})
export class AdminDbModule { }
