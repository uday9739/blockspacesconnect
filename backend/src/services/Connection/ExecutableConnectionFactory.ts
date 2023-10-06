import { IConnection, ConnectionType, ISubflowConnection } from "@blockspaces/shared/models/flows/Connection";
import { TParameterFactory, ParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import {
  ExecutableSystemConnection,
  ExecutableAuthenticationConnection,
  ExecutableInitialConnection,
  ExecutableResponseConnection,
  ExecutableTransformationConnection,
  TExecutableConnection
} from "./";
import { ExecutableSubflowConnection } from "./ExecutableSubflowConnection";


export type TExecutableConnectionFactory = (connectionDefinition: IConnection, parameterFactory: TParameterFactory) => TExecutableConnection

const ExecutableConnectionFactory:TExecutableConnectionFactory = ( connectionDefinition, parameterFactory = ParameterFactory ) => {
  switch (connectionDefinition.type) {
    case ConnectionType.INITIAL:
      return new ExecutableInitialConnection(connectionDefinition, parameterFactory);
    case ConnectionType.RESPONSE:
      return new ExecutableResponseConnection(connectionDefinition, parameterFactory);
    case ConnectionType.SYSTEM:
      return new ExecutableSystemConnection(connectionDefinition, parameterFactory);
    case ConnectionType.BLOCKCHAIN:
      return new ExecutableSystemConnection(connectionDefinition, parameterFactory);
    case ConnectionType.AUTHENTICATION:
      return new ExecutableAuthenticationConnection(connectionDefinition, parameterFactory);
    case ConnectionType.TRANSFORMATION:
      return new ExecutableTransformationConnection(connectionDefinition, parameterFactory);
    case ConnectionType.SUBFLOW:
      return new ExecutableSubflowConnection(connectionDefinition as ISubflowConnection, parameterFactory);
    default:
      throw new Error(`Unknown connection type ${connectionDefinition.type}`);
    }
}

export default ExecutableConnectionFactory