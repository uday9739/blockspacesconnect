import ApiResult, { ApiResultStatus, IApiResult } from '@blockspaces/shared/models/ApiResult';
import { getApiUrl, localStorageHelper } from "src/platform/utils";
import { BaseHttpTransport } from "src/platform/api";
// import { AesLibraryWrapper } from '@blockspaces/shared/encryption/AesLibraryWrapper';
import { LightningNodeReference } from '@blockspaces/shared/models/lightning/Node';
import https from "https";
import { ChannelPoint, Payment } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { isErrorStatus } from "@blockspaces/shared/helpers/http";
import { GenSeedResponseDto } from "@blockspaces/shared/dtos/lightning";
import { InitNodeResponseDto } from "@blockspaces/shared/dtos/lightning/init-node";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { UnlockNodeResponse } from '@blockspaces/shared/dtos/lightning/unlock-node';

export class LightningSecureTransport extends BaseHttpTransport {
  static readonly instance: LightningSecureTransport = new LightningSecureTransport();
  // private readonly encryption: AesLibraryWrapper = new AesLibraryWrapper();


  /**
   * Queries MongoDB for a node in the `lightningnodes` collection for a node with only the `apiEndpoint` and `nodeId` properties.
   * This then claims the node for the user with their tenant id to continue the onboarding process.
   *
   * @throws Returns null if there is no node available.
   * @returns A node document that is now tied to the users tenant id.
   */
  async claimNodeForUser(): Promise<LightningNodeReference> {
    const response = await this.httpService.get(
      getApiUrl("networks/lightning/onboard/claim-node"),
      { validErrorStatuses: [HttpStatus.NOT_FOUND] }
    );
    if (isErrorStatus(response.status)) return null;
    return response.data?.data;
  }
  /**
   * Get LightningNode from mongo by tenantId
   *
   * @param tenantId
   * @returns Promise<LightningNodeReference>
   */
  async getNodeDoc(tenantId: string): Promise<IApiResult<LightningNodeReference>> {
    // Get node doc from mongo collection
    const result = await this.httpService.get<ApiResult<LightningNodeReference>>(
      getApiUrl("/networks/lightning/node"), 
      { params: { tenantId: tenantId }, validErrorStatuses: [HttpStatus.NOT_FOUND] }
    );
    if (isErrorStatus(result.status)) return null
    return ApiResult.fromJson(result.data);
  }

  /**
   * Add new LightningNode to mongo
   *
   * @param tenantId
   * @returns Promise<LightningNodeReference>
   */
  async createNodeDoc(tenantId: string): Promise<IApiResult<LightningNodeReference>> {
    // Get node from pool collection and use to create node (api url, cert?)
    // GET nodeData where taken = false
    // UPDATE Node that it is taken

    const body = { tenantId /**, the rest from pool collection */ };

    // Assign node to tenant
    const result = await this.httpService.post<ApiResult<LightningNodeReference>>(getApiUrl("/networks/lightning/node"), body);
    return ApiResult.fromJson(result.data);
  }

  /**
   * Update a node document when information of type @link `LightningNodeReference` needs updated.
   *
   * @param query An object to update a node document
   */
  async updateNodeDoc(nodeId: string, patch: Partial<LightningNodeReference>): Promise<IApiResult<LightningNodeReference>> {
    const result = await this.httpService.request<ApiResult<LightningNodeReference>>({
      method: 'PUT',
      url: getApiUrl(`/networks/lightning/node/${nodeId}`), 
      data: patch,
      }
    );
    return ApiResult.fromJson(result.data);
  }

  /**
   * Generates a 24 word seed phrase to be used to initialize a node.
   *
   * @returns A 24 word mnemonic.
   */
  async generateSeedPhrase(url: string): Promise<GenSeedResponseDto> {
    try { 
      const response = await this.httpService.request({
        method: "GET",
        baseURL: url,
        url: "/v1/genseed"
      });
      return response.data;

    } catch (e) {
      return e.response;
    }
  }

  /**
   * Attempts to unlock a node (takes place after a restart).
   *
   * @returns Promise<UnlockNodeResponse>.
   */
  async unlockNode(url: string, password: string): Promise<UnlockNodeResponse> {
    const passBase64 = Buffer.from(password).toString("base64")
    try { 
      await this.httpService.request({
        method: "POST",
        baseURL: url,
        url: "/v1/unlockwallet",
        data: {
          wallet_password: passBase64,
          stateless_init: true
        }
      });
      
      // Check for admin macaroon, if we don't have it get from vault.
      const macaroon = this.getMacaroonFromStorage();

      // If we have the mac from local storage, double check if it's actually in vault;
      if ( macaroon && !await this.isMacaroonInVault(password)) {
        // const storeMacInVault = await this.storeMacaroonInVault(result.data.admin_macaroon, password);
        const encodedMac = Buffer.from(macaroon, 'hex').toString('base64');
        const res = await this.storeMacaroonInVault(encodedMac, password);

        // Validate it's in vault properly
        const macFromVaultRes = await this.getMacaroonFromVault(password);
      } 

      // if we have the mac, but it's not in vault, add it to vault
      if (!macaroon) this.getMacaroonFromVault(password)

      return {status: 'unlocked'};
    } catch (e) {
      if (e.response?.data?.message.startsWith('wallet already unlocked'))
        return {status: 'unlocked'} 
      return e.response;
    }
  }

