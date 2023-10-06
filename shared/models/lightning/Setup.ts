import { LightningNodeTier } from "./Node";

export interface LightningSetup {
  url: string;
  nodeId: string;
  seed: string[];
  password: string;
  tier?: LightningNodeTier;
}

export interface ExternalLightningSetup {
  url: string;
  macaroon: string;
  certificate: string;
}