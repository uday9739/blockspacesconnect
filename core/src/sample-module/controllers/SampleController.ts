import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { AdminOnly } from "../../auth/decorators/AdminOnly.decorator";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { SampleService } from "../services/SampleService";
import { UserFeatureFlags } from "../../users";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { Tenant } from "../../tenants/decorators/Tenant.decorator";
import { Tenant as ITenant } from "@blockspaces/shared/models/tenants";
import { AuthGuard } from "@nestjs/passport";
import { AllowAnonymous } from "../../auth";
import { ApiKeyService } from "../../auth/services/ApiKeyService";
import { WebhookService } from "../../webhooks/services/WebhookService";
import { PaymentReceivedData, WebhookEvent, WebhookEventDto, WebhookSubscription } from "../../../../shared/models/webhooks/WebhookTypes";
import { EventEmitService } from "../../webhooks/services/EventEmitService";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import mongoose from "mongoose";

@Controller('sample')
export class SampleController {
  constructor(private readonly service: SampleService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly apiKeyService: ApiKeyService,
    private readonly webhookService: WebhookService,
    private readonly eventEmitService: EventEmitService,
    private readonly db: ConnectDbDataContext
  ) {
    logger.setModule(SampleController.name);
  }


  @AdminOnly()
  @Get("testBadRequest")
  testBadRequest() {
    this.logger.error("tester bad error from SampleController");
    this.service.testBadRequest();
  }

  @AdminOnly()
  @Get("testBadRequestWithData")
  testBadRequestWithData() {
    this.service.testBadRequestWithData();
  }


  @AdminOnly()
  @Get("testBadRequestWithError")
  testBadRequestWithError() {
    this.service.testBadRequestWithError();
  }

  @AdminOnly()
  @Get("testNotFound")
  testNotFound() {
    this.service.testNotFound();
  }

  @AdminOnly()
  @Get("testValidation")
  testValidation() {
    this.service.testValidation();
  }

  @AdminOnly()
  @Get("testGenericError")
  testGenericError() {
    this.service.testGenericError();
  }

  @AdminOnly()
  @Get("testNullReff")
  testNullReff() {
    this.service.testNullReff(null);
  }

  @Get("testFeatureFlags")
  testFeatureFlags(@UserFeatureFlags() userFeatureFlags: Object) {
    if (userFeatureFlags['featureOne']) {
      return ApiResult.success(true, "This user has featureOne Enabled");
    } else {
      return ApiResult.success(false, "This user has featureOne Disabled");
    }
  }

  @Get("testTenantDecorator")
  testTenantDecorator(@Tenant() tenant: ITenant) {
    return ApiResult.success(tenant, "The user's tenant");
  }

  @Get("testGenerateApiKey")
  async testGenerateApiKey(@Tenant() tenant: ITenant) {
    const apiKeyGenerateResult = await this.apiKeyService.generate('TEST_API', tenant.tenantId, 'Testing API Key', 'An API Key for testing', 'sample');
    return ApiResult.success(apiKeyGenerateResult.data, 'the api key');
  }

  @Get("testApiKey")
  @AllowAnonymous()
  @UseGuards(AuthGuard('api-key'))
  testApiKey(@Tenant() tenant: ITenant) {
    return ApiResult.success(tenant, "The user's tenant");
  }

  @Post("testCreateWebhookSubscription")
  @AllowAnonymous()
  @UseGuards(AuthGuard('api-key'))
  async testCreateWebhookSubscription(@Body() webhookSubscription: WebhookSubscription, @Tenant() tenant: ITenant) {
    webhookSubscription.webhookEndpoint.tenantId = tenant.tenantId;
    await this.webhookService.createWebhookSubscription(webhookSubscription);
    return ApiResult.success(webhookSubscription, 'Webhook Created Successfully');
  }

  @Post("testDeleteWebhookSubscription")
  @AllowAnonymous()
  @UseGuards(AuthGuard('api-key'))
  async testDeleteWebhookSubscription(@Body() webhookSubscription: WebhookSubscription, @Tenant() tenant: ITenant) {
    webhookSubscription.webhookEndpoint.tenantId = tenant.tenantId;
    await this.webhookService.deleteWebhookSubscription(webhookSubscription);
    return ApiResult.success(webhookSubscription, 'Webhook Deleted Successfully');
  }

  @Post("testWebhook")
  // @AllowAnonymous()
  // @UseGuards(AuthGuard('api-key'))
  async testWebhook(@Body() body: WebhookEventDto, @Tenant() tenant: ITenant) {
    const webhookEvent: WebhookEvent = {
      ...body,
      eventTimestamp: new Date().toISOString(),
      tenantId: tenant.tenantId
    };
    await this.webhookService.triggerWebhooks(webhookEvent);
    return ApiResult.success(webhookEvent, 'Webhook Triggered');
  }

  @Post("emitEvent")
  // @AllowAnonymous()
  // @UseGuards(AuthGuard('api-key'))
  async testEmitEvent(@Body() body: PaymentReceivedData, @Tenant() tenant: ITenant) {
    const result = await this.eventEmitService.emitPaymentReceived(tenant.tenantId, body);
    if (result.status === ApiResultStatus.Failed) {
      return result;
    }
    return ApiResult.success(result.data, 'Event Emitted');
  }

  @Post("react-query-mutation")
  async reactQueryMutation(@Body() body: Object) {
    return ApiResult.success(body)
  }

  @Get('maintenance-mode')
  async setSystemFeatureFlag() {
    const sysData = await this.db.systemMaintenance.findAll();

    const maintenanceMode = sysData.find(x => x["maintenance"] !== undefined);

    await this.db.systemMaintenance.updateByIdAndSave(maintenanceMode.id, {
      maintenance: !maintenanceMode.maintenance
    });


    return maintenanceMode;
  }
}
