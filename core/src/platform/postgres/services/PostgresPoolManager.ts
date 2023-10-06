import { Injectable } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';

/**
 * Manages connection pools that provide connectivity to a PostgreSQL database
 */
@Injectable()
export class PostgresPoolManager {

  readonly pool: Pool;

  constructor(private readonly config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async onApplicationShutdown(signal: string) {
    if (this.pool) {
      await this.pool.end();
    }
  }
}