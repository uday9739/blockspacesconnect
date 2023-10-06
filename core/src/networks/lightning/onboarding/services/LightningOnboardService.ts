import { LightningNodeReference, LightningNodeTiers } from "@blockspaces/shared/models/lightning/Node";
import { forwardRef, Inject, Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { LndService } from "../../lnd/services/LndService";
import { LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { SecretService } from "../../../../secrets/services/SecretService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { IUser } from "@blockspaces/shared/models/users";
import { EnvironmentVariables, ENV_TOKEN } from "../../../../env";
import { AddPeerDto, OpenChannelDto } from "@blockspaces/shared/dtos/lightning";
import { PendingChannelsResponse } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { SnsTransportClient } from "../../../../sns-transport/sns-transport-client";
import { catchError, firstValueFrom } from 'rxjs';
import { NetworkId } from "@blockspaces/shared/models/networks";
import { HttpService } from "@blockspaces/shared/services/http";
import { BillingTier } from "@blockspaces/shared/models/network-catalog/Tier";

// https://blockspaces.atlassian.net/wiki/spaces/BSC/pages/268206081/On-boarding+Flow
@Injectable()
export class OnboardService {
  /**
   * Constructor for {@link OnboardService}
   * @param db {@link ConnectDbDataContext}
   * @param lndService {@link LndService}
   * @param secretService {@link SecretService}
   */
  constructor(
    @Inject(forwardRef(() => ConnectDbDataContext))
    private readonly db: ConnectDbDataContext,
    @Inject(forwardRef(() => LndService))
    private readonly lndService: LndService,
    @Inject(forwardRef(() => SecretService))
    private readonly secretService: SecretService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject('SNS_CLIENT') private readonly snsClient: SnsTransportClient,
    @Inject(forwardRef(() => HttpService))
    private readonly http: HttpService
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Returns information about a BlockSpaces' edge node
   * 
   * @param benNum BEN 1 or 2
   * @returns 
   */
  private getBenInfo = async (benNum: number):
    Promise<{ benNum: number; macaroon: string; endpoint: string }> => {
    if (benNum !== 1 && benNum !== 2) throw new Error("Attempted to load invalid NodeId.");
    try {
      // Read Macaroon from env
      const mac = this.env.lightning[`ben${benNum}ChannelMacaroon`];
      const endpoint = this.env.lightning[`ben${benNum}RestEndpoint`];
      return {
        benNum,
        macaroon: mac,
        endpoint
      };
    } catch (e) {
      return null;
    }
  };

  /**
   * Adds client node as a peer for both BENs
   * 
   * @param tenantId 
   * @returns {}
   */
  addGossipPeers = async (tenantId: string) => {
    const clientNode: LightningNodeReference = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false } });
    if (!clientNode) {
      this.logger.error("addGossipPeers failed: User does not have lightning node");
      return null;
    }
    if (!clientNode.pubkey) {
      this.logger.error("addGossipPeers failed: Lightning Node is not initialized");
      return null;
    }
    // HA PROXY ISSUE 
    // alex.ln.blockspaces.com:9735 should be forwarded to --> 143.244.162.128:9741
    // const gossipEndpoint = `143.244.162.128:9741`;
    const gossipEndpoint = clientNode['_doc']?.gossipEndpoint || `${clientNode.apiEndpoint.replace('https://', '')}:9735`;

    const { macaroon: mac2, endpoint: endpoint2 } = await this.getBenInfo(2);
    const { macaroon: mac1, endpoint: endpoint1 } = await this.getBenInfo(1);
    const res1 = await this._addGossipPeer(endpoint1, mac1, clientNode.pubkey, gossipEndpoint);
    const res2 = await this._addGossipPeer(endpoint2, mac2, clientNode.pubkey, gossipEndpoint);
    if (!res1 || !res2) {
      this.logger.error("addGossipPeers failed: Adding peers failed");
      return null;
    }
    return { success: true, res1, res2 };
  };

  private _addGossipPeer = async (
    endpoint: string,
    macaroon: string,
    remotePubkey: string,
    remoteEndpoint: string
  ) => {
    const body: AddPeerDto = {
      addr: {
        pubkey: remotePubkey,
        host: remoteEndpoint
        // LOOK UP PROPER PORT PORT
        // gossip port num
      },
      perm: false, // Persistent peer
      timeout: '3' // request timeout
    };
    const result = await this.lndService.addPeer(endpoint, macaroon, body);
    if (!result) {
      return null;
    }
    return result;
  };

  /**
   * Opens channel from a random BEN node and a client's lightning node
   * TODO: ensure that the peers are added before opening channel.
   *
   * @param tenantId string
   * @param channelSize number
   * @param satsPerVbyte number
   * @param isPrivate boolean
   * @returns
   */
  requestChannelOpen = async (tenantId: string, satsPerVbyte?: number, isPrivate?: boolean) => {
    try {
      const clientNode = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false } });
      if (!clientNode) {
        this.logger.error("requestChannelOpen failed: User does not have lightning node");
        return null;
      }
      if (!clientNode.pubkey) {
        this.logger.error("requestChannelOpen failed: Lightning Node is not initialized");
        return null;
      }
      const clientPubkey = clientNode.pubkey;
      // Step 1 - Randomly select ben and grab env
      // 0 or 1
      const benNum = Math.round(Math.random() + 1);
      const { macaroon, endpoint } = await this.getBenInfo(benNum);
    
      const tier: LightningNodeTiers = LightningNodeTiers.find(o => o.name === clientNode?.tier);
      const channelSize = tier.startingChannelSize || 300_000;
      const body: OpenChannelDto = {
        node_pubkey_string: clientPubkey,
        sat_per_vbyte: satsPerVbyte.toString() || "1",
        local_funding_amount: channelSize.toString(),
        private: isPrivate || false,
        commitment_type: 3, // Anchors
        // zero_conf: true // Zero conf channel
      };
      const result = await this.lndService.openChannel(endpoint, macaroon, body);
      
      if (!result) return null;
      if (result!['code'] === 2) {
        this.logger.error(`requestChannelOpen failed: ${result['message']} - ${result['details']}`);
        return null
      };
      if (body.zero_conf) {
        // TODO: Handle SCID storage for zero confs
        return result;
      }
      // Save channelId for inbound liquidity
      const pendingChannels = await this.lndService.getPendingChannelsList(tenantId);
      const pendingChannelsList = pendingChannels['pending_open_channels'];
      const channelPoint = pendingChannelsList[0]['channel']['channel_point'];
      const updatedDoc = await this.db.lightningNodes.findOneAndUpdate({ tenantId: tenantId, decomissioned: { $exists: false } }, { incomingChannelId: channelPoint });
      // Return open channel res
      return updatedDoc;
    } catch (e) {
      this.logger.error("requestInbound failed", e, "tenantId: " + tenantId);
      return null;
    }
  };


  /**
   * If an unassigned node exists, this function returns an unassigned node.
   *
   * @returns Promise {@link LightningNodeReference}
   */
  getUnclaimedNode = async (): Promise<LightningNodeReference> => {
    const unclaimedNodeParams: Partial<LightningNodeReference> = {
      pubkey: null,
      tenantId: null,
      outgoingChannelId: null,
      incomingChannelId: null,
      bscMacaroon: null,
      macaroonId: null,
      decomissioned: null,
      tier: null,
    };
    const unclaimedNode = await this.db.lightningNodes.findOne(unclaimedNodeParams);
    if (!unclaimedNode) {
      this.logger.error("getUnclaimedNode failed: Node pool empty");
    }
    return unclaimedNode;
  };

  // No Longer used... this is now handled by the lightning node provisioner
  requestNodeProvisioning = async () => {
    try {
      const provisionerResponse = await firstValueFrom(this.snsClient.send('send', JSON.stringify({ category: "lightningNodeConsumed" })).pipe(
        catchError((error) => {
          this.logger.error(error.response.data);
          throw new InternalServerErrorException('Lightning node Provisioner request failed.');
        })));
      if (provisionerResponse.$metadata.httpStatusCode !== 200) {
        throw new InternalServerErrorException('Lightning node Provisioner request failed.');
      }
      return provisionerResponse;
    } catch (e) {
      this.logger.error('Lightning node Provisioner request failed.');
      return null;
    }
  }

  findOrClaimNodeForUser = async (user: IUser): Promise<LightningNodeReference> => {
    const userNetwork = await this.db.userNetworks.findOne({
      userId: user.id,
      networkId: { $in: [NetworkId.LIGHTNING, NetworkId.LIGHTNING_CONNECT] } } );
    if (!userNetwork) throw new BadRequestException("Service not available");
    const billingTierId = userNetwork.billingTier;
    const billingTier = await this.db.billingTier.findOne({ id: billingTierId });
    if (!billingTier) throw new BadRequestException("Service not available - Invalid billing Tier");
    const tier = billingTier as BillingTier;
    try {
      // this.requestNodeProvisioning(); Moved to Task Queue Item
      const existingNode = await this.db.lightningNodes.findOne({ tenantId: user.activeTenant?.tenantId, decomissioned: { $exists: false } });
      if (existingNode) return existingNode;
      const unclaimedNode = await this.getUnclaimedNode();
      if (!unclaimedNode) throw new NotFoundException("Node pool empty");
      const newNode = await this.db.lightningNodes.findOneAndUpdate(
        { nodeId: unclaimedNode.nodeId },
        { tenantId: user.activeTenant?.tenantId, nodeLabel: user.companyName || user.email, tier: tier.code }
      );
      return newNode;
    } catch (e) {
      this.logger.error("findOrClaimNode failed", e, "tenantId: " + user.activeTenant?.tenantId);
      return null;
    }
  };

  resetNode = async (user: IUser): Promise<boolean> => {
    const resetNodeDoc = await this.db.lightningNodes.findOneAndUpdate({tenantId: user.activeTenant?.tenantId}, {
      $unset: { pubkey: true, macaroonId: true, bscMacaroon: true, nodeLabel: true, tenantId: true, incomingChannelId: true, outgoingChannelId: true, tier: true, external: true, nodeBirthday: true }
    });

    if (!resetNodeDoc) return false;

    const nodeName = resetNodeDoc.apiEndpoint.replace("https://", "").replace(".ln.blockspaces.com", "");
    await this.http.get(`${this.env.lightning.testnodeApi}/wipe?name=${nodeName}`);

    // Step 3: Clear all Lightning docs tied to tenantId
    Promise.all([
      await this.db.lightningInvoices.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.lightningQuotes.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.lightningBalances.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.lightningChannelActivity.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.lightningPayments.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.bitcoinInvoices.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.bitcoinQuotes.model.deleteMany({tenantId: user.activeTenant?.tenantId}),
      await this.db.bitcoinTransactions.model.deleteMany({tenantId: user.activeTenant?.tenantId})
    ]);

    return true;
  };

  /**
   * Status check for a user's lightning node in LNC. Called by the frontend
   * whenever a lightning resource is accessed. The frontend uses the result of this
   * function to redirect a user to the appropriate onboarding step
   *
   * @param tenantId string
   * @returns Promise {@link ApiResult<LightningOnboardingStep>}
   */
  heyhowareya = async (tenantId: string): Promise<LightningOnboardingStep> => {
    try {
      // Check 1a: A user's tenantId should appear on a node document.
      const node = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false } });
      if (!node) return LightningOnboardingStep.NodeNotAssigned;
      // Check 1b: If a node is assigned to a tenantId, then the node should be initialized.
      const status = await this.lndService.getInfo(tenantId);
      if (status && status["message"] && status["message"].startsWith("wallet locked")) return LightningOnboardingStep.Locked;
      if (status && status["message"] && status["message"].startsWith("wallet not created")) return LightningOnboardingStep.NodeNotInitialized;

      // Check 2a: If there is no link to an admin macaroon in Vault. This is not good and should not happen but we will still check.
      if (!node.macaroonId) return LightningOnboardingStep.NoAdminMacInNodeDoc;
      // Check 2b: Get the credential id from Vault and verify that we have it stored.
      const secretMacaroon = await this.secretService.read(node.macaroonId, tenantId);
      if (!secretMacaroon) return LightningOnboardingStep.NoAdminMacInVault;
      // Check 2c: Make sure the credential id we have in the Vault is the same as the node document.
      if (node.macaroonId !== secretMacaroon.credentialId) return LightningOnboardingStep.MismatchedAdminMac;

      // Check 3: If there is no read only macaroon. This is not good and should not happen.
      if (!node.bscMacaroon) return LightningOnboardingStep.NoReadOnlyMac;

      // Check 4: If we can hit an endpoint on the node.
      const info = await this.lndService.getInfo(tenantId);
      if (!info) return LightningOnboardingStep.NodeApiIsDown;

      // Check 5: Before we provision liquidity the node has to be in sync with the chain.
      if (!info["synced_to_chain"]) {
        // We want this logged so that we can know when a node is not synced to chain.
        this.logger.warn(`Node: ${node.nodeId} (${node.nodeLabel}) is not synced to the Bitcoin chain.`);
        return LightningOnboardingStep.NotSyncedToChain;
      }

      // Check 6: If we have both edge nodes as gossip peers.
      const peers = await this.addGossipPeers(tenantId);
      if (!peers || !peers.success) return LightningOnboardingStep.NoPeers;

      // Check 8a: If we are opening an inbound channel, we must wait for the channel to become active.
      const pendingChannels: Array<PendingChannelsResponse.PendingOpenChannel.AsObject> = (await this.lndService.getPendingChannelsList(tenantId))['pending_open_channels'];
      const findRes = pendingChannels.find((x) => x.channel['channel_point'] === node.incomingChannelId);
      if (node.incomingChannelId && findRes)
        return LightningOnboardingStep.InboundChannelOpening;

      // Check 8b: If we do not have an inbound channel open, we must wait for an inbound channel.
      const channels = await this.lndService.getChannelsList(tenantId);
      if (channels['channels'].length === 0) return LightningOnboardingStep.NoInboundChannelOpened;

      // Check 7: Assert that the node is synced to graph before making payments or requesting money.
      if (!info["synced_to_graph"]) return LightningOnboardingStep.NotSyncedToGraph;

      /* THIS IS COMMENTED OUT BECAUSE OUTBOUND LOGIC IS NOT PRESENT IN APP **/

      // Check 9: If there is no bitcoin in the node we prompt the user to deposit bitcoin.
      // const bitcoin = await this.lndService.getBitcoinTransactions({ start_height: null, end_height: null, account: "default" }, tenantId);

      // const depositTxns = bitcoin.transactions.filter(x => !x.label || !x.label.startsWith('0:'));
      // const depositTxns = bitcoin.filter(x => !x.label || !x.label.startsWith('0:'));
      // if (depositTxns.length === 0) return LightningOnboardingStep.BitcoinNotDeposited;

      // Check 10: If we do not have an outbound channel open, we must wait for an outbound channel.
      // if (!node.outgoingChannelId) return LightningOnboardingStep.NoOutboundChannelOpened;

      /** END OF BLOCK THAT IS NOT IMPLEMENTED IN APP */
      // Check 11: Everything passes, node is doing great.
      return LightningOnboardingStep.ImDoingGood;
    } catch (e) {

      this.logger.error("heyhowareya failed.", e, "tenant Id: " + tenantId);
      return null;
    }
  };
}
