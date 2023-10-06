import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { Tenant as ITenant } from "@blockspaces/shared/models/tenants";
import { IUser } from "@blockspaces/shared/models/users";
import { Controller, Post, Get, Param, Put, Body, Delete } from "@nestjs/common";
import { Tenant } from "../../tenants/decorators/Tenant.decorator";
import { User } from "../../users";
import { ValidRoute } from "../../validation";
import { IntegrationsService } from "../services/IntegrationsService";
import { ConnectorDto, IntegrationDto } from "@blockspaces/shared/dtos/integrations"
import { ValidationException } from "../../exceptions/common";

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
  ) {

  }

  @Get()
  @ValidRoute()
  async getAvailableIntegrations(@Tenant() tenant: ITenant): AsyncApiResult<Array<IntegrationDto>> {
    let integrationsResponse: IntegrationDto[] = await this.integrationsService.getAvailableIntegrations(tenant.tenantId);
    return ApiResult.success(integrationsResponse);
  }

  @Post('connectors/disconnect/:accountConnectorId')
  @ValidRoute()
  async disconnectConnector(
    @Tenant() tenant: ITenant,
    @Param('accountConnectorId') accountConnectorId: number
  ): AsyncApiResult<void> {
    try {
      await this.integrationsService.disconnect(Number(accountConnectorId), tenant.tenantId)
      return ApiResult.success();
    } catch (error) {
      return ApiResult.failure(error.response?.message)
    }
  }

  @Get('connectors')
  @ValidRoute()
  async getInstalledConnectors(@Tenant() tenant: ITenant): AsyncApiResult<Array<ConnectorDto>> {
    let installedConnectorsResponse: ConnectorDto[] = await this.integrationsService.getInstalledConnectors(tenant.tenantId);
    return ApiResult.success(installedConnectorsResponse);
  }

  @Get('connectors/:accountConnectorId')
  @ValidRoute()
  async getAccountConnector(
    @Tenant() tenant: ITenant,
    @Param('accountConnectorId') accountConnectorId: number
  ): AsyncApiResult<any> {
    let accountConnectorResponse = await this.integrationsService.getAccountConnector(tenant.tenantId, accountConnectorId);
    return ApiResult.success(accountConnectorResponse);
  }

  @Put('connectors/:accountConnectorId')
  @ValidRoute()
  async updateAccountConnectorSettings(
    @Tenant() tenant: ITenant,
    @Param('accountConnectorId') accountConnectorId: number,
    @Body() body: {
      parameterUpdates: any[]
    }
  ): AsyncApiResult<void> {
    await this.integrationsService.updateConnectorSettings(tenant.tenantId, accountConnectorId, body.parameterUpdates)
    return
  }

  @Post('auth-link')
  @ValidRoute()
  async getAuthLink(
    @Tenant() tenant: ITenant,
    @User() user: IUser,
    @Body() body: {
      accountConnectorId: number,
      callbackUrl: string
    }): AsyncApiResult<string> {
    if (!body.accountConnectorId) {
      throw new ValidationException('Account Connector ID not passed');
    }
    if (!body.callbackUrl || body.callbackUrl === '') {
      throw new ValidationException('Callback URL not passed')
    }
    const authLink = await this.integrationsService.getAuthLink(Number(body.accountConnectorId), tenant.tenantId, user.id, body.callbackUrl)
    return ApiResult.success(authLink);
  }

  @Post('embed-link')
  @ValidRoute()
  async getEmbedLink(
    @Tenant() tenant: ITenant,
    @User() user: IUser
  ): AsyncApiResult<string> {
    const accountName = user.companyName && user.companyName !== '' ? user.companyName : `${user.firstName} ${user.lastName}`;
    const authLink = await this.integrationsService.getEmbedLink(tenant.tenantId, user.id, accountName)
    return ApiResult.success(authLink);
  }

  @Put(':integrationId/activate')
  @ValidRoute()
  async activateIntegration(@Tenant() tenant: ITenant, @Param('integrationId') integrationId: string): AsyncApiResult<void> {
    await this.integrationsService.activateIntegration(tenant.tenantId, integrationId)
    return ApiResult.success();
  }

  @Put(':integrationId/stop')
  @ValidRoute()
  async stopIntegration(@Tenant() tenant: ITenant, @Param('integrationId') integrationId: string): AsyncApiResult<void> {
    await this.integrationsService.stopIntegration(tenant.tenantId, integrationId)
    return ApiResult.success();
  }

  @Post(':integrationId')
  @ValidRoute()
  async addIntegration(@User() user: IUser, @Tenant() tenant: ITenant, @Param('integrationId') integrationId: string): AsyncApiResult<void> {
    const accountName = user.companyName && user.companyName !== '' ? user.companyName : `${user.firstName} ${user.lastName}`;
    try {
      await this.integrationsService.addIntegration(tenant.tenantId, accountName, integrationId)
    } catch (error) {
      return ApiResult.failure('Error adding the integration')
    }
    return ApiResult.success();
  }

  @Delete(':integrationId')
  @ValidRoute()
  async removeIntegration(@User() user: IUser, @Tenant() tenant: ITenant, @Param('integrationId') integrationId: string): AsyncApiResult<void> {
    await this.integrationsService.removeIntegration(integrationId, tenant.tenantId)
    return ApiResult.success();
  }

}
