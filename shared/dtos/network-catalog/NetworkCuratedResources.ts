
export type NetworkCuratedResourceDto = {
  category: string;
  type: string;
  source: string;
  url: string;
  description: string;
}

export interface NetworkCuratedResourcesDto {
  network: string;
  resources: NetworkCuratedResourceDto[];
}
