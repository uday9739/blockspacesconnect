import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { LndService } from "../../lnd/services/LndService";
import { ExternalLightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { SecretService } from "../../../../secrets/services/SecretService";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_LOGGER_TOKEN } from "../../../../logging/constants";
import { EnvironmentVariables, ENV_TOKEN } from "../../../../env";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { HttpService } from "@blockspaces/shared/services/http";
import { isDate } from "class-validator";

// https://blockspaces.atlassian.net/wiki/spaces/BSC/pages/268206081/On-boarding+Flow
@Injectable()
export class ExternalOnboardService {
  /**
   * Constructor for {@link ExternalOnboardService}
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
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(forwardRef(() => HttpService))
    private readonly http: HttpService
  ) {
    logger.setModule(this.constructor.name);
  }

  createNodeDoc = async (tenantId: string, macaroon: string, endpoint: string, certificate: string): Promise<LightningNodeReference> => {
    const createNode: LightningNodeReference = {
      nodeId: uuidv4(),
      tenantId: tenantId,
      bscMacaroon: macaroon,
      apiEndpoint: endpoint,
      cert: certificate,
      nodeBirthday: new Date(),
      external: true
    };
    try {
      const res = await this.db.lightningNodes.create(createNode);
      return res;
    } catch (e) {
      this.logger.error(`Could not create the external Node: ${createNode.nodeId}`, e, {data: e.stack});
      return null; 
    }
  };

  /**
   * Status check for a user's lightning node in LNC. Called by the frontend
   * whenever a lightning resource is accessed. The frontend uses the result of this
   * function to redirect a user to the appropriate onboarding step
   *
   * @param tenantId string
   * @returns Promise {@link ApiResult<ExternalLightningOnboardingStep>}
   */
  heyhowareya = async (tenantId: string): Promise<ExternalLightningOnboardingStep> => {
    try {
      // Check 1a: A user's tenantId should appear on a node document.
      const node = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: { $exists: false }, external: true });
      if (!node) return ExternalLightningOnboardingStep.NodeNotAssigned;
      // Check 1b: If a node is assigned to a tenantId, then the node should be initialized.
      const status = await this.lndService.getInfo(tenantId);
      if (status && status["message"] && status["message"].startsWith("wallet locked")) return ExternalLightningOnboardingStep.Locked;
      if (status && status["message"] && status["message"].startsWith("wallet not created")) return ExternalLightningOnboardingStep.NodeNotInitialized;

      // Check 2: If there is no read only macaroon. This is not good and should not happen.
      if (!node.bscMacaroon) return ExternalLightningOnboardingStep.NoReadOnlyMac;

      // Check 3: If we can hit an endpoint on the node.
      const info = await this.lndService.getInfo(tenantId);
      if (!info) return ExternalLightningOnboardingStep.NodeApiIsDown;

      // check 4: If the readonly macaroon has the correct permissions
      // $ lncli bakemacaroon onchain:read info:read offchain:read invoices:read macaroon:read
      const macaroonInfo = await this.lndService.checkMacaroonPermissions(node.bscMacaroon, node.apiEndpoint, node.cert);
      if (!macaroonInfo) return ExternalLightningOnboardingStep.MacHasWrongPermission;

      // check 5: Check if the node birthday has been set 
      const birthday = node.nodeBirthday;
      if (!isDate(birthday)) return ExternalLightningOnboardingStep.BirthdayNotSet;

      // Check 6: Everything passes, node is doing great.
      return ExternalLightningOnboardingStep.ImDoingGood;
    } catch (e) {
      this.logger.error("heyhowareya failed.", e, "tenant Id: " + tenantId);
      return null;
    }
  };
}
