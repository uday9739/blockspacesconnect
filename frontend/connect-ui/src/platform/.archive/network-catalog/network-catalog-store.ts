import { Network } from '@blockspaces/shared/models/networks';
import { sortCollectionByValue } from '@src/platform/utils/sort-object-by-property';
import { makeAutoObservable, runInAction } from 'mobx';
import { DataStore, IDataStore } from 'src/platform/api';
import { NetworkCatalogTransport } from './network-catalog-transport';

export class NetworkCatalogStore implements IDataStore {
  catalog: Network[] = [];

  constructor(
    public readonly dataStore: DataStore,
    private readonly transport: NetworkCatalogTransport = NetworkCatalogTransport.instance
  ) {
    makeAutoObservable(this);
    //this.fetchData({ [Features.Lightning]:true, [Features.Pocket]:true });
  }

  get isCatalogLoaded(): boolean {
    return Boolean(this.catalog?.length);
  }

  reset() {
    this.catalog = [];
  }

  /** loads the catalog of available networks */
  async loadNetworkCatalog(): Promise<Network[]> {
    const networks = await this.transport.fetchCatalog();

    this.setNetworkCatalog(networks?.length ? networks : []);
    return this.catalog;
  }

  setNetworkCatalog(catalog: Network[]) {
    runInAction(() => { this.catalog = catalog });
  }

  getNetwork(networkId: string) {
    return this.catalog.find(n => n._id === networkId);
  }
}