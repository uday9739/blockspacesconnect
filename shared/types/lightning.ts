/** The type of interface used to connect to Lightning Network Daemon (LND) */
export enum LndInterfaceType {
  /** gRPC interface */
  GRPC = "grpc",

  /** REST interface */
  REST = "rest"
}