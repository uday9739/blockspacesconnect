import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { IUser } from "@blockspaces/shared/models/users";
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { E2eAuthGuard } from "../../auth/guards/e2eAuthGuard";
import { User } from "../../users";
import { ValidRoute } from "../../validation";
import { E2eService } from "../services/E2eService";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

@UseGuards(E2eAuthGuard)
@Controller("e2e")
export class E2eController {
  constructor(private readonly e2eService: E2eService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly db: ConnectDbDataContext) {
    logger.setModule(this.constructor.name);
  }

  @Get("resetE2ENode")
  @ValidRoute()
  async resetE2ENode(@User() user: IUser): AsyncApiResult<string> {
    try {
      return await this.e2eService.resetTestNode(user);
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @Get("blocks")
  @ValidRoute()
  async gen6Blocks(@User() user: IUser): AsyncApiResult<string> {
    try {
      return await this.e2eService.gen6Blocks(user);
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @Post("payment")
  @ValidRoute()
  async payment(@Body() data: { payment_request: string, timeout_seconds: Number }, @User() user: IUser): AsyncApiResult<boolean> {
    try {
      return await this.e2eService.paymentRequest(data, user);
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @Get("invoice")
  @ValidRoute()
  async createInvoice(@User() user: IUser): AsyncApiResult<any> {
    try {
      return await this.e2eService.createInvoice(user);
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @Get("notification")
  @ValidRoute()
  async createUserNotification(@User() user: IUser): AsyncApiResult<any> {
    try {
      const test = await this.e2eService.createUserNotification(user);
      return test;
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @Post("purgeE2E")
  @ValidRoute()
  async purgeE2E(@Body() data: string[], @User() user: IUser): AsyncApiResult<string[]> {
    try {
      return await this.e2eService.purgeE2E(data);
    } catch (error: any) {
      this.logger.debug(error.message, error, user);
      return ApiResult.failure(error);
    }
  }

  @ValidRoute()
  @Post('toggle-maintenance-mode')
  async setSystemFeatureFlag(@Body("value") value: boolean) {
    const sysData = await this.db.systemMaintenance.findAll();

    const maintenanceMode = sysData.find(x => x["maintenance"] !== undefined);

    await this.db.systemMaintenance.updateByIdAndSave(maintenanceMode.id, {
      maintenance: value
    });


    return maintenanceMode;

  }
}
