import { OnboardService } from "./LightningOnboardService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { createMock } from "ts-auto-mock";
import { LndService } from "../../lnd/services/LndService";
import { SecretService } from "../../../../secrets/services/SecretService";
import { LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { IUser } from "@blockspaces/shared/models/users";
import { EnvironmentVariables } from "../../../../env";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ChannelOpenUpdate, GetInfoResponse } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { SnsTransportClient } from "../../../../sns-transport/sns-transport-client";
import {of} from "rxjs";
import { HttpService } from "@blockspaces/shared/services/http";

describe(OnboardService, () => { 
  let onboardService: OnboardService;
  let db: ConnectDbDataContext;
  let lndService: LndService;
  let secretService: SecretService;
  let mockedNodeDoc: LightningNodeReference;
  let env: EnvironmentVariables;
  let logger: ConnectLogger;
  let mockedGossipPeers;
  let mockSnsTransportClient: SnsTransportClient;
  let mockedHttp: HttpService

  beforeEach(() => {
    mockedNodeDoc = {
      nodeId: "8fb7c5aa-4e0a-4b92-8418-e0ae3a1e8bb6",
      pubkey: "testing-node",
      tenantId: "fake-tenant-id",
      nodeLabel: "BlockSpaces",
      incomingChannelId: "incoming-channel",
      outgoingChannelId: "outgoing-channel",
      apiEndpoint: "https://test-8080.ln.blockspaces.com",
      bscMacaroon:
        "0201036c6e6402f801030a10a1948843128e3264bfd9dc15fd9499111201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620892ebcd7fab2f23ff8891949120e402c9d8b9d111ed6f9b4c3856ce0b8ef3c5a",
      macaroonId: "macaroon-id",
      cert: "",
      tier: "Professional"
    };
    mockSnsTransportClient = createMock<SnsTransportClient>();
    mockedGossipPeers = {
      res1: createMock<ChannelOpenUpdate.AsObject>(),
      res2: createMock<ChannelOpenUpdate.AsObject>()
    }
    db = createMock<ConnectDbDataContext>();
    lndService = createMock<LndService>();
    secretService = createMock<SecretService>();
    env = createMock<EnvironmentVariables>();
    logger = createMock<ConnectLogger>();
    mockedHttp = createMock<HttpService>();
    onboardService = new OnboardService(db, lndService, secretService, env, logger, mockSnsTransportClient, mockedHttp);
  });

  describe(`heyhowareya`, () => {
    it(LightningOnboardingStep.NodeNotAssigned, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NodeNotAssigned);
    }, 10000);

    it(LightningOnboardingStep.NodeNotInitialized, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      lndService.getInfo = jest.fn().mockResolvedValue({ message: "wallet not created" });
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NodeNotInitialized);
    }, 10000);

    it(LightningOnboardingStep.NoAdminMacInNodeDoc, async () => {
      mockedNodeDoc.macaroonId = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NoAdminMacInNodeDoc);
    }, 10000);

    it(LightningOnboardingStep.NoAdminMacInVault, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue(null);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NoAdminMacInVault);
    }, 10000);

    it(LightningOnboardingStep.MismatchedAdminMac, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id-two" });
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.MismatchedAdminMac);
    }, 10000);

    it(LightningOnboardingStep.NoReadOnlyMac, async () => {
      mockedNodeDoc.bscMacaroon = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NoReadOnlyMac);
    }, 10000);

    it(LightningOnboardingStep.NodeApiIsDown, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      lndService.getInfo = jest.fn().mockResolvedValue(null);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NodeApiIsDown);
    }, 10000);

    // it(LightningOnboardingStep.BitcoinNotDeposited, async () => {
    //   db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
    //   secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
    //   lndService.getInfo = jest.fn().mockResolvedValue({});
    //   onboardService.addGossipPeers = jest.fn().mockResolvedValue({success: true, res1: mockedGossipPeers.res1, res2: mockedGossipPeers.res2 })
    //   lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: []})
    //   lndService.getChannelsList = jest.fn().mockResolvedValue({channels: [{}]})
    //   lndService.getBitcoinTransactions = jest.fn().mockResolvedValue([]);
    //   const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
    //   expect(heyhowareya).toEqual(LightningOnboardingStep.BitcoinNotDeposited);
    // }, 10000);

    // it(LightningOnboardingStep.NoOutboundChannelOpened, async () => {
    //   mockedNodeDoc.outgoingChannelId = null;
    //   db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
    //   secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
    //   lndService.getInfo = jest.fn().mockResolvedValue({});
    //   lndService.getBitcoinTransactions = jest.fn().mockResolvedValue({ transactions: ["utxo"] });
    //   const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
    //   expect(heyhowareya).toEqual(LightningOnboardingStep.NoOutboundChannelOpened);
    // }, 10000);

    it(LightningOnboardingStep.NotSyncedToChain, async () => {
      mockedNodeDoc.incomingChannelId = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: false, synced_to_graph: false})) 
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id")
      expect(heyhowareya).toEqual(LightningOnboardingStep.NotSyncedToChain)
    })

    it(LightningOnboardingStep.NoPeers, async () => {
      mockedNodeDoc.incomingChannelId = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: true, synced_to_graph: false})) 
      onboardService.addGossipPeers = jest.fn().mockResolvedValue(null)
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id")
      expect(heyhowareya).toEqual(LightningOnboardingStep.NoPeers)
    })

    it(LightningOnboardingStep.NotSyncedToGraph, async () => {
      mockedNodeDoc.incomingChannelId = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: true, synced_to_graph: false})) 
      onboardService.addGossipPeers = jest.fn().mockResolvedValue({success: true, res1: mockedGossipPeers.res1, res2: mockedGossipPeers.res2 })
      lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: []})
      lndService.getChannelsList = jest.fn().mockResolvedValue({channels: ["channel"]})
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id")
      expect(heyhowareya).toEqual(LightningOnboardingStep.NotSyncedToGraph)
    })

    it(LightningOnboardingStep.NoInboundChannelOpened, async () => {
      mockedNodeDoc.incomingChannelId = null;
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: true, synced_to_graph: true}));
      onboardService.addGossipPeers = jest.fn().mockResolvedValue({success: true, res1: mockedGossipPeers.res1, res2: mockedGossipPeers.res2 })
      lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: []})
      lndService.getChannelsList = jest.fn().mockResolvedValue({channels: []})
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.NoInboundChannelOpened);
    }, 10000);

    it(LightningOnboardingStep.ImDoingGood, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      secretService.read = jest.fn().mockResolvedValue({ credentialId: "macaroon-id" });
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: true, synced_to_graph: true}));
      onboardService.addGossipPeers = jest.fn().mockResolvedValue({success: true, res1: mockedGossipPeers.res1, res2: mockedGossipPeers.res2 })
      lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: []})
      lndService.getChannelsList = jest.fn().mockResolvedValue({channels: ["channel"]})
      // lndService.getBitcoinTransactions = jest.fn().mockResolvedValue(["utxo"]);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(LightningOnboardingStep.ImDoingGood);
    }, 10000);
  });

  /**
   * getUnclaimedNode()
   */
  describe(`getUnclaimedNode`, () => {
    it("should return null when Node is not found", async () => {
      db.lightningNodes.findOne = jest.fn().mockRejectedValue(null);
      try {
        await onboardService.getUnclaimedNode();
      } catch (e) {
        expect(e).toBeNull()
      }
    }, 10000);
    it("should return when http call suceeds", async () => {
      const node = createMock<LightningNodeReference>();
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(node);
      const response = await onboardService.getUnclaimedNode();
      expect(response).toMatchObject(node);
    }, 10000);
  });

  /**
   * findOrClaimNodeForUser()
   */
  describe(`findOrClaimNodeForUser`, () => {
    it("should return when node is already assigned", async () => {
      mockSnsTransportClient.send = jest.fn().mockImplementation(()=>{
        return of({
          $metadata: {
            httpStatusCode: 200,
          },
          MessageId: "8b0c0a08-1f99-5d8e-9e76-565c97327e80"
        })
      });
      const node = createMock<LightningNodeReference>({tenantId: "tenant-id"});
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(node);
      db.userNetworks.find = jest.fn().mockResolvedValue([{}]);
      db.userNetworks.findOne = jest.fn().mockResolvedValue({billingTier: ''});
      db.billingTier.findOne = jest.fn().mockResolvedValue({});
      const user: IUser = createMock<IUser>()
      user.tenants = ['tenant-id']
      const response = await onboardService.findOrClaimNodeForUser(user);
      expect(response).toMatchObject(node);
    }, 10000);
    it("should return when node is properly assigned.", async () => {
      mockSnsTransportClient.send = jest.fn().mockImplementation(()=>{
        return of({
          $metadata: {
            httpStatusCode: 200,
          },
          MessageId: "8b0c0a08-1f99-5d8e-9e76-565c97327e80"
        })
      });
      const node = createMock<LightningNodeReference>();
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      onboardService.getUnclaimedNode = jest.fn().mockResolvedValue(node);
      db.lightningNodes.findOneAndUpdate = jest.fn().mockResolvedValue(node)
      db.userNetworks.find = jest.fn().mockResolvedValue([{}]);
      db.userNetworks.findOne = jest.fn().mockResolvedValue({billingTier: ''});
      db.billingTier.findOne = jest.fn().mockResolvedValue({});
      const response = await onboardService.findOrClaimNodeForUser(createMock<IUser>());
      expect(response).toMatchObject(node);
    }, 10000);
    it("should throw error when Node is not found", async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      onboardService.getUnclaimedNode = jest.fn().mockResolvedValue(null);
      db.userNetworks.find = jest.fn().mockResolvedValue([{}]);
      db.userNetworks.findOne = jest.fn().mockResolvedValue({billingTier: ''});
      db.billingTier.findOne = jest.fn().mockResolvedValue({});
      const response = await onboardService.findOrClaimNodeForUser(createMock<IUser>());
      expect(response).toBeNull();
    }, 10000);
  });

  describe("requestInboundChannel", () => {
    it("should open a channel", async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const getBenInfo = jest.spyOn(onboardService as any, "getBenInfo");
      getBenInfo.mockReturnValue({macaroon: "macaroon", endpoint: "https://endpoint.com"});
      lndService.openChannel = jest.fn().mockResolvedValue({});
      lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: [{channel: {channel_point: "channel-point"}}]})
      db.lightningNodes.findOneAndUpdate = jest.fn().mockResolvedValue({...mockedNodeDoc, incomingChannelId: "channel-point"});
      const result = await onboardService.requestChannelOpen("tenant-id", 1, false);
      expect(result).toEqual({...mockedNodeDoc, incomingChannelId: "channel-point"});
    })
    it("channel open fails", async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const getBenInfo = jest.spyOn(onboardService as any, "getBenInfo");
      getBenInfo.mockReturnValue({macaroon: "macaroon", endpoint: "https://endpoint.com"});
      lndService.openChannel = jest.fn().mockRejectedValue(null);
      const result = await onboardService.requestChannelOpen("tenant-id", 1, false);
      expect(result).toBeNull();
    })
  })

  /**
   * requestNodeProvisioning()
   */
  describe(`requestNodeProvisioning`, () => {
    it("should send request for node", async () => {
      mockSnsTransportClient.send = jest.fn().mockImplementation(()=>{
        return of({
          $metadata: {
            httpStatusCode: 200,
          },
          MessageId: "8b0c0a08-1f99-5d8e-9e76-565c97327e80"
        });
      });
      const response = await onboardService.requestNodeProvisioning();
      expect(response.$metadata.httpStatusCode).toEqual(200);
      expect(response.MessageId).toEqual("8b0c0a08-1f99-5d8e-9e76-565c97327e80");
    }, 10000);
    it("should throw error when request fails", async () => {
      mockSnsTransportClient.send = jest.fn().mockImplementation(()=>{
        return of({
          $metadata: {
            httpStatusCode: 500,
          },
          MessageId: null
        });
      });
      const response = await onboardService.requestNodeProvisioning();
      expect(response).toBeNull();
    }, 10000);
  });
});
