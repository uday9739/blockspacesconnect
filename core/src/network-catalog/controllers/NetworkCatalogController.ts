import { NetworkPriceDto, NetworkOfferingAutoLinkDto, NetworkOfferingWithIntegrationsDto, NetworkOfferingConfig } from '@blockspaces/shared/dtos/network-catalog';
import ApiResult, { ApiResultWithError } from '@blockspaces/shared/models/ApiResult';
import { NetworkOffering } from '@blockspaces/shared/models/network-catalog';
import { Network } from '@blockspaces/shared/models/networks';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { AllowAnonymous } from '../../auth';
import { AdminOnly } from '../../auth/decorators/AdminOnly.decorator';
import { ValidBody } from '../../validation';
import { NetworkCatalogDataService } from '../services/NetworkCatalogDataService';
import { NetworkCuratedResourcesDataServices } from '../services/NetworkCuratedResourcesDataServices';

/** Endpoints for network catalog data ({@link Network} model in shared library) */
@Controller('network-catalog')
export class NetworkCatalogController {
  constructor(
    private readonly networkCatalogRepo: NetworkCatalogDataService,
    private readonly networkCuratedResources: NetworkCuratedResourcesDataServices
  ) { }

  /** Get all entries in the network catalog */
  @Get()
  async getAll(): Promise<ApiResult<Network[]>> {
    return ApiResult.success(await this.networkCatalogRepo.findAll());
  }

  @Get('categories')
  async getNetworkCatalogCategories() {
    return ApiResult.success(await this.networkCatalogRepo.getNetworkCatalogCategories());
  }

  @Get("active-offers")
  async getActiveNetworkOfferings() {
    return ApiResult.success(await this.networkCatalogRepo.getNetworkOfferings());
  }

  /**
   * Get data for a specific network, based on its Network ID value
   *
   * If no data is found, HTTP 404 (Not Found) status is returned
   */
  @Get(":id")
  async getById(@Param("id") networkId: string): Promise<ApiResult<Network>> {
    const network = await this.networkCatalogRepo.findById(networkId);

    if (!network) {
      throw new HttpException(`No network was found with id ${networkId}`, HttpStatus.NOT_FOUND);
    }

    return ApiResult.success(network);
  }


  @Get(':id/prices')
  async getPricesForNetwork(@Param("id") networkId: string): Promise<ApiResult<Array<NetworkPriceDto>>> {
    const results = await this.networkCatalogRepo.getPricesForNetwork(networkId);
    if (results.error) return ApiResult.failure(results.message);
    return ApiResult.success(results.data);

  }



  /**
   * This is a temporary endpoint to help link Stripe and connect database until we build an admin interface
   */
  @AdminOnly()
  @Post(":id/auto-link-stripe")
  async autoLinkNetworkWithStripe(@Param("id") networkId: string, @Body("offerConfig") offerConfig: NetworkOfferingAutoLinkDto): Promise<ApiResultWithError<NetworkOffering[]>> {
    return await this.networkCatalogRepo.autoLinkNetworkWithStripe(networkId, offerConfig);
  }

  /**
  * This is a temporary endpoint to help create offers
  */
  @AdminOnly()
  @Post("create-offers")
  async createNetworkOfferingWithIntegrations(@Body("data") data: NetworkOfferingConfig) {
    return this.networkCatalogRepo.createNetworkOfferingWithIntegrations(data);
  }


  @Get(":id/:billingCategoryId/offers")
  async getNetworkOfferings(@Param("id") networkId: string, @Param("billingCategoryId") billingCategoryId: string) {
    const results = await this.networkCatalogRepo.getNetworkOfferingsForCart(networkId, billingCategoryId);
    if (results.error) return ApiResult.failure(results.message);
    return ApiResult.success(results.data);
  }




  @Get(":id/resources")
  async getCuratedResourcesForNetwork(@Param("id") networkId: string) {

    const results = await this.networkCuratedResources.getCuratedResourcesForNetwork(networkId);
    if (results.error) return ApiResult.failure(results.message);
    return ApiResult.success(results.data);
  }

}