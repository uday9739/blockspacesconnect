import { Connection, IConnection } from ".";
import { TParameterFactory } from "../Parameter";

export class SystemConnection extends Connection {

  constructor(connection: IConnection, parameterFactory: TParameterFactory) {
    super(connection, parameterFactory);
    this.securitySchemes = connection.securitySchemes
    this.server = connection.server;
    this.credential = connection.credential
  };

  validate(): { isValid: boolean, issues?: Array<string> } {
    const { isValid, issues } = super.validate();

    if (!this.credential)
      issues.push('Missing Credential')

    if (!this.server)
      issues.push('Missing Server')

    return { isValid: issues.length === 0, issues }
  }

};