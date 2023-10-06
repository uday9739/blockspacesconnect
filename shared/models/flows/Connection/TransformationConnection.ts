import { Connection, IConnection } from ".";
import { TParameterFactory } from "../Parameter";
import { TransformationName } from "../transformations";

const BLOCKSPACES_SERVICES_URL = process.env.BLOCKSPACES_SERVICES_URL;
const BLOCKSPACES_SERVICES_PORT = process.env.BLOCKSPACES_SERVICES_PORT;

export class TransformationConnection extends Connection {

  constructor(connection: IConnection, parameterFactory: TParameterFactory) {
    super(connection, parameterFactory);
    this.server = {
      "x-environment": "Production",
      "url": `${BLOCKSPACES_SERVICES_URL}:${BLOCKSPACES_SERVICES_PORT}/api/transformations`
    }
  };

  get transformationName():TransformationName {
    return <TransformationName>this.activeMethod?.name;
  }

};