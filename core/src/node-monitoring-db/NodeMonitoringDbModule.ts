import { Module } from '@nestjs/common';
import { env } from '../env';
import { PostgresModule } from '../platform/postgres';
import { EndpointsDashboardQueries } from './queries/EndpointsDashboardQueries';
import { PoktDashboardQueries } from './queries/PoktDashboardQueries';

/**
* Module that provides resources for accessing the Node Monitoring database
*/
@Module({
  imports: [
    PostgresModule.register({
      connectionString: env.database.nodeMonitoringDbConnectString
    })
  ],
  providers: [PoktDashboardQueries, EndpointsDashboardQueries],
  exports: [PoktDashboardQueries, EndpointsDashboardQueries]
})
export class NodeMonitoringDbModule { };


