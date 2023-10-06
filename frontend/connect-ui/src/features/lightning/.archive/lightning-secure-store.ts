import { GenSeedResponseDto } from "@blockspaces/shared/dtos/lightning";
import { InitNodeResponseDto } from "@blockspaces/shared/dtos/lightning/init-node";
import { LightningNodeReference } from '@blockspaces/shared/models/lightning/Node';
import { ChannelPoint, Payment } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { makeAutoObservable } from "mobx";
import { DataStore, IDataStore } from "src/platform/api";
import { LightningSecureTransport } from "@lightning/api";
import { UnlockNodeResponse } from "@blockspaces/shared/dtos/lightning/unlock-node";

export class LightningSecureStore implements IDataStore {
  dataStore: DataStore;
  nodeData: LightningNodeReference;

  constructor(dataStore: DataStore, private readonly transport: LightningSecureTransport = LightningSecureTransport.instance) {
    makeAutoObservable(this);
    this.dataStore = dataStore;
  }

  reset() { }
  /**
   * Add new LightningNode to mongo
   *
   * @param tenantId
   * @returns Promise<LightningNodeReference>
   */
  async getNodeDoc(tenantId: string): Promise<LightningNodeReference> {
    const result = await this.transport.getNodeDoc(tenantId);
    this.nodeData = result.data;
    return result.data;
  }

  /**
   * Queries MongoDB for a node in the `lightningnodes` collection for a node with only the `apiEndpoint` and `nodeId` properties.
   * This then claims the node for the user with their tenant id to continue the onboarding process.
   *
   * @throws Returns null if there is no node available.
   * @returns A node document that is now tied to the users tenant id.
   */
  async findOrClaimNodeForUser(): Promise<LightningNodeReference> {
    const result = await this.transport.claimNodeForUser()
    return result
  }

  /**
   * Add new LightningNode to mongo
   *
   * @param tenantId
   * @returns Promise<LightningNodeReference>
   */
  async createNodeDoc(tenantId: string): Promise<LightningNodeReference> {
    const result = await this.transport.createNodeDoc(tenantId);
    this.nodeData = result.data;
    return result.data;
  }

  /**
   * Update a node document when information of type @link `LightningNodeReference` needs updated.
   * Query should be a JSON object of { key: value }, ex. { bscMacaroon: <macaroon> }
   *
   * @param patch An object to update a node document
   */
  async updateNode(nodeId: string, patch: Partial<LightningNodeReference>): Promise<LightningNodeReference> {
    const result = await this.transport.updateNodeDoc(nodeId, patch);
    return result.data;
  }

  /**
   * Generates a 24 word seed phrase to be used to initialize a node.
   *
   * @returns A 24 word mnemonic.
   */
  async generateSeedPhrase(url: string): Promise<GenSeedResponseDto> {
    const result = await this.transport.generateSeedPhrase(url);
    return result;
  }

  /**
   * Unlocks the user's node if it is in a locked state.
   *
   * @returns Status unlocked or locked
   */
  async unlockNode(url: string, password: string): Promise<UnlockNodeResponse> {
    const result = await this.transport.unlockNode(url, password);
    return result;
  }

  /**
   * Initialize the node with a wallet and connect to the network.
   *
   * @param seedPhrase The seed phrase generated from @link `generateSeedPhrase`
   * @param password The wallet password for the node
   * @returns The admin macaroon to be used for requests when the node wallet is unlocked.
   */
  async initializeNodeAndStoreMac(url: string, seedPhrase: string[], password: string): Promise<InitNodeResponseDto> {
    const result = await this.transport.initializeNodeAndStoreMac(url, seedPhrase, password);
    return result;
  }

  async generateBscMacAndUpdateDocWithPubkey(url: string, nodeId: string) {
    const result = await this.transport.generateBscMacAndUpdateDocWithPubkey(url, nodeId)
    return result
  }

  /**
   * Takes in an unencrypted macaroon and encrypts it with the node password
   * before sending it to the vault.
   *
   * @param user The current logged in user making the request.
   * @param macaroon The encrypted macaroon to store.
   * @returns The `macaroonId` that is stored in the MongoDB node collection.
   */
  async storeMacaroonInVault(macaroon: string, password: string): Promise<string> {
    const result = await this.transport.storeMacaroonInVault(macaroon, password);
    return result.data;
  }

  /**
   * If mac is in local storage, returns mac.
   * Otherwise, get the encrypted macaroon from vault, decrypts it, then stores it in local storage. 
   *
   * @param user The current logged in user making the request.
   * @returns The encrypted macaroon stored in vault.
   */
  async getMacaroon(password: string): Promise<string> {
    const mac = this.getMacaroonFromStorage();
    if (mac) return mac;
    if (!password) {
      console.warn('Password Missing, Call will fail');
    }
    const result = await this.transport.getMacaroonFromVault(password);
    return result;
  }

  /**
   * Generate the BSC macaroon which gives `core` access to readonly/invoice information.
   *
   * @param url The url of the clients node.
   * @returns Boolean if it was generated and stored in the node collection.
   */
  async generateBscMacaroon(url: string): Promise<string> {
    const result = await this.transport.generateBscMacaroon(url);
    return result;
  }

  /**
   * Pays a BOLT 11 invoice.
   *
   * @param paymentRequest The BOLT 11 payment request to pay.
   * @param feeLimitPercent The maximum percent of the payment that can be charged for a fee. (default 1)
   * @returns GRPC stream of the payment events. (IN FLIGHT | SUCCESS | CANCELLED)
   */
  async payBolt11Invoice(url: string, paymentRequest: string, feeLimitPercent: number = 1): Promise<Payment.AsObject> {
    const result = await this.transport.payBolt11Invoice(url, paymentRequest, feeLimitPercent);
    return result?.data;
  }

  /**
   * Track a BOLT 11 invoice.
   *
   * @param paymentHash The payment hash of the invoice payment request to pay.
   * @param noInflightUpdates return JUST the final htlc update.
   * 
   * @returns res 
   */
  async trackBolt11Invoice(url: string, paymentHash: string, noInflightUpdates: boolean = true): Promise<Payment.AsObject> {
    const result = await this.transport.trackBolt11(url, paymentHash, noInflightUpdates);
    return result.data;
  }

  /**
   * Opens a new channel to a specified peer with a funding amount and fee rate.
   *
   * @param node_pubkey The node we want to open a channel with.
   * @param sat_per_vbyte Fee rate to open a channel, ~2 sat/vByte is a good default.
   * @param local_funding_amount How much Bitcoin we want to open the channel in sats.
   * @param push_sat How many sats we want to give the other party. Default should be 0.
   * @param private If we want the channel private or not.
   * @returns The funding transaction id.
   */
  async openChannel(url: string, nodeId: string, node_pubkey: string, sat_per_vbyte: number, local_funding_amount: number, push_sat: number, privateChannel: boolean): Promise<ChannelPoint.AsObject> {
    const result = await this.transport.openChannel(url, nodeId, node_pubkey, sat_per_vbyte, local_funding_amount, push_sat, privateChannel);
    return result;
  }

  /**
   * Removes the macaroon from local storage.
   */
  removeMacaroonFromStorage() {
    this.transport.removeMacaroonFromStorage();
  }

  /**
   * Gets the macaroon from local storage.
   */
  getMacaroonFromStorage(): string {
    return this.transport.getMacaroonFromStorage();
  }
}

// Creating node doc + retrieving node doc without having to pass tenantId + nodeId + url
