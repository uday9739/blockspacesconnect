import { NetworkCuratedResourceDto, NetworkCuratedResourcesDto } from "@blockspaces/shared/dtos/network-catalog";
import ApiResult, { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { NetworkCuratedResources } from "@blockspaces/shared/models/network-catalog";
import { Injectable } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

@Injectable()
export class NetworkCuratedResourcesDataServices {
  constructor(private readonly db: ConnectDbDataContext) { }

  async getCuratedResourcesForNetwork(networkId: string): Promise<ApiResultWithError<NetworkCuratedResourcesDto, string>> {
    const networkResources: NetworkCuratedResources[] = await this.db.networkCuratedResources.find({ network: networkId });
    let networkResourcesArray: NetworkCuratedResourceDto[] = [];
    if (networkResources?.length > 0) {
      networkResourcesArray = networkResources[0].resources;
    }
    let returnResources: NetworkCuratedResourcesDto = {
      network: networkId,
      resources: networkResourcesArray
    }
    return ApiResult.success(returnResources);
  }
}