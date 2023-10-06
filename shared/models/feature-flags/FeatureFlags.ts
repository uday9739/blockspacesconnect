/**
 * Enum to reference a FeatureFlags property name
 */
export enum FeatureFlags {
  billingModule = "billingModule",
  lightningSelfServiceCancel = "lightningSelfServiceCancel",
  withdrawBitcoin = "withdrawBitcoin",
  cyclrUserBIP = "cyclrUserBIP",
  embedBMP = "embedBMP",
  tenantsModule = "tenantsModule"
}

export interface IFeatureFlags {
  featureOne: boolean;
  billingModule: boolean;
  lightningSelfServiceCancel: boolean;
  withdrawBitcoin: boolean;
  cyclrUserBIP: boolean;
  embedBMP: boolean;
  tenantsModule: boolean;
}

export function getDefaultFeatureFlags(): IFeatureFlags {
  return {
    featureOne: false,
    billingModule: true,
    lightningSelfServiceCancel: true,
    withdrawBitcoin: true,
    cyclrUserBIP: false,
    embedBMP: false,
    tenantsModule: false
  };
}


