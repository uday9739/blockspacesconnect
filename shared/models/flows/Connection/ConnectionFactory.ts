import { Connection, ConnectionType, IConnection, ISubflowConnection, IteratorConnection, SubflowConnection, SystemConnection, TConnection, TransformationConnection } from ".";
import { TParameterFactory } from "../Parameter";

export type TConnectionFactory = ( connectionDefinition: IConnection, parameterFactory?:TParameterFactory ) => TConnection
const ConnectionFactory:TConnectionFactory = ( connectionDefinition, parameterFactory ) => {
  switch (connectionDefinition.type) {
    case ConnectionType.INITIAL:
    case ConnectionType.RESPONSE:
      return new Connection(connectionDefinition, parameterFactory);
    case ConnectionType.AUTHENTICATION:
    case ConnectionType.BLOCKCHAIN:
    case ConnectionType.SYSTEM:
      return new SystemConnection(connectionDefinition, parameterFactory);
    case ConnectionType.TRANSFORMATION:
      return new TransformationConnection(connectionDefinition, parameterFactory);
    case ConnectionType.SUBFLOW:
      return new SubflowConnection(connectionDefinition as ISubflowConnection, parameterFactory);
    case ConnectionType.ITERATOR:
      return new IteratorConnection(connectionDefinition as ISubflowConnection, parameterFactory);
    // case EType.SUBFLOW:
    //   switch( connectionDefinition.subType ){
    //     case ESubType.ITERATOR:
    //       return new IteratorConnection(connectionDefinition);
    //     case ESubType.AUTHFLOW:
    //       return new AuthflowConnection(connectionDefinition);
    //     default:
    //       return new SubflowConnection(connectionDefinition);
    }
}

export default ConnectionFactory