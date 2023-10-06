import { DynamicModule, Module } from '@nestjs/common';
import { Pool, PoolConfig } from "pg"
import { PostgresPoolManager as PostgresPoolManager } from './services/PostgresPoolManager';
import { PostgresQueryRunner } from './services/PostgresQueryRunner';


/**
 * A dynamic module that provides resources for connecting to and querying a PostgreSQL database
 */
@Module({})
export class PostgresModule {

  /**
   * Setup the module with a given PostgreSQL configuration.
   */
  static register(config: PoolConfig): DynamicModule {
    return {
      module: PostgresModule,
      providers: [
        {
          provide: PostgresPoolManager,
          useValue: new PostgresPoolManager(config)
        },
        {
          provide: Pool,
          inject: [PostgresPoolManager],
          useFactory: (poolMgr: PostgresPoolManager) => poolMgr.pool
        },
        PostgresQueryRunner
      ],
      exports: [PostgresQueryRunner]
    }
  }
};