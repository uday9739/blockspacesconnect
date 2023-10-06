// package: invoicesrpc
// file: invoices.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as invoices_pb from "./invoices_pb";
import * as lightning_pb from "./lightning_pb";

interface IInvoicesService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    subscribeSingleInvoice: IInvoicesService_ISubscribeSingleInvoice;
    cancelInvoice: IInvoicesService_ICancelInvoice;
    addHoldInvoice: IInvoicesService_IAddHoldInvoice;
    settleInvoice: IInvoicesService_ISettleInvoice;
    lookupInvoiceV2: IInvoicesService_ILookupInvoiceV2;
}

interface IInvoicesService_ISubscribeSingleInvoice extends grpc.MethodDefinition<invoices_pb.SubscribeSingleInvoiceRequest, lightning_pb.Invoice> {
    path: "/invoicesrpc.Invoices/SubscribeSingleInvoice";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<invoices_pb.SubscribeSingleInvoiceRequest>;
    requestDeserialize: grpc.deserialize<invoices_pb.SubscribeSingleInvoiceRequest>;
    responseSerialize: grpc.serialize<lightning_pb.Invoice>;
    responseDeserialize: grpc.deserialize<lightning_pb.Invoice>;
}
interface IInvoicesService_ICancelInvoice extends grpc.MethodDefinition<invoices_pb.CancelInvoiceMsg, invoices_pb.CancelInvoiceResp> {
    path: "/invoicesrpc.Invoices/CancelInvoice";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<invoices_pb.CancelInvoiceMsg>;
    requestDeserialize: grpc.deserialize<invoices_pb.CancelInvoiceMsg>;
    responseSerialize: grpc.serialize<invoices_pb.CancelInvoiceResp>;
    responseDeserialize: grpc.deserialize<invoices_pb.CancelInvoiceResp>;
}
interface IInvoicesService_IAddHoldInvoice extends grpc.MethodDefinition<invoices_pb.AddHoldInvoiceRequest, invoices_pb.AddHoldInvoiceResp> {
    path: "/invoicesrpc.Invoices/AddHoldInvoice";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<invoices_pb.AddHoldInvoiceRequest>;
    requestDeserialize: grpc.deserialize<invoices_pb.AddHoldInvoiceRequest>;
    responseSerialize: grpc.serialize<invoices_pb.AddHoldInvoiceResp>;
    responseDeserialize: grpc.deserialize<invoices_pb.AddHoldInvoiceResp>;
}
interface IInvoicesService_ISettleInvoice extends grpc.MethodDefinition<invoices_pb.SettleInvoiceMsg, invoices_pb.SettleInvoiceResp> {
    path: "/invoicesrpc.Invoices/SettleInvoice";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<invoices_pb.SettleInvoiceMsg>;
    requestDeserialize: grpc.deserialize<invoices_pb.SettleInvoiceMsg>;
    responseSerialize: grpc.serialize<invoices_pb.SettleInvoiceResp>;
    responseDeserialize: grpc.deserialize<invoices_pb.SettleInvoiceResp>;
}
interface IInvoicesService_ILookupInvoiceV2 extends grpc.MethodDefinition<invoices_pb.LookupInvoiceMsg, lightning_pb.Invoice> {
    path: "/invoicesrpc.Invoices/LookupInvoiceV2";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<invoices_pb.LookupInvoiceMsg>;
    requestDeserialize: grpc.deserialize<invoices_pb.LookupInvoiceMsg>;
    responseSerialize: grpc.serialize<lightning_pb.Invoice>;
    responseDeserialize: grpc.deserialize<lightning_pb.Invoice>;
}

export const InvoicesService: IInvoicesService;

export interface IInvoicesServer extends grpc.UntypedServiceImplementation {
    subscribeSingleInvoice: grpc.handleServerStreamingCall<invoices_pb.SubscribeSingleInvoiceRequest, lightning_pb.Invoice>;
    cancelInvoice: grpc.handleUnaryCall<invoices_pb.CancelInvoiceMsg, invoices_pb.CancelInvoiceResp>;
    addHoldInvoice: grpc.handleUnaryCall<invoices_pb.AddHoldInvoiceRequest, invoices_pb.AddHoldInvoiceResp>;
    settleInvoice: grpc.handleUnaryCall<invoices_pb.SettleInvoiceMsg, invoices_pb.SettleInvoiceResp>;
    lookupInvoiceV2: grpc.handleUnaryCall<invoices_pb.LookupInvoiceMsg, lightning_pb.Invoice>;
}

export interface IInvoicesClient {
    subscribeSingleInvoice(request: invoices_pb.SubscribeSingleInvoiceRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    subscribeSingleInvoice(request: invoices_pb.SubscribeSingleInvoiceRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    cancelInvoice(request: invoices_pb.CancelInvoiceMsg, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    cancelInvoice(request: invoices_pb.CancelInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    cancelInvoice(request: invoices_pb.CancelInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    settleInvoice(request: invoices_pb.SettleInvoiceMsg, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    settleInvoice(request: invoices_pb.SettleInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    settleInvoice(request: invoices_pb.SettleInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
}

export class InvoicesClient extends grpc.Client implements IInvoicesClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public subscribeSingleInvoice(request: invoices_pb.SubscribeSingleInvoiceRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    public subscribeSingleInvoice(request: invoices_pb.SubscribeSingleInvoiceRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    public cancelInvoice(request: invoices_pb.CancelInvoiceMsg, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    public cancelInvoice(request: invoices_pb.CancelInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    public cancelInvoice(request: invoices_pb.CancelInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.CancelInvoiceResp) => void): grpc.ClientUnaryCall;
    public addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    public addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    public addHoldInvoice(request: invoices_pb.AddHoldInvoiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.AddHoldInvoiceResp) => void): grpc.ClientUnaryCall;
    public settleInvoice(request: invoices_pb.SettleInvoiceMsg, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    public settleInvoice(request: invoices_pb.SettleInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    public settleInvoice(request: invoices_pb.SettleInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: invoices_pb.SettleInvoiceResp) => void): grpc.ClientUnaryCall;
    public lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    public lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    public lookupInvoiceV2(request: invoices_pb.LookupInvoiceMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
}
