import { MongoDbModel } from "../MongoDbModel";

/**
 * Metadata for a blockchain network
 */
export interface Network {

  /** Unique identifier for the network that will be shared across all environments (not globally unique) */
  _id: string;

  /** friendly name for the network */
  name: string;

  /** the target chain - assume mainnet if not present */
  chain?: string;

  /** description of the network */
  description: string;

  /** the path/URL for the network's logo */
  logo?: string;

  /** the primary color for the network */
  primaryColor?: string;

  /** the secondary color for the network */
  secondaryColor?: string;

  /** the protocol router backend provider */
  protocolRouterBackend?: string;

  isFeatured?: boolean;
}

/** 
 * Network identifiers. Used to handle any special use cases in code for a given network id
 * This is not meant to be an exhaustive list of available networks but rather networks that will have special use cases handled in code
 * 
 */
export enum NetworkId {
  // AVALANCHE = "avalanche",
  ARC_LENDING = "arc-lending",
  ARC_OTC_DERIVATIVES = "arc-derivatives",
  LIGHTNING = "lightning",
  LIGHTNING_REPORTER = "lightning-reporter",
  LIGHTNING_CONNECT = "lightning-connect",
  OPTIMISM = "optimism",
  POCKET = "pocket",
  POLYGON = "polygon",
  ETHEREUM = "ethereum",
  POLYGON_MUMBAI = "polygon-mumbai"
}
