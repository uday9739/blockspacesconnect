import { ConnectionType } from ".";
import { IConnectorRoute } from "../Connector";
import { Credential } from "../Credential";
import { Mapping } from "../Mapping";
import { TParameter, TParameterFactory } from "../Parameter";
import { IServerReference } from "../Server";

export type ConnectionSecurityScheme = {
  connectorAuth: {
    type: string;
    in: string;
    name: string;
    scheme?: string;
    bearerFormat?: string;
    "x-source": {
      "authflow-type": string,
      "authflow-input"?: TParameter[];
      "authflow-id"?: string;
      "authflow-response"?: TParameter[];
    }
  };
}

export interface IConnection {
  id: string;
  connectorId: string;
  description: string;
  type: ConnectionType;
  activeMethod?: IConnectorRoute;
  securitySchemes?: ConnectionSecurityScheme;
  server?:IServerReference;
  credential?:Credential;
  asJson?:any
}

export class Connection implements IConnection {
  id: string;
  connectorId: string;
  description: string;
  type: ConnectionType;
  activeMethod?: IConnectorRoute;
  securitySchemes?: ConnectionSecurityScheme;
  server?: IServerReference;
  credential?: Credential;
  state:any

  constructor(connection:IConnection, parameterFactory?:TParameterFactory ) {
    const { id, connectorId, type, description, activeMethod } = connection;
    this.id = id;
    this.connectorId = connectorId;
    this.type = type;
    this.description = description || "";
    
    if ( activeMethod && parameterFactory ){
      this.activeMethod = activeMethod;

      const address = {
        connectionId:this.id,
        method:this.activeMethod.method, endpoint:this.activeMethod.name
      }
      this.activeMethod.parameters = activeMethod.parameters.map((parameter) => parameterFactory(parameter, { ...address }));
      this.activeMethod.responses = activeMethod.responses.map((response) => ({
          responseCode:response.responseCode,
          description:response.description || '',
          parameters: response.parameters.map((parameter)=> parameterFactory(parameter, { ...address, responseCode:response.responseCode }))
        }
      ));
    }
  }

  get allParameters(){
    return [
      ...this.activeMethod.parameters,
      ...this.activeMethod.responses.map(response => response.parameters).flat()
    ]
  }

  public validate():{isValid: boolean, issues?: Array<string>} {
    const issues = [];
    return { isValid: issues.length === 0, issues }
  }

  public test(mappings:Array<Mapping>):boolean {
    return true;
  }


  get asJson(){
    return {
      id:this.id,
      connectorId:this.connectorId,
      description:this.description,
      type:this.type,
      activeMethod:{
        ...this.activeMethod,
        parameters: this.activeMethod.parameters.map( parameter => parameter.asJson),
        responses:this.activeMethod.responses.map( response => ({
          ...response,
          parameters:response.parameters.map(parameter => parameter.asJson)
        }))
      },
      securitySchemes:this.securitySchemes,
      server:this.server,
      credential:this.credential?.asJson
    }

  }

}