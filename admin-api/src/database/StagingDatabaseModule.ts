import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { firstDbConnection, secondDbConnection } from './services/mongoose.providers';
import { LightningNodesSchema } from './schemas/lightning/LightningNodesSchema';
import { ProductionDatabaseService } from './services/ProductionDatabaseService';
import { ENV_TOKEN, EnvironmentVariables } from 'src/env';
import { DatabaseConnectionManager } from './services/DatabaseConnectionManager';
import { StagingDatabaseService } from './services/StagingDatabaseService';
import { DatabaseService } from './services/DatabaseService';
const schemas = [{ name: 'LightningNodes', schema: LightningNodesSchema }]
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
    MongooseModule.forFeature(
      [...schemas], 'stagingDatabase'),
  ],
  controllers: [],
  providers: [StagingDatabaseService],
  exports: [StagingDatabaseService]
})
export class StagingDatabaseModule { }