  async isMacaroonInVault(password: string): Promise<boolean> {
    const res = await this.getMacaroonFromVault(password).catch(_ => {
      console.error('Mac NOT in vault'); 
      return null
    });
    return res !== null;
  }

  /**
   * Initialize the node with a wallet and connect to the network.
   *
   * @param seedPhrase The seed phrase generated from @link `generateSeedPhrase`
   * @param password The wallet password for the node
   * @returns The admin macaroon to be used for requests when the node wallet is unlocked.
   */
  async initializeNodeAndStoreMac(url: string, seedPhrase: string[], password: string): Promise<InitNodeResponseDto> {
    // Convert to Base64 for REST LND interface
    const passBase64 = Buffer.from(password).toString("base64")
    const body = { wallet_password: passBase64, cipher_seed_mnemonic: seedPhrase, stateless_init: true };

    const result = await this.httpService.request({
      method: "POST",
      baseURL: url,
      url: "/v1/initwallet",
      data: body
    });

    // Store in Vault and store in local storage
    const storeMacInVault = await this.storeMacaroonInVault(result.data.admin_macaroon, password);
    if (storeMacInVault.status === ApiResultStatus.Failed) console.error('initialize node failed, store mac in vault');
    const getMacAndStoreInLocalStorage = await this.getMacaroonFromVault(password);
    if (!getMacAndStoreInLocalStorage) console.error('initialize node failed, store mac in vault');

    return result.data.admin_macaroon;
  }
  /**
   * Stores a given encrypted macaroon in the Vault.
   *
   * @param user The current logged in user making the request.
   * @param macaroon The encrypted macaroon to store.
   * @returns The `macaroonId` that is stored in the MongoDB node collection.
   */
  async storeMacaroonInVault(macaroon: string, password: string): Promise<IApiResult<string>> {
    // Encrypt the macaroon
    // const encryptedMacaroon = this.encryption.encrypt(macaroon, password);
    // const body = { macaroon: encryptedMacaroon };

    // Store to Vault
    // const result = await this.httpService.post<ApiResult<string>>(getApiUrl("/networks/lightning/auth"), body);

    // return ApiResult.fromJson(result.data);
    return
  }

  /**
   * Gets the encrypted macaroon from Vault, decrypts it, and stores it in local storage.
   *
   * @param user The current logged in user making the request.
   * @returns The encrypted macaroon stored in vault.
   */
  async getMacaroonFromVault(password: string): Promise<string> {
    if (!password) console.warn('PASSWORD IS MISSING! Mac decryption will fail');
    // Retrieve the encrypted macaroon from Vault
    const response = await this.httpService.get(getApiUrl("/networks/lightning/auth"));
    const encryptedMacaroon = response?.data?.data?.macaroon ?? null; 
    if (!encryptedMacaroon) throw Error('retrieve mac failed');

    // Decrypt the macaroon
    // const decryptedMacaroon = this.encryption.decrypt(encryptedMacaroon.encryptedData, encryptedMacaroon.iv, password);
    // if (!decryptedMacaroon) throw Error('decrypt mac failed');

    // const macaroon = Buffer.from(decryptedMacaroon, "base64").toString("hex")
    // Set the macaroon in local storage
    // localStorageHelper.setItem("admin_macaroon", macaroon);
    // return macaroon;
    return
  }

