// package: lnrpc
// file: walletunlocker.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as walletunlocker_pb from "./walletunlocker_pb";
import * as lightning_pb from "./lightning_pb";

interface IWalletUnlockerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    genSeed: IWalletUnlockerService_IGenSeed;
    initWallet: IWalletUnlockerService_IInitWallet;
    unlockWallet: IWalletUnlockerService_IUnlockWallet;
    changePassword: IWalletUnlockerService_IChangePassword;
}

interface IWalletUnlockerService_IGenSeed extends grpc.MethodDefinition<walletunlocker_pb.GenSeedRequest, walletunlocker_pb.GenSeedResponse> {
    path: "/lnrpc.WalletUnlocker/GenSeed";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<walletunlocker_pb.GenSeedRequest>;
    requestDeserialize: grpc.deserialize<walletunlocker_pb.GenSeedRequest>;
    responseSerialize: grpc.serialize<walletunlocker_pb.GenSeedResponse>;
    responseDeserialize: grpc.deserialize<walletunlocker_pb.GenSeedResponse>;
}
interface IWalletUnlockerService_IInitWallet extends grpc.MethodDefinition<walletunlocker_pb.InitWalletRequest, walletunlocker_pb.InitWalletResponse> {
    path: "/lnrpc.WalletUnlocker/InitWallet";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<walletunlocker_pb.InitWalletRequest>;
    requestDeserialize: grpc.deserialize<walletunlocker_pb.InitWalletRequest>;
    responseSerialize: grpc.serialize<walletunlocker_pb.InitWalletResponse>;
    responseDeserialize: grpc.deserialize<walletunlocker_pb.InitWalletResponse>;
}
interface IWalletUnlockerService_IUnlockWallet extends grpc.MethodDefinition<walletunlocker_pb.UnlockWalletRequest, walletunlocker_pb.UnlockWalletResponse> {
    path: "/lnrpc.WalletUnlocker/UnlockWallet";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<walletunlocker_pb.UnlockWalletRequest>;
    requestDeserialize: grpc.deserialize<walletunlocker_pb.UnlockWalletRequest>;
    responseSerialize: grpc.serialize<walletunlocker_pb.UnlockWalletResponse>;
    responseDeserialize: grpc.deserialize<walletunlocker_pb.UnlockWalletResponse>;
}
interface IWalletUnlockerService_IChangePassword extends grpc.MethodDefinition<walletunlocker_pb.ChangePasswordRequest, walletunlocker_pb.ChangePasswordResponse> {
    path: "/lnrpc.WalletUnlocker/ChangePassword";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<walletunlocker_pb.ChangePasswordRequest>;
    requestDeserialize: grpc.deserialize<walletunlocker_pb.ChangePasswordRequest>;
    responseSerialize: grpc.serialize<walletunlocker_pb.ChangePasswordResponse>;
    responseDeserialize: grpc.deserialize<walletunlocker_pb.ChangePasswordResponse>;
}

export const WalletUnlockerService: IWalletUnlockerService;

export interface IWalletUnlockerServer extends grpc.UntypedServiceImplementation {
    genSeed: grpc.handleUnaryCall<walletunlocker_pb.GenSeedRequest, walletunlocker_pb.GenSeedResponse>;
    initWallet: grpc.handleUnaryCall<walletunlocker_pb.InitWalletRequest, walletunlocker_pb.InitWalletResponse>;
    unlockWallet: grpc.handleUnaryCall<walletunlocker_pb.UnlockWalletRequest, walletunlocker_pb.UnlockWalletResponse>;
    changePassword: grpc.handleUnaryCall<walletunlocker_pb.ChangePasswordRequest, walletunlocker_pb.ChangePasswordResponse>;
}

export interface IWalletUnlockerClient {
    genSeed(request: walletunlocker_pb.GenSeedRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    genSeed(request: walletunlocker_pb.GenSeedRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    genSeed(request: walletunlocker_pb.GenSeedRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    initWallet(request: walletunlocker_pb.InitWalletRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    initWallet(request: walletunlocker_pb.InitWalletRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    initWallet(request: walletunlocker_pb.InitWalletRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    changePassword(request: walletunlocker_pb.ChangePasswordRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
    changePassword(request: walletunlocker_pb.ChangePasswordRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
    changePassword(request: walletunlocker_pb.ChangePasswordRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
}

export class WalletUnlockerClient extends grpc.Client implements IWalletUnlockerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public genSeed(request: walletunlocker_pb.GenSeedRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    public genSeed(request: walletunlocker_pb.GenSeedRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    public genSeed(request: walletunlocker_pb.GenSeedRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.GenSeedResponse) => void): grpc.ClientUnaryCall;
    public initWallet(request: walletunlocker_pb.InitWalletRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    public initWallet(request: walletunlocker_pb.InitWalletRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    public initWallet(request: walletunlocker_pb.InitWalletRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.InitWalletResponse) => void): grpc.ClientUnaryCall;
    public unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    public unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    public unlockWallet(request: walletunlocker_pb.UnlockWalletRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.UnlockWalletResponse) => void): grpc.ClientUnaryCall;
    public changePassword(request: walletunlocker_pb.ChangePasswordRequest, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
    public changePassword(request: walletunlocker_pb.ChangePasswordRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
    public changePassword(request: walletunlocker_pb.ChangePasswordRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: walletunlocker_pb.ChangePasswordResponse) => void): grpc.ClientUnaryCall;
}
