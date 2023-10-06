import config from 'config'
import { Network } from '@blockspaces/shared/models/networks/Network'
import { BaseHttpTransport } from 'src/platform/api'
import { getApiUrl } from 'src/platform/utils';
import ApiResult from '@blockspaces/shared/models/ApiResult';

export class NetworkCatalogTransport extends BaseHttpTransport {

  static readonly instance: NetworkCatalogTransport = new NetworkCatalogTransport();

  //TODO Tech Debt Clean up this code
  async fetchCatalog(): Promise<Network[]> {
    // const networks:Network[] = [
    //   {
    //     _id: NetworkId.LIGHTNING,
    //     name:'Lightning Network',
    //     logo:`/images/light-lightningnetwork.png`,
    //     description:'Lightning Fast, Low-Fee, Payments & Invoicing',
    //   },
    //   {
    //     _id: NetworkId.POCKET,
    //     name:'Pocket Network',
    //     logo:`/images/light-pocketnetwork.png`,
    //     description:'Decentralized Blockchain Infrastructure',
    //   }
    // ];

    // return networks;

    const { data: apiResult } = await this.httpService.get<ApiResult<Network[]>>(getApiUrl("/network-catalog"))
    return apiResult.data;
  }
}
