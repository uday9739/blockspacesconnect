import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { firstDbConnection, secondDbConnection } from './services/mongoose.providers';
import { LightningNodesSchema } from './schemas/lightning/LightningNodesSchema';
import { ProductionDatabaseService } from './services/ProductionDatabaseService';
import { ENV_TOKEN, EnvironmentVariables } from 'src/env';
import { DatabaseConnectionManager } from './services/DatabaseConnectionManager';
import { StagingDatabaseService } from './services/StagingDatabaseService';
const schemas = [{ name: 'LightningNodes', schema: LightningNodesSchema }]
@Module({
  imports: [
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
    MongooseModule.forFeature(
      [...schemas], 'productionDatabase'),
  ],
  controllers: [],
  providers: [ProductionDatabaseService],
  exports: [ProductionDatabaseService]
})
export class ProductionDatabaseModule { }
