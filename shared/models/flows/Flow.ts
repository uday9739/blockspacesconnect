import includes from 'lodash/includes';
import { ConnectionFactory, TConnection, TConnectionFactory} from "./Connection";
import { Mapping } from './Mapping';
import { ParameterFactory, TParameterFactory } from "./Parameter";



export enum FlowType {
  ROUNDTRIP="ROUNDTRIP",
  SCHEDULED="SCHEDULED",
  ONEWAY="ONEWAY"
}

export type TStep = Array<TConnection>

export interface IFlow {
  id: string;
  name: string;
  type: FlowType;
  clientId: string;
  isAuthFlow: boolean;
  steps: TStep[];
  mappings: Array<Mapping>;
  "_id"?: string;
  createdAt?: string;
  updatedAt?: string;
  "__v"?: string;
}

export class Flow implements IFlow {
  id: string;
  name: string;
  isAuthFlow: boolean;
  steps:TStep[];
  mappings: Array<Mapping>;
  clientId: string;
  type: FlowType;
  "_id"?: string;
  createdAt?: string;
  updatedAt?: string;
  "__v"?: string;

  constructor ( 
    flow:IFlow, 
    connectionFactory:TConnectionFactory = ConnectionFactory, 
    parameterFactory:TParameterFactory = ParameterFactory
  ){
    const { id, name, clientId, type, isAuthFlow, steps, mappings } = flow;
    this.id = id;
    this.name = name;
    this.clientId= clientId;
    this.type = type;
    this.isAuthFlow = isAuthFlow || false;
    this.steps = steps.map((step) => step.map((connectionDefinition) => {
        return connectionFactory(connectionDefinition, parameterFactory);
    }));
    this.mappings = mappings.map(mapping => new Mapping(mapping.source, mapping.destination))
  }

  public validate():{ isValid:boolean, issues:Array<{ connectionId:string, issue:string }> } {
    let issues:Array<{ connectionId:string, issue:string }> = [];

    this.steps.map( step => step.map( connection => {

      // Check that connection is correctly configured
      const connectionStatus = connection.validate();
      connectionStatus.issues?.forEach(connectionIssue => {
        issues.push({ connectionId:connection.id, issue:connectionIssue });
      })

      // Check that required parameters are mapped
      const requiredParameters = connection.allParameters.filter(parameter => parameter.required );
      const mappedParameters = this.getMappedParameters();
      if ( requiredParameters.length )
        requiredParameters.forEach(requiredParameter => {
          if ( !includes( mappedParameters, requiredParameter.getPathString() ))
            issues.push({ connectionId:connection.id, issue:`Required Parameter "${requiredParameter.name}" not Mapped` })
      })
    }));

    return{ isValid:issues.length === 0, issues }
  }

  getConnectionById(connectionId:string):TConnection {
    return this.steps.filter((step) => step.filter((connection) => connection.id === connectionId).length > 0 )[0][0];
  }

  getConnectionsByConnectorId(connectorId:string):Array<TConnection> {
    const connections = []
    this.steps.forEach((step) => step.forEach((connection) => connection.connectorId === connectorId ? connections.push(connection) : false ));
    return connections;
  }

  getMappingsForConnection(connectionId:string) {
    return this.mappings.map( mapping => (
      mapping.destination.connectionId === connectionId || 
      mapping.source.connectionId === connectionId
    ))
  }

  getMappingsForParameter(pathString:string) {
    return this.mappings.filter( mapping => (
      pathString === mapping.getSourceString() ||
      pathString === mapping.getDestinationString()
    ));
  }

  getMappedAddressStrings = ():string[] => {
    const addressStrings = [];
    this.mappings.forEach( mapping => {
      addressStrings.push(mapping.getSourceString());
      addressStrings.push(mapping.getDestinationString());
    })
    return [... new Set(addressStrings)]
  }

  getMappedParameters():Array<string> {
    const mappedParameters = [];
    this.mappings.forEach( mapping => {
      mappedParameters.push(mapping.getSourceString())
      mappedParameters.push(mapping.getDestinationString())
    })
    return [ ...new Set(mappedParameters)]
  }

  hasConnection(connectionId: string): boolean {
    return this.steps.some((step) => step.some((c) => c.id === connectionId));
  }

  get asJson(){
    return {
      id:this.id,
      name:this.name,
      clientId:this.clientId,
      type:this.type,
      isAuthFlow:this.isAuthFlow,
      steps:this.steps.map(step => step.map(connection => connection.asJson)),
      mappings:this.mappings,
      "_id": this._id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      "__v": this.__v,
    }
  }
  
}