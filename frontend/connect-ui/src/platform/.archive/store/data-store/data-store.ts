// import { makeAutoObservable } from "mobx";
// import { NetworkCatalogStore } from "src/platform/api";
// import { LightningSecureStore } from "src/features/lightning/api";
// import { PocketStore } from "src/features/pocket/api";
// import { CartStore } from "../cart";
// import { EndpointsStore } from "src/features/endpoints/api/endpoints-store";
// import { UserNotificationsStore } from "@platform/components/dashboards/user-notifications/data/user-notifications-store"

// export interface INetworkDataStore extends IDataStore {
//   fetchData(tenantId: string): Promise<void>;
// }
// export interface IDataStore {
//   reset(): void;
// }

// export class DataStore implements IDataStore {
  // readonly networkCatalogStore: NetworkCatalogStore = new NetworkCatalogStore(this);
  // readonly lightningStore: LightningStore = new LightningStore(this);
  // readonly lightningSecureStore: LightningSecureStore = new LightningSecureStore(this);
  // readonly pocketStore: PocketStore = new PocketStore(this);
  // readonly cartStore: CartStore = new CartStore(this);
  // readonly endpointsStore: EndpointsStore = new EndpointsStore(this);
  // readonly userNotificationsStore: UserNotificationsStore = new UserNotificationsStore(this);

  // constructor() {
  //   makeAutoObservable(this);
  // }


//   reset() {
//     Object.values(this).forEach((x) => {
//       if (this.isDataStore(x)) {
//         x.reset();
//       }
//     });
//   }

//   private isDataStore(arg: IDataStore): arg is IDataStore {
//     return typeof (arg as IDataStore).reset === "function";
//   }
// }
