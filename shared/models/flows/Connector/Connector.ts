import { ConnectorSpec } from '.';
import { ConnectionSecurityScheme, ConnectionType } from '../Connection';
import { IParameter, IParameterAddress, Parameter, ParameterArray, ParameterFactory, ParameterGroup } from '../Parameter';
import { IServerReference } from '../Server';



export interface IConnector {
  "_id"?: {
    "$oid": string;
  };
  groups?: Array<string>;
  id: string;
  name: string;
  type: ConnectionType;
  description?: string;
  servers?: Array<IServerReference>;
  specification_processed: ConnectorSpec;
  securitySchemes?: ConnectionSecurityScheme;
  createdAt?: {
    "$date": string;
  };
  updatedAt?: {
    "$date": string;
  };
  "__v"?: number;
}

export interface IConnectorRoute {
  name: string;
  method: string;
  description?: string;
  contentType: string;
  parameters: Array<Parameter | ParameterArray | ParameterGroup>;
  security?:any[]
  responses: Array<{
    responseCode: string;
    description: string;
    parameters: Array<Parameter | ParameterArray | ParameterGroup>
  }>
};
export interface IConnectorRoutes extends Array<IConnectorRoute>{};


export class Connector implements IConnector{
  "_id"?: {
    "$oid": string;
  };
  groups?: Array<string>;
  id: string;
  name: string;
  type: ConnectionType;
  description?: string;
  servers?: Array<IServerReference>;
  specification_processed: ConnectorSpec;
  securitySchemes?: ConnectionSecurityScheme;
  createdAt?: {
    "$date": string;
  };
  updatedAt?: {
    "$date": string;
  };
  "__v"?: number;
  parameterFactory:( parameter:any, address:any ) => any;

  constructor(connector:IConnector, parameterFactory = ParameterFactory) {
    Object.assign(this,connector);
    this.parameterFactory = parameterFactory
  }

  prepareActiveMethod( connectionId:string, pathName:any, method:any ):IConnectorRoute {
    const route:IConnectorRoute = {
      name: pathName,
      method: "",
      description: "",
      contentType: "application/json",
      parameters: [], 
      responses: []
    }
    route.method = method.method;
    route.description = method.description || pathName;
    route.contentType = method.contentType;
    const address = {
      connectionId,
      method:route.method,
      endpoint:pathName
    }
    route.parameters=method.parameters.map((parameter) => this.parameterFactory(<IParameter>parameter, address));
    route.responses=method.responses.map((response) => ({
      responseCode: response.responseCode,
      description: response.description,
      parameters: response.parameters.map((responseParameter) => this.parameterFactory(<IParameter>responseParameter, { ...address, responseCode:response.responseCode }))
    }));
    return route;
  }

  getFirstActiveRoute():IConnectorRoute{
    return this.getRouteFromSpec(0, 0);
  }

  getRouteFromSpec(pathIndex: number, methodIndex: number, connectionId?: string): IConnectorRoute {

    if (!this.specification_processed || pathIndex < 0 || methodIndex < 0) return null;
    if (pathIndex >= this.specification_processed.length) return null;

    const pathSpec = this.specification_processed[pathIndex];

    if (methodIndex >= pathSpec.methods.length) return null;

    const methodSpec = pathSpec.methods[methodIndex];
    let address: IParameterAddress = null;

    if (connectionId) {
      address = {
        connectionId,
        method: methodSpec.method,
        endpoint: pathSpec.name
      }
    }

    return {
      name: pathSpec.name,
      method: methodSpec.method,
      description: methodSpec.description || pathSpec.name,
      contentType: methodSpec.contentType,
      parameters: connectionId ? this.buildParametersForConnection(methodSpec.parameters, address) : methodSpec.parameters,
      responses: methodSpec.responses.map( response => ({
        responseCode: response.responseCode,
        description: response.description,
        parameters: connectionId ? this.buildParametersForConnection(response.parameters, address) : response.parameters
      }))
    }
  }

  getRoutes(connectionId?: string): IConnectorRoutes {
    if (!this.specification_processed) return [];

    let routes: IConnectorRoutes = [];

    this.specification_processed.forEach((pathSpec, pathIndex) => {
      pathSpec.methods.forEach((_methodSpec, methodIndex) => {
        routes.push(this.getRouteFromSpec(pathIndex, methodIndex, connectionId))
      })
    });

    return routes;
  }

  protected buildParametersForConnection(parameters: IParameter[], baseAddress: IParameterAddress = null): (Parameter | ParameterGroup | ParameterArray)[] {
    if (!parameters) return [];

    return parameters.map(p => this.parameterFactory(p, baseAddress));
  }
}
