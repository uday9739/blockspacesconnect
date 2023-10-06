import { Address } from "../Address";
import { AppSettings, getDefaultAppSettings } from "../app-settings";
import { IFeatureFlags, getDefaultFeatureFlags } from "../feature-flags/FeatureFlags";
import { Tenant } from "../tenants";

export class User implements IUser {
  email: string
  accessToken: string;
  accessTokenRevoked?: boolean;
  tenants: string[];
  id: string;
  migratedUser: boolean;
  firstLogin: boolean;
  featureFlags: IFeatureFlags;
  whmcs: {
    clientId: number;
    ownerId: number;
  };
  serviceNow: {
    sysId: string;
    account: string;
  };
  twoFAStatus: string;
  firstName: string;
  lastName: string;
  tosDate: string;
  crmContactId: string;
  qboCustomerId: string;
  qboAccountId: string;
  viewedWelcome?: boolean;
  connectedNetworks: string[];
  gatewayUser: {
    status: string,
    poktGatewayRelayUrlPart: string
  };

  address?: Address;
  phone?: string;
  companyName?: string;
  billingDetails?: {
    stripe?: {
      customerId: string,
    },
    quickbooks?: {
      customerRef: {
        name: string, // first last
        value: string, // quickbooks CustomerId
      },
    },
  };
  appSettings?: AppSettings

  constructor(user: Partial<IUser> = {}) {
    Object.assign(this, user);
    this.viewedWelcome = this.viewedWelcome ?? false;
    this.tenants = this.tenants || [];
    this.tosDate = this.tosDate || null;
    this.qboCustomerId = this.qboCustomerId || null;
    this.crmContactId = this.crmContactId || null;
    this.connectedNetworks = this.connectedNetworks || [];
    this.featureFlags = this.featureFlags || getDefaultFeatureFlags()
    this.appSettings = this.appSettings || getDefaultAppSettings()
  }
  registered?: boolean;
  activeTenant?: Tenant;
  gaScore?: number;
  createdAt?: string;
  emailVerified: boolean;
  accountLocked?: boolean;

  get asJson(): IUser {
    return {
      email: this.email,
      tenants: this.tenants,
      accessToken: this.accessToken,
      accessTokenRevoked: this.accessTokenRevoked,
      id: this.id,
      migratedUser: this.migratedUser,
      firstLogin: this.firstLogin,
      featureFlags: this.featureFlags,
      whmcs: {
        clientId: this.whmcs.clientId,
        ownerId: this.whmcs.ownerId,
      },
      serviceNow: {
        sysId: this.serviceNow?.sysId ?? "",
        account: this.serviceNow?.account ?? "",
      },
      twoFAStatus: this.twoFAStatus,
      firstName: this.firstName,
      lastName: this.lastName,
      tosDate: this.tosDate,
      crmContactId: this.crmContactId,
      qboCustomerId: this.qboCustomerId,
      qboAccountId: this.qboAccountId,
      viewedWelcome: this.viewedWelcome,
      connectedNetworks: this.connectedNetworks,
      billingDetails: {
        stripe: {
          customerId: this.billingDetails?.stripe?.customerId ?? "",
        },
        quickbooks: {
          customerRef: this.billingDetails?.quickbooks?.customerRef ?? { name: "", value: "" },
        }
      },
      appSettings: this.appSettings,
      emailVerified: this.emailVerified
    }
  }
}

export interface IUser {
  /** Current User's email address/username */
  email: string,

  /** Current User Id  */
  id: string,

  /** If true, then the user has completed registration; otherwise, the user is not fully registered */
  registered?: boolean

  /** current JWT access token (base64 encoded) */
  accessToken: string,

  /** if the acccess token has been revoked or not */
  accessTokenRevoked?: boolean,

  /** the IDs of the tenants that the user belongs to */
  tenants: string[],

  /** The Active tenant of a logged in user */
  activeTenant?: Tenant,

  /** Was this user migrated in from WHMCS? */
  migratedUser: boolean,

  /** true if the user has never logged in; otherwise false */
  firstLogin: boolean,

  /** feature flags for the current user */
  featureFlags: IFeatureFlags,

  /** Client and User Id for WHMCS */
  whmcs: WhmcsUserData,

  /** values linking the user to data in ServiceNow */
  serviceNow?: ServiceNowUserData;

  /** 2 factor registration status */
  twoFAStatus: string,

  /** Current User First Name */
  firstName: string,

  /** Current User Last Name */
  lastName: string,

  /** Term of Service acceptance Date */
  tosDate?: string,

  /** List of connected networks */
  connectedNetworks?: string[]

  /** true if user has viewed the welcome screen */
  viewedWelcome?: boolean;

  billingDetails?: {
    stripe?: {
      customerId: String,
    },
    quickbooks?: {
      customerRef: {
        name: string, // first last
        value: string, // quickbooks CustomerId
      },
    },
  },

  /** Settings for UI */
  appSettings?: AppSettings,

  /** CRM Contact Id */
  crmContactId?: string,

  /** Quickbooks Customer Ref */
  qboCustomerId?: string;

  /** Quickbooks Deposit Account Ref */
  qboAccountId?: string;

  /** the user's address */
  address?: Address;

  /** the user's primary phone number */
  phone?: string;

  /** the name of the user's company */
  companyName?: string;
  gaScore?: number;
  createdAt?: string;
  emailVerified: boolean;
  accountLocked?: boolean;
}

/** Data linking a user to ServiceNow */
export interface ServiceNowUserData {
  /** the unique ID (sys_id) for the user in ServiceNow */
  sysId: string;

  /** the ID of the account/company, in ServiceNow, that the user is associated with */
  account: string;
}

/** Data linking a user to WHMCS */
export interface WhmcsUserData {
  /** Main Id for accessing WHMCS Data */
  clientId: number;

  /** Clients owner Id also User Id in WHMCS */
  ownerId: number;
}
