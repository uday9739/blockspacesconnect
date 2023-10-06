import { IUser } from "@blockspaces/shared/models/users";
import {Body, Controller, Get, HttpStatus, Inject, Post, Query} from "@nestjs/common";
import { User } from "../../../../users";
import { OnboardService} from "../services/LightningOnboardService";
import { ExternalLightningOnboardingStep, LightningNodeReference, LightningNodeTier, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { returnErrorStatus } from "../../../../exceptions/utils";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import {AdminOnly} from "../../../../auth/decorators/AdminOnly.decorator";
import { ExternalOnboardService } from "../services/ExternalNodeOnboardingService";

@Controller("/networks/lightning/onboard")
export class OnboardController {

  /**
   * Constructor for {@link OnboardController}
   * @param onboardService {@link OnboardService}
   */
  constructor(
    private readonly onboardService: OnboardService,
    private readonly externalOnboardService: ExternalOnboardService
  ) { }

  /**
   * Send request to provision a lightning node
   * @param user Authenticated {@link IUser}
   * @returns Promise {@link ApiResult<any>}
   */

  // No Longer used... this is now handled by the lightning node provisioner
  @Post("/provision-node")
  @AdminOnly()
  async provisionNode(@User() user: IUser): Promise<ApiResult<any>>  {
    const provisionNode = await this.onboardService.requestNodeProvisioning();
    if (!provisionNode) {
      returnErrorStatus(HttpStatus.INTERNAL_SERVER_ERROR, ApiResult.failure(`Provisioning request failed`));
    }
    return ApiResult.success(provisionNode);
  }

  /**
   * Finds user's lightning node if user has node 
   * OR claims a fresh lightning node from the node pool.
   * @param user Authenticated {@link IUser}
   * @returns Promise {@link ApiResult<LightningNodeReference>}
   */
  @Get("/claim-node")
  async findOrClaimNodeForUser(@User() user: IUser): Promise<ApiResult<LightningNodeReference>> {
    const claimedNode = await this.onboardService.findOrClaimNodeForUser(user);
    if (!claimedNode) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Node pool empty`));
    }
    return ApiResult.success(claimedNode);
  }

  @Post("/reset-node")
  @AdminOnly()
  async resetNode(@User() user: IUser): Promise<ApiResult<string>> {
    const resetNode = await this.onboardService.resetNode(user)
    if (!resetNode) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, ApiResult.failure("Node not reset"))
    }
    return ApiResult.success("reset")
  }

  /**
   * Checks the status/health of a user's lightning node.
   * @param user Authenticated {@link IUser}
   * @returns Promise {@link ApiResult<LightningOnboardingStep>} 
   */
  @Get("/heyhowareya")
  async heyhowareya(@User() user: IUser): Promise<ApiResult<LightningOnboardingStep>> {
    const howareya = await this.onboardService.heyhowareya(user.activeTenant?.tenantId);
    if (!howareya) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to ask heyhowareya: ${user.activeTenant?.tenantId}`))
    }
    return ApiResult.success(howareya);
  }

  /**
   * Requests inbound liquidity for client node 
   * 
   * @param user Authenticated {@link IUser}
   * @param body {@link { channelSize: number, satsPerVbyte: number, isPrivate: boolean }}
   * @returns Promise {@link ...} 
   */
  @Post("/request-inbound")
  async requestChannelOpen(@User() user: IUser, @Body() body: { satsPerVbyte: number, isPrivate: boolean, }): Promise<any> {
    const result = await this.onboardService.requestChannelOpen(user.activeTenant?.tenantId, body.satsPerVbyte, body.isPrivate);
    if (!result) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to request inbound: ${user.activeTenant?.tenantId}`), {log: false});
    }
    return ApiResult.success(result);
  }
  /**
   * Adds peer from BEN to client node
   * 
   * @param user Authenticated {@link IUser}
   * @returns Promise {@link ...}
   */
  @Post("/add-peers")
  async addPeers(@User() user: IUser): Promise<any> {
    const result = await this.onboardService.addGossipPeers(user.activeTenant?.tenantId); 
    if (!result) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to add peers: ${user.activeTenant?.tenantId}`, {log: false}));
    }
    return ApiResult.success(result);
  }

  /**
   * Creates a node doc for external lightning nodes
   *  
   * @param user Authenticated {@link IUser} 
   * @param body Promise {@link { macaroon: string, endpoint: string }} 
   * @returns 
   */
  @Post("external/create")
  async addExternalNode(
    @User() user: IUser, 
    @Body() body: { macaroon: string, endpoint: string, certifcate: string }
  ): Promise<any> {
    const result = await this.externalOnboardService.createNodeDoc(
      user.activeTenant?.tenantId,
      body.macaroon,
      body.endpoint,
      body.certifcate
    );  
    if (!result) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, ApiResult.failure(`Failed to create external node: ${user.activeTenant?.tenantId}`), {log: false});
    }
    return ApiResult.success(result);
  }

  /**
   * Checks the status/health of a user's lightning node.
   * @param user Authenticated {@link IUser}
   * @returns Promise {@link ApiResult<LightningOnboardingStep>} 
   */
  @Get("external/heyhowareya")
  async externalHeyhowareya(@User() user: IUser): Promise<ApiResult<ExternalLightningOnboardingStep>> {
    const howareya = await this.externalOnboardService.heyhowareya(user.activeTenant?.tenantId);
    if (!howareya) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to ask heyhowareya: ${user.activeTenant?.tenantId}`));
    }
    return ApiResult.success(howareya);
  }


}