import { createMock } from "ts-auto-mock";
import { ExternalOnboardService } from "./ExternalNodeOnboardingService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LndService } from "../../lnd/services/LndService";
import { EnvironmentVariables } from "../../../../env";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { GetInfoResponse } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { HttpService } from "@blockspaces/shared/services/http";
import { LightningNodeReference, ExternalLightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";

describe(ExternalOnboardService, () => { 
  let onboardService: ExternalOnboardService;
  let db: ConnectDbDataContext;
  let lndService: LndService;
  let env: EnvironmentVariables;
  let logger: ConnectLogger;
  let http: HttpService;
  let mockedNodeDoc: LightningNodeReference;

  beforeEach(() => {
    mockedNodeDoc = createMock<LightningNodeReference>();
    db = createMock<ConnectDbDataContext>();
    lndService = createMock<LndService>();
    env = createMock<EnvironmentVariables>();
    logger = createMock<ConnectLogger>();
    http = createMock<HttpService>();
    onboardService = new ExternalOnboardService(db, lndService, env, logger, http);

  });

  describe(`heyhowareya`, () => {
    it(ExternalLightningOnboardingStep.NodeNotAssigned, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.NodeNotAssigned);
    }, 10000);

    it(ExternalLightningOnboardingStep.NodeNotInitialized, async () => {
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      lndService.getInfo = jest.fn().mockResolvedValue({ message: "wallet not created" });
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.NodeNotInitialized);
    }, 10000);

    it(ExternalLightningOnboardingStep.NodeApiIsDown, async () => {
      mockedNodeDoc.bscMacaroon = 'macaroon';
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      lndService.getInfo = jest.fn().mockResolvedValue(null);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.NodeApiIsDown);
    }, 10000);

    it(ExternalLightningOnboardingStep.NoReadOnlyMac, async () => {
      mockedNodeDoc.bscMacaroon = null;
      lndService.getInfo = jest.fn().mockResolvedValue(true);
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.NoReadOnlyMac);
    }, 10000);

    it(ExternalLightningOnboardingStep.MacHasWrongPermission, async () => {
      mockedNodeDoc.bscMacaroon = 'asdfjklasdf';
      lndService.checkMacaroonPermissions = jest.fn().mockResolvedValue(false);
      lndService.getInfo = jest.fn().mockResolvedValue(true);
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.MacHasWrongPermission);
    }, 10000);

    it(ExternalLightningOnboardingStep.BirthdayNotSet, async () => {
      mockedNodeDoc.bscMacaroon = 'macaroon';
      mockedNodeDoc.nodeBirthday = null;
      lndService.checkMacaroonPermissions = jest.fn().mockResolvedValue(true);
      lndService.getInfo = jest.fn().mockResolvedValue(true);
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.BirthdayNotSet);
    }, 10000);

    it(ExternalLightningOnboardingStep.ImDoingGood, async () => {
      mockedNodeDoc.bscMacaroon = 'macaroon';
      mockedNodeDoc.nodeBirthday = new Date();
      db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockedNodeDoc);
      lndService.checkMacaroonPermissions = jest.fn().mockResolvedValue(true);
      // @ts-ignore
      lndService.getInfo = jest.fn().mockResolvedValue(createMock<GetInfoResponse.AsObject>({synced_to_chain: true, synced_to_graph: true}));
      lndService.getPendingChannelsList = jest.fn().mockResolvedValue({pending_open_channels: []})
      lndService.getChannelsList = jest.fn().mockResolvedValue({channels: ["channel"]})
      // lndService.getBitcoinTransactions = jest.fn().mockResolvedValue(["utxo"]);
      const heyhowareya = await onboardService.heyhowareya("fake-tenant-id");
      expect(heyhowareya).toEqual(ExternalLightningOnboardingStep.ImDoingGood);
    }, 10000);
  });
});