import { Credential, ICredentialReference, IToken } from '../src/services/Credential';
import {IConnectorDefinition, EType} from '../src/services/Connector';
import {ConnectionFactory, SystemConnection} from '../src/services/Connection';
import {EEnvironmentTypes} from '../src/services/Server';
import * as netSuiteConnectorSpec from './specs/netSuiteConnectorSpec.json';

let token:IToken = {
  access_token: "access token",
  id_token: "identity token",
  refresh_token: "refresh token",
  token_type: "Bearer"
}

let myConnection = ConnectionFactory.create(netSuiteConnectorSpec);

describe("Credential class should construct", () => {
  let myCredential:Credential = new Credential(myConnection,token);

  it("Should Return a Credential class", () => {
    expect(myCredential).toBeDefined();
    expect(myCredential).toBeInstanceOf(Credential);
  });

  it("Should return a list of potential credentials for this connector", () => {
    let credentials:Array<ICredentialReference> = myCredential.getConnectionCredentials();
    expect(credentials).toBeInstanceOf(Array);
  });

});