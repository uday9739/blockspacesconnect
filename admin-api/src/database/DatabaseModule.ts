import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductionDatabaseService } from './services/ProductionDatabaseService';
import { ENV_TOKEN, EnvironmentVariables } from 'src/env';
import { DatabaseConnectionManager } from './services/DatabaseConnectionManager';
import { StagingDatabaseService } from './services/StagingDatabaseService';
import { ConnectSchemas, AdminPortalSchemas } from './schemas';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ENV_TOKEN],
      connectionName: 'stagingDatabase',
      useFactory: async (env: EnvironmentVariables) => {
        const dbConnectionmanager = new DatabaseConnectionManager(env, 'stagingDatabase');
        return {
          uri: dbConnectionmanager.getConnectionString()
        }
      }
    }),
    MongooseModule.forRootAsync({
      inject: [ENV_TOKEN],
      connectionName: 'productionDatabase',
      useFactory: async (env: EnvironmentVariables) => {
        const dbConnectionmanager = new DatabaseConnectionManager(env, 'productionDatabase');
        return {
          uri: dbConnectionmanager.getConnectionString()
        }
      }
    }),
    MongooseModule.forRootAsync({
      inject: [ENV_TOKEN],
      connectionName: 'database',
      useFactory: async (env: EnvironmentVariables) => {
        const dbConnectionmanager = new DatabaseConnectionManager(env, 'database');
        return {
          uri: dbConnectionmanager.getConnectionString()
        }
      }
    }),
    MongooseModule.forFeature(ConnectSchemas, 'stagingDatabase'),
    MongooseModule.forFeature(ConnectSchemas, 'productionDatabase'),
    MongooseModule.forFeature(AdminPortalSchemas, 'database')
  ],
  controllers: [],
  providers: [ProductionDatabaseService, StagingDatabaseService],
  exports: [ProductionDatabaseService, StagingDatabaseService]
})
export class DatabaseModule { }
