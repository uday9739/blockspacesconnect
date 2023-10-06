import { Module } from '@nestjs/common';
import path from 'path';
import { env } from '../env';
import { PostgresModule } from '../platform/postgres';
import { CustomerNodeService } from './services/CustomerNodeService';



/**
 * Provides resources to access information about the products and services that are available to BlockSpaces customers
 */
@Module({
  imports: [
    PostgresModule.register({
      connectionString: env.database.serviceCatalogDbConnectString
    })
  ],
  providers: [CustomerNodeService],
  exports: [CustomerNodeService]
})
export class ServiceCatalogModule {};