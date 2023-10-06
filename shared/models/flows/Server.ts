export enum EnvironmentType {
  DEVELOPMENT = "Development",
  STAGING = "Staging",
  PRODUCTION = "Production"
}

export interface IServerReference {
  "x-environment": EnvironmentType | string;
  "id"?: string;
  url: string;
  "_id"?: {
    "$oid": string;
  }
};

export class Server implements IServerReference {
  "x-environment": EnvironmentType | string;
  "id"?: string;
  url: string;
  "_id"?: {
    "$oid": string;
  }

  constructor(server: IServerReference) {
    Object.assign(this, server)
  }

  get asJson() {
    return {
      _id: this._id,
      "x-environment": this["x-environment"],
      url: this.url
    }
  }

}