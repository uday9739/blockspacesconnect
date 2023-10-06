import ExecutableConnectionFactory, { TExecutableConnectionFactory } from './ExecutableConnectionFactory'
import { ExecutableInitialConnection } from './ExecutableInitialConnection'
import { ExecutableResponseConnection } from './ExecutableResponseConnection'
import { ExecutableSystemConnection } from './ExecutableSystemConnection'
import { ExecutableTransformationConnection } from './ExecutableTransformationConnection'
import { ExecutableAuthenticationConnection } from './ExecutableAuthenticationConnection'
import { TExecutableConnectionResponse } from './ExecutableConnectionResponse';

export type TExecutableConnection =
  ExecutableSystemConnection |
  ExecutableInitialConnection |
  ExecutableResponseConnection |
  ExecutableAuthenticationConnection | 
  ExecutableTransformationConnection

export {
  ExecutableConnectionFactory,
  ExecutableInitialConnection,
  ExecutableResponseConnection,
  ExecutableSystemConnection,
  ExecutableTransformationConnection,
  ExecutableAuthenticationConnection,
}

export type {
  TExecutableConnectionFactory,
  TExecutableConnectionResponse
}