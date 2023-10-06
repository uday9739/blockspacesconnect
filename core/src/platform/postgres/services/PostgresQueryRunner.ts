import { Injectable } from '@nestjs/common';
import { Pool, QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult, QueryResultRow } from 'pg';

/**
 * Executes queries against a PostgreSQL database
 */
@Injectable()
export class PostgresQueryRunner {
  constructor(private readonly pool: Pool) {}

  /**
   * Execute a query with the given configuration.
   *
   * The rows will be returned as an array of objects, where each object will contain
   * keys that correspond to the selected columns.
   *
   * @example
   * ```
   * const results = queryRunner.query({
   *   text: "SELECT first_name, last_name FROM users WHERE user_id = $1",
   *   values: [userId]
   * });
   *
   * // each element in results.rows would have the shape {first_name: string, last_name: string}
   * ```
   */
  query<TRow extends QueryResultRow = any, TValues extends any[] = any[]>(
    queryConfig: QueryConfig<TValues>,
  ): Promise<QueryResult<TRow>>;

  /**
   * Execute a query with the given text and values (bind parameters)
   *
   * The rows will be returned as an array of objects, where each object will contain
   * keys that correspond to the selected columns.
   *
   * @example
   * ```
   * const results = queryRunner.query(
   *   "SELECT first_name, last_name FROM users WHERE user_id = $1",
   *   [userId]
   * );
   *
   * // each element in results.rows would have the shape {first_name: string, last_name: string}
   * ```
   */
  query<TRow extends QueryResultRow = any, TValues extends any[] = any[]>(
    queryText: string,
    values?: TValues,
  ): Promise<QueryResult<TRow>>;

  /**
   * Executes a query with the given config, returning each row as an array instead of an object
   *
   * @example
   * ```
   * const results = queryRunner.query({
   *   text: "SELECT first_name, last_name FROM users WHERE user_id = $1",
   *   values: [userId],
   *   rowMode: "array"
   * });
   *
   * // each element in results.rows would have the shape [string, string]
   * ```
   *
   * @see https://node-postgres.com/features/queries#query-config-object
   */
  query<TRow extends any[] = any[], TValues extends any[] = any[]>(
    queryConfig: QueryArrayConfig<TValues>,
    values?: TValues,
  ): Promise<QueryArrayResult<TRow>>;


  /** Implementation of overloaded query methods */
  query<R = any, I extends any[] = any[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I)  {
    return this.pool.query<R,I>(queryTextOrConfig, values)
  }
}