// package: blockspaces
// file: connect.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as connect_pb from "./connect_pb";

interface IConnectService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    send: IConnectService_ISend;
}

interface IConnectService_ISend extends grpc.MethodDefinition<connect_pb.Request, connect_pb.Response> {
    path: "/blockspaces.Connect/Send";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<connect_pb.Request>;
    requestDeserialize: grpc.deserialize<connect_pb.Request>;
    responseSerialize: grpc.serialize<connect_pb.Response>;
    responseDeserialize: grpc.deserialize<connect_pb.Response>;
}

export const ConnectService: IConnectService;

export interface IConnectServer extends grpc.UntypedServiceImplementation {
    send: grpc.handleUnaryCall<connect_pb.Request, connect_pb.Response>;
}

export interface IConnectClient {
    send(request: connect_pb.Request, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
    send(request: connect_pb.Request, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
    send(request: connect_pb.Request, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
}

export class ConnectClient extends grpc.Client implements IConnectClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public send(request: connect_pb.Request, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
    public send(request: connect_pb.Request, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
    public send(request: connect_pb.Request, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: connect_pb.Response) => void): grpc.ClientUnaryCall;
}
