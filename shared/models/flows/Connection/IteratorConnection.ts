import { ISubflowConnection, SubflowConnection } from "./SubflowConnection";
import { ParameterFactory, ParameterType, TParameterFactory } from "../Parameter";
import { IConnectorRoute } from "../Connector";

export class IteratorConnection extends SubflowConnection {

  constructor(connection: ISubflowConnection, parameterFactory: TParameterFactory = ParameterFactory) {
    super(connection, parameterFactory);
  };

  get arrayType(): ParameterType {
    const params = this.activeMethod?.parameters;

    if (!params || !params.length || params[0].type !== ParameterType.ARRAY) return null;

    return params[0].items?.item.type as ParameterType;
  }
};