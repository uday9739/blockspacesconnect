import { NetworkCuratedResourcesDto } from "../../dtos/network-catalog";
import { VersionedMongoDbModel } from "../MongoDbModel";
import { NetworkCuratedResourceDto } from "../../dtos/network-catalog";

export type NetworkCuratedResource = NetworkCuratedResourceDto;

export interface NetworkCuratedResources extends VersionedMongoDbModel {
  network: string;
  resources: NetworkCuratedResource[];
}