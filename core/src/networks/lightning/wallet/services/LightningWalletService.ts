import { NewAddressDto, NewAddressResultDto, WalletBalanceResponse } from "@blockspaces/shared/dtos/lightning";
import { isErrorStatus } from "@blockspaces/shared/helpers/http";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { Inject, Injectable } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { LightningHttpService } from "../../lnd/services/LightningHttpService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";

@Injectable()
export class LightningWalletService {
  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly db: ConnectDbDataContext,
    private readonly http: LightningHttpService,
  ) {
    logger.setModule(this.constructor.name);}


  /**
   * Generates a new address to deposit to the node.
   *
   * @param request The address type to use. P2WKH by default.
   * @param rest The rest object containing the macaroon and cert.
   * @returns A Bitcoin address.
   */
  getNewAddress = async (request: NewAddressDto, tenantId: string): Promise<NewAddressResultDto> => {
    const account = request.account || "";

    const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
    if (!nodeData) {
      this.logger.error(`No node for tenant id (${tenantId}) to get new address.`);
      return null;
    }
    const params = {
      type: "WITNESS_PUBKEY_HASH",
      account: account
    };

    const address = await this.http.get(nodeData.apiEndpoint, "/v1/newaddress", nodeData.bscMacaroon, nodeData.cert, params);

    if (isErrorStatus(address.status)) {
      this.logger.error("Generating a new bitcoin address failed..", null,address);
      return null;
    }

    return address.data;
  };

  /**
   * Returns the balance of the internal LND wallet.
   * 
   * @param tenantId Tenantid of the user
   * @returns The balance of the internal LND wallet
   */
  getWalletBalance = async (tenantId: string): Promise<WalletBalanceResponse> => {
    try {
      const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
      const balance = await this.http.get(nodeData.apiEndpoint, "/v1/balance/blockchain", nodeData.bscMacaroon, nodeData.cert)
      if (isErrorStatus(balance.status)) {
        this.logger.error("Error getting the node balance", balance.data, {data: {tenantId}})
        return null
      }
      return balance?.data
    } catch (e) {
      this.logger.error("getWalletBalance failed.", e, { data: {tenantId, status: e.status }})
      return null
    }
  }


}
