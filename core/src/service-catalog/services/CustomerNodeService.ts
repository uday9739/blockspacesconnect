import { Injectable } from '@nestjs/common';
import { PostgresQueryRunner } from '../../platform/postgres';
import { CustomerNodeServiceFailureReason } from "@blockspaces/shared/types/pokt";

/**
 * Provides data about a customer's blockchain nodes
 */
@Injectable()
export class CustomerNodeService {
  constructor(private readonly queryRunner: PostgresQueryRunner) { }

  /**
   * Get a list of customer noces
   * 
   * @param clientId is the WHMCS client Id
   * @returns Array of Customer Nodes.
   */
  async getCustomerNodes(clientId: number): Promise<GetCustomerNodes[]> {
    const results = await this.queryRunner.query<GetCustomerNodes>(
      'SELECT "ACCOUNTID", "NODEID", "NODETYPE", "NODEKEY", "SERVICE_URL" FROM public."NODES" WHERE "ACCOUNTID" = $1',
      [clientId]);
    return results.rows;
  }
}


// TODO @Tate change this as needed, is just a placeholder you can change to match the shape of your data
/** Customer Nodes */
export interface GetCustomerNodes {
  /** WHMCS OR SNOW ID */
  ACCOUNTID: number,
  /** Node freindly identifyer  */
  NODEID: string,
  /** POKT, LN, SOL types currently returned. */
  NODETYPE: string,
  /** Node Address */
  NODEKEY: string,
  /** Node URL */
  SERVICE_URL: string
}