  /**
   * Generate the BSC macaroon which gives `core` access to readonly/invoice information.
   *
   * @param url The url of the clients node.
   * @param nodeId The node id to update the mongo collection.
   * @returns Boolean if it was generated and stored in the node collection.
   */
  async generateBscMacaroon(url: string): Promise<string> {
    // Set the permissions that we want to give this macaroon access to
    const body = {
      permissions: [
        { entity: "onchain", action: "read" },
        { entity: "invoices", action: "read" },
        { entity: "invoices", action: "write" },
        { entity: "address", action: "read" },
        { entity: "address", action: "write" },
        { entity: "info", action: "read" },
        { entity: "peers", action: "read" },
        { entity: "offchain", action: "read" }
      ]
    };

    // const array: Uint8Array = new Uint8Array(Buffer.from(JSON.stringify(body)));

    // Get the macaroon from local storage, if not found return false
    const macaroon = localStorageHelper.getItem("admin_macaroon");
    if (!macaroon) return;

    // Call the node to generate the macaroon
    const response = await this.httpService.request({
      baseURL: url,
      url: "/v1/macaroon",
      method: "POST",
      headers: {
        "Grpc-Metadata-macaroon": macaroon,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(body)
    });

    //  Store the macaroon in the node data store
    // await this.updateNodeDoc(nodeId, { bscMacaroon: response.data.macaroon });

    return response.data.macaroon;
  }

  async generateBscMacAndUpdateDocWithPubkey(url: string, nodeId: string): Promise<boolean> {
    // generate bsc mac
    const bscMacaroon = await this.generateBscMacaroon(url);
    const info = await this.httpService.request({
      baseURL: url,
      url: "/v1/getinfo",
      method: "GET",
      headers: {
        "Grpc-Metadata-macaroon": bscMacaroon,
      }
    });

    await this.updateNodeDoc(nodeId, { pubkey: info.data.identity_pubkey, bscMacaroon: bscMacaroon });
    return true
  }

  /**
   * Pays a BOLT 11 invoice.
   *
   * @param url The url of the clients node.
   * @param paymentRequest The BOLT 11 payment request to pay.
   * @param feeLimit The maximum number of sats for a fee that will be accepted. 
   * @returns GRPC stream of the payment events. (IN FLIGHT | SUCCESS | CANCELLED)
   */
  async payBolt11Invoice(url: string, paymentRequest: string, feeLimitPercent: number): Promise<IApiResult<Payment.AsObject>> {
    const body = { payment_request: paymentRequest, fee_limit: {percent: `${feeLimitPercent}`} };

    // Get the admin macaroon from storage.
    const macaroon = this.getMacaroonFromStorage();
    if (!macaroon) {
      throw new Error(`Payment failed. - Macaroon Missing. Contact BlockSpaces.`);
    }

    try {
      const result = await this.httpService.request({
        method: 'POST',
        baseURL: url,
        url: "/v1/channels/transactions",
        headers: {
          "Grpc-Metadata-macaroon": macaroon,
          'Content-Type': 'application/json'
        },
        data: body
      });

      // If payment fails return the failure details.
      if (isErrorStatus(result.status)) {
        throw new Error(`Payment failed. - ${result.data}`);
      }
      return ApiResult.success(result.data);

    } catch (e) {
      const errorMessage = e?.response?.data?.error?.message ?? e.message;
      throw new Error(errorMessage);
    }
  }

  /**
   * Track a BOLT 11 invoice.
   *
   * @param url The url of the clients node.
   * @param paymentHash The payment hash of the invoice payment request to pay.
   * @param noInflightUpdates return JUST the final htlc update.
   * 
   * @returns res 
   */
  async trackBolt11(url: string, paymentHash: string, noInflightUpdates: boolean = true): Promise<IApiResult<Payment.AsObject>> {
    try {
      // Get the admin macaroon from storage.
      const macaroon = this.getMacaroonFromStorage();
      if (!macaroon) return;
      const paymentHash64 = Buffer.from(paymentHash, 'hex').toString("base64")
      const result = await this.httpService.request({
        method: 'GET',
        baseURL: url,
        url: `/v2/router/track/${paymentHash64}`,
        headers: {
          "Grpc-Metadata-macaroon": macaroon,
          'Content-Type': 'application/json'
        },
        params: { no_inflight_updates: noInflightUpdates },
      });

      // If payment fails return the failure details.
      if (isErrorStatus(result.status) || result?.data?.result?.status === 'FAILED') {
        return ApiResult.failure("Tracking payment failed.", result.data);
      }
      return ApiResult.success(result.data.result);

    } catch (e) {
      const errorMessage = 
        e?.response?.data?.message ??
        e?.response?.data?.error?.message ?? 
        e.message;
        
      throw new Error(errorMessage);
    }
  }

  /**
   * Opens a new channel to a specified peer with a funding amount and fee rate.
   *
   * @param url The url of the clients node.
   * @param node_pubkey The node we want to open a channel with.
   * @param sat_per_vbyte Fee rate to open a channel, ~2 sat/vByte is a good default.
   * @param local_funding_amount How much Bitcoin we want to open the channel in sats.
   * @param push_sat How many sats we want to give the other party. Default should be 0.
   * @param private If we want the channel private or not.
   * @returns The funding transaction id.
   */
  async openChannel(url: string, nodeId: string, node_pubkey: string, sat_per_vbyte: number, local_funding_amount: number, push_sat: number, privateChannel: boolean): Promise<ChannelPoint.AsObject> {
    // Get the macaroon
    const macaroon = this.getMacaroonFromStorage();

    // Fix me. Ignores certificates
    const agent = new https.Agent({ rejectUnauthorized: false });

    const body = { node_pubkey_string: node_pubkey, sat_per_vbyte: sat_per_vbyte, local_funding_amount: local_funding_amount, push_sat: push_sat, private: privateChannel };

    const result = await this.httpService.post(url, body, {
      url: "/v2/router/send",
      httpsAgent: agent,
      headers: {
        "Grpc-Metadata-macaroon": macaroon
      }
    });

    // If payment fails return the failure details.
    if (isErrorStatus(result.status)) {
      return;
    }

    // Update the node doc with the channel id
    await this.updateNodeDoc(nodeId, { outgoingChannelId: result.data.funding_txid_str });

    return result.data;
  }

  /**
   * Removes the macaroon from local storage.
   */
  removeMacaroonFromStorage() {
    return localStorageHelper.removeItem("admin_macaroon");
  }

  /**
   * Gets the macaroon from local storage.
   */
  getMacaroonFromStorage(): string {
    return localStorageHelper.getItem("admin_macaroon");
  }
}
