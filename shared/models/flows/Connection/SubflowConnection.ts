import { Connection, IConnection } from ".";
import { TParameterFactory } from "../Parameter";

export interface ISubflowConnection extends IConnection {
  flowId: string;
}

/** Allows a flow to be executed from within a parent flow */
export class SubflowConnection extends Connection implements ISubflowConnection {

  /** ID of the flow that will be executed */
  flowId: string;

  constructor(connection: ISubflowConnection, parameterFactory: TParameterFactory) {
    super(connection, parameterFactory);
    this.flowId = connection.flowId;
  }

  get asJson() {
    return {
      ...super.asJson,
      flowId: this.flowId
    }
  }
}