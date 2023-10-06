// import { action, makeObservable, observable } from 'mobx';
// import { IUser, User } from '@blockspaces/shared/models/users'
// import { NIL as EMPTY_UUID } from 'uuid';
// import { ILoginResponse } from '@blockspaces/shared/dtos/authentication/LoginResponse';


// export interface IObservableUser extends ILoginResponse {
//   /** the ID of the tenant that the user is currently accessing resources for */
//   currentTenantId: string

//   /** true if the user has accepted the Terms of Service */
//   acceptedTerms: boolean

//   /** returns true if the user has access to the given feature; otherwise false */
//   hasFeatureAccess: (feature: string) => boolean
// }

// export class ObservableUser extends User implements IObservableUser {

//   static readonly default: ObservableUser = new ObservableUser({
//     email: 'default@blockspaces.com',
//     tenants: [EMPTY_UUID]
//   });
//   snow: { deUser: string; glideSSO: string; };
//   currentTenantId: string;
//   acceptedTerms: boolean;

//   constructor(user: Partial<ILoginResponse> = {}) {
//     super(user);
//     this.snow = { deUser: "", glideSSO: "" };
//     this.currentTenantId = this.tenants.length ? this.tenants[0] : EMPTY_UUID
//     this.acceptedTerms = this.tosDate ? true : false;

//     makeObservable(this, {
//       snow: observable,
//       email: observable,
//       currentTenantId: observable,
//       viewedWelcome: observable,
//       acceptedTerms: observable,
//       featureFlags: observable,
//       connectedNetworks: observable,
//       setViewedWelcome: action,
//       setAcceptedTerms: action,
//       setCurrentTenantId: action,
//       addNetworkConnection: action
//     })
//   }


//   hasFeatureAccess(feature: string): boolean {
//     return this.featureFlags && Boolean(this.featureFlags[feature]);
//   }


//   /**
//    * Set the current tenant, using an index in to the tenants array (this.tenants).
//    * If the index is invalid, the empty UUID (uuid.NIL) value will be used
//    *
//    * @param tenantIndex the index of the ID in the tenants array (this.tenants)
//    */
//   setCurrentTenantId(tenantIndex: number) {
//     if (tenantIndex < 0 || tenantIndex >= this.tenants.length) {
//       this.currentTenantId = EMPTY_UUID;
//       return;
//     }

//     this.currentTenantId = this.tenants[tenantIndex];
//   }

//   /** Flags the user as having viewed the welcome message */
//   setViewedWelcome() {
//     this.viewedWelcome = true;
//   }

//   /** Flags the user as having accepted the Terms of Service */
//   setAcceptedTerms() {
//     this.acceptedTerms = true;
//   }

//   /** Adds a network to a user's accepted connections */
//   addNetworkConnection(networkId: string) {
//     this.connectedNetworks.push(networkId);
//   }

// }
