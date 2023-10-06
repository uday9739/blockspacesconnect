import { IsBoolean, IsDate, IsISO8601, IsInt, IsOptional, IsString } from "class-validator";
import { BillingTierCode } from "../network-catalog/Tier";

export type LightningNodeTiers = {
  name: string,
  startingChannelSize: number
}
export const LightningNodeTiers = [
  { name: BillingTierCode.FreeWithCC, startingChannelSize: 300_000 },
  { name: BillingTierCode.Basic, startingChannelSize: 2_000_000 },
  { name: BillingTierCode.Standard, startingChannelSize: 4_000_000 },
  { name: BillingTierCode.Professional, startingChannelSize: 7_000_000 },
  { name: BillingTierCode.Enterprise, startingChannelSize: 15_000_000 }
] as const;

export type LightningNodeTierFull = typeof LightningNodeTiers[number];
export type LightningNodeTier = typeof LightningNodeTiers[number]['name'];
export const LightningTierMap = LightningNodeTiers.reduce((acc, cur) => {
  acc[cur.name] = cur.startingChannelSize;
  return acc;
}, {});

export class LightningNodeReference {
  @IsString()
  nodeId: string;

  @IsString()
  pubkey?: string;

  @IsString()
  tenantId?: string;

  @IsString()
  nodeLabel?: string;

  @IsString()
  outgoingChannelId?: string;

  @IsString()
  incomingChannelId?: string;

  @IsInt()
  liquiditySize?: number;

  @IsInt()
  currentBalance?: number;

  @IsString()
  apiEndpoint: string;

  @IsOptional()
  @IsString()
  gossipEndpoint?: string;

  @IsString()
  bscMacaroon?: string;

  @IsString()
  macaroonId?: string;

  @IsString()
  cert?: string;

  @IsBoolean()
  decomissioned?: boolean;

  @IsString()
  tier?: string;

  @IsBoolean()
  external?: boolean;

  @IsDate()
  nodeBirthday?: Date;
}

export class CreateLightningNodeDto {
  @IsString()
  nodeId: string;

  @IsString()
  pubkey?: string;

  @IsString()
  tenantId?: string;

  @IsString()
  nodeLabel?: string;

  @IsString()
  outgoingChannelId?: string;

  @IsString()
  incomingChannelId?: string;

  @IsInt()
  liquiditySize?: number;

  @IsInt()
  currentBalance?: number;

  @IsString()
  apiEndpoint: string;

  @IsOptional()
  @IsString()
  gossipEndpoint?: string;

  @IsString()
  bscMacaroon?: string;

  @IsString()
  macaroonId?: string;

  @IsString()
  cert?: string;

  @IsBoolean()
  decomissioned?: boolean;

  @IsString()
  tier?: string;
}

export class LightningNode implements LightningNodeReference {
  @IsString()
  nodeId: string;

  @IsString()
  tenantId?: string;

  @IsString()
  nodeLabel?: string;

  @IsString()
  pubkey?: string;

  @IsString()
  outgoingChannelId?: string;

  @IsString()
  incomingChannelId?: string;

  @IsInt()
  liquiditySize?: number;

  @IsInt()
  currentBalance?: number;

  @IsString()
  apiEndpoint: string;

  @IsOptional()
  @IsString()
  gossipEndpoint?: string;

  @IsString()
  bscMacaroon?: string;

  @IsString()
  macaroonId?: string;

  @IsString()
  cert?: string;

  @IsBoolean()
  decomissioned?: boolean;

  @IsString()
  tier?: string;

  @IsBoolean()
  external?: boolean;

  @IsDate()
  nodeBirthday?: Date;

  constructor(lightningNode: LightningNodeReference) {
    Object.assign(this, lightningNode);
  }

  toJSON() {
    return {
      nodeId: this.nodeId,
      tenantId: this.tenantId,
      nodeLabel: this.nodeLabel,
      pubkey: this.pubkey,
      outgoingChannelId: this.outgoingChannelId,
      incomingChannelId: this.incomingChannelId,
      liquiditySize: this.liquiditySize,
      currentBalance: this.currentBalance,
      apiEndpoint: this.apiEndpoint,
      gossipEndpoint: this.gossipEndpoint,
      bscMacaroon: this.bscMacaroon,
      macaroonId: this.macaroonId,
      cert: this.cert,
      decomissioned: this.decomissioned,
      tier: this.tier,
      external: this.external,
      nodeBirthday: this.nodeBirthday
    };
  }
}
export enum ExternalLightningOnboardingStep {
  Unknown = "UNKNOWN",
  Locked = "NODE IS LOCKED",
  NodeNotAssigned = "NO NODE",
  NodeNotInitialized = "NODE IS NOT INITIALIZED",
  NoReadOnlyMac = "NO READONLY MACAROON",
  MacHasWrongPermission = "READONLY MACAROON HAS WRONG PERMISSIONS",
  BirthdayNotSet = "NODE BIRTHDAY IS NOT SET",
  NodeApiIsDown = "NODE IS DOWN",
  ImDoingGood = "ACTIVE"
}

export enum LightningOnboardingStep {
  Unknown = "UNKNOWN",
  Locked = "NODE IS LOCKED",
  NodeNotAssigned = "NO NODE",
  NodeNotInitialized = "NODE IS NOT INITIALIZED",
  NoAdminMacInVault = "MACAROON IS NOT IN VAULT",
  NoAdminMacInNodeDoc = "MACAROON IS NOT IN DB",
  NoAdminMacInCookie = "MACAROON IS NOT IN BROWSER",
  MismatchedAdminMac = "MACAROON ID DOES NOT MATCH",
  NoReadOnlyMac = "NO READONLY MACAROON",
  NodeApiIsDown = "NODE IS DOWN",
  NotSyncedToChain = "NODE IS STARTING",
  NotSyncedToGraph = "NODE IS STARTING",
  NoPeers = "NO PEERS",
  NoInboundChannelOpened = "NO RECEIVABLE BALANCE",
  InboundChannelOpening = "INBOUND CHANNEL OPENING",
  BitcoinNotDeposited = "NO BITCOIN DEPOSITED",
  NoOutboundChannelOpened = "NO SPENDABLE BALANCE",
  OutboundChannelOpening = "OUTBOUND-OPENING",
  ImDoingGood = "ACTIVE"
}

export enum StepToNum {
  "UNKNOWN" = 0, 
  "NO NODE" = 1,
  "NODE IS NOT INITIALIZED" = 2,
  "MACAROON IS NOT IN VAULT" = 3,
  "MACAROON IS NOT IN DB" = 4,
  "MACAROON IS NOT IN BROWSER" = 5,
  "MACAROON ID DOES NOT MATCH" = 6,
  "NO READONLY MACAROON" = 7,
  "NODE IS STARTING" = 8,
  "NODE IS DOWN" = 9,
  "NO PEERS" = 10,
  "NO RECEIVABLE BALANCE" = 11,
  "INBOUND CHANNEL OPENING" = 12,
  "NO BITCOIN DEPOSITED" = 13,
  "NO SPENDABLE BALANCE" = 14,
  "OUTBOUND CHANNEL OPENING" = 15,
  "NODE IS LOCKED" = 16,
  "ACTIVE" = 17,
}

export type LndVersion = {
  commit: string;
  commit_hash: string;
  version: string;
  app_major: number;
  app_minor: number;
  app_patch: number;
  app_pre_release: string;
  build_tags: Array<string>;
  go_version: string;
};
