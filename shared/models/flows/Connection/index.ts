import { Connection, IConnection, ConnectionSecurityScheme } from "./Connection"
import ConnectionFactory, { TConnectionFactory } from "./ConnectionFactory"
import { IteratorConnection } from "./IteratorConnection"
import { ISubflowConnection, SubflowConnection } from "./SubflowConnection"
import { SystemConnection } from "./SystemConnection"
import { TransformationConnection } from "./TransformationConnection"

export type TConnection =
  SystemConnection |
  TransformationConnection |
  IteratorConnection;

export {
  ConnectionFactory,
  Connection,
  SystemConnection,
  IteratorConnection,
  SubflowConnection,
  TransformationConnection
}

export type {
  IConnection,
  ISubflowConnection,
  ConnectionSecurityScheme,
  TConnectionFactory
}

export enum ConnectionType {
  INITIAL="Initial",
  RESPONSE="Response",
  SUBFLOW="Subflow",
  TRANSFORMATION="Transformation",
  ITERATOR="Iterator",
  SYSTEM="System",
  BLOCKCHAIN="Blockchain",
  AUTHENTICATION="Authentication"
}