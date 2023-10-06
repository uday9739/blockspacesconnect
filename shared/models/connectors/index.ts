import { VersionedMongoDbModel } from "../MongoDbModel";
import { Network } from "../networks";

export interface Connectors extends VersionedMongoDbModel {
  cyclrId: number,
  active: boolean,
  isFeatured?: boolean,
  name: string,
  description: string,
  base64Icon: string,
  longDescription?: string,
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Map connector available for integration 
 */
export interface NetworkConnectorIntegration {
  active: boolean,
  connector: Connectors,
  network: Network,
  isFeatured?: boolean,
  titleOverride?: string,
  descriptionOverride?: string;
  longDescriptionOverride?: string,
}