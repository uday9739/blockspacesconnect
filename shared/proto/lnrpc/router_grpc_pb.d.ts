// package: routerrpc
// file: router.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as router_pb from "./router_pb";
import * as lightning_pb from "./lightning_pb";

interface IRouterService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendPaymentV2: IRouterService_ISendPaymentV2;
    trackPaymentV2: IRouterService_ITrackPaymentV2;
    estimateRouteFee: IRouterService_IEstimateRouteFee;
    sendToRoute: IRouterService_ISendToRoute;
    sendToRouteV2: IRouterService_ISendToRouteV2;
    resetMissionControl: IRouterService_IResetMissionControl;
    queryMissionControl: IRouterService_IQueryMissionControl;
    xImportMissionControl: IRouterService_IXImportMissionControl;
    getMissionControlConfig: IRouterService_IGetMissionControlConfig;
    setMissionControlConfig: IRouterService_ISetMissionControlConfig;
    queryProbability: IRouterService_IQueryProbability;
    buildRoute: IRouterService_IBuildRoute;
    subscribeHtlcEvents: IRouterService_ISubscribeHtlcEvents;
    sendPayment: IRouterService_ISendPayment;
    trackPayment: IRouterService_ITrackPayment;
    htlcInterceptor: IRouterService_IHtlcInterceptor;
    updateChanStatus: IRouterService_IUpdateChanStatus;
}

interface IRouterService_ISendPaymentV2 extends grpc.MethodDefinition<router_pb.SendPaymentRequest, lightning_pb.Payment> {
    path: "/routerrpc.Router/SendPaymentV2";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.SendPaymentRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SendPaymentRequest>;
    responseSerialize: grpc.serialize<lightning_pb.Payment>;
    responseDeserialize: grpc.deserialize<lightning_pb.Payment>;
}
interface IRouterService_ITrackPaymentV2 extends grpc.MethodDefinition<router_pb.TrackPaymentRequest, lightning_pb.Payment> {
    path: "/routerrpc.Router/TrackPaymentV2";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.TrackPaymentRequest>;
    requestDeserialize: grpc.deserialize<router_pb.TrackPaymentRequest>;
    responseSerialize: grpc.serialize<lightning_pb.Payment>;
    responseDeserialize: grpc.deserialize<lightning_pb.Payment>;
}
interface IRouterService_IEstimateRouteFee extends grpc.MethodDefinition<router_pb.RouteFeeRequest, router_pb.RouteFeeResponse> {
    path: "/routerrpc.Router/EstimateRouteFee";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.RouteFeeRequest>;
    requestDeserialize: grpc.deserialize<router_pb.RouteFeeRequest>;
    responseSerialize: grpc.serialize<router_pb.RouteFeeResponse>;
    responseDeserialize: grpc.deserialize<router_pb.RouteFeeResponse>;
}
interface IRouterService_ISendToRoute extends grpc.MethodDefinition<router_pb.SendToRouteRequest, router_pb.SendToRouteResponse> {
    path: "/routerrpc.Router/SendToRoute";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.SendToRouteRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SendToRouteRequest>;
    responseSerialize: grpc.serialize<router_pb.SendToRouteResponse>;
    responseDeserialize: grpc.deserialize<router_pb.SendToRouteResponse>;
}
interface IRouterService_ISendToRouteV2 extends grpc.MethodDefinition<router_pb.SendToRouteRequest, lightning_pb.HTLCAttempt> {
    path: "/routerrpc.Router/SendToRouteV2";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.SendToRouteRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SendToRouteRequest>;
    responseSerialize: grpc.serialize<lightning_pb.HTLCAttempt>;
    responseDeserialize: grpc.deserialize<lightning_pb.HTLCAttempt>;
}
interface IRouterService_IResetMissionControl extends grpc.MethodDefinition<router_pb.ResetMissionControlRequest, router_pb.ResetMissionControlResponse> {
    path: "/routerrpc.Router/ResetMissionControl";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.ResetMissionControlRequest>;
    requestDeserialize: grpc.deserialize<router_pb.ResetMissionControlRequest>;
    responseSerialize: grpc.serialize<router_pb.ResetMissionControlResponse>;
    responseDeserialize: grpc.deserialize<router_pb.ResetMissionControlResponse>;
}
interface IRouterService_IQueryMissionControl extends grpc.MethodDefinition<router_pb.QueryMissionControlRequest, router_pb.QueryMissionControlResponse> {
    path: "/routerrpc.Router/QueryMissionControl";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.QueryMissionControlRequest>;
    requestDeserialize: grpc.deserialize<router_pb.QueryMissionControlRequest>;
    responseSerialize: grpc.serialize<router_pb.QueryMissionControlResponse>;
    responseDeserialize: grpc.deserialize<router_pb.QueryMissionControlResponse>;
}
interface IRouterService_IXImportMissionControl extends grpc.MethodDefinition<router_pb.XImportMissionControlRequest, router_pb.XImportMissionControlResponse> {
    path: "/routerrpc.Router/XImportMissionControl";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.XImportMissionControlRequest>;
    requestDeserialize: grpc.deserialize<router_pb.XImportMissionControlRequest>;
    responseSerialize: grpc.serialize<router_pb.XImportMissionControlResponse>;
    responseDeserialize: grpc.deserialize<router_pb.XImportMissionControlResponse>;
}
interface IRouterService_IGetMissionControlConfig extends grpc.MethodDefinition<router_pb.GetMissionControlConfigRequest, router_pb.GetMissionControlConfigResponse> {
    path: "/routerrpc.Router/GetMissionControlConfig";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.GetMissionControlConfigRequest>;
    requestDeserialize: grpc.deserialize<router_pb.GetMissionControlConfigRequest>;
    responseSerialize: grpc.serialize<router_pb.GetMissionControlConfigResponse>;
    responseDeserialize: grpc.deserialize<router_pb.GetMissionControlConfigResponse>;
}
interface IRouterService_ISetMissionControlConfig extends grpc.MethodDefinition<router_pb.SetMissionControlConfigRequest, router_pb.SetMissionControlConfigResponse> {
    path: "/routerrpc.Router/SetMissionControlConfig";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.SetMissionControlConfigRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SetMissionControlConfigRequest>;
    responseSerialize: grpc.serialize<router_pb.SetMissionControlConfigResponse>;
    responseDeserialize: grpc.deserialize<router_pb.SetMissionControlConfigResponse>;
}
interface IRouterService_IQueryProbability extends grpc.MethodDefinition<router_pb.QueryProbabilityRequest, router_pb.QueryProbabilityResponse> {
    path: "/routerrpc.Router/QueryProbability";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.QueryProbabilityRequest>;
    requestDeserialize: grpc.deserialize<router_pb.QueryProbabilityRequest>;
    responseSerialize: grpc.serialize<router_pb.QueryProbabilityResponse>;
    responseDeserialize: grpc.deserialize<router_pb.QueryProbabilityResponse>;
}
interface IRouterService_IBuildRoute extends grpc.MethodDefinition<router_pb.BuildRouteRequest, router_pb.BuildRouteResponse> {
    path: "/routerrpc.Router/BuildRoute";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.BuildRouteRequest>;
    requestDeserialize: grpc.deserialize<router_pb.BuildRouteRequest>;
    responseSerialize: grpc.serialize<router_pb.BuildRouteResponse>;
    responseDeserialize: grpc.deserialize<router_pb.BuildRouteResponse>;
}
interface IRouterService_ISubscribeHtlcEvents extends grpc.MethodDefinition<router_pb.SubscribeHtlcEventsRequest, router_pb.HtlcEvent> {
    path: "/routerrpc.Router/SubscribeHtlcEvents";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.SubscribeHtlcEventsRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SubscribeHtlcEventsRequest>;
    responseSerialize: grpc.serialize<router_pb.HtlcEvent>;
    responseDeserialize: grpc.deserialize<router_pb.HtlcEvent>;
}
interface IRouterService_ISendPayment extends grpc.MethodDefinition<router_pb.SendPaymentRequest, router_pb.PaymentStatus> {
    path: "/routerrpc.Router/SendPayment";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.SendPaymentRequest>;
    requestDeserialize: grpc.deserialize<router_pb.SendPaymentRequest>;
    responseSerialize: grpc.serialize<router_pb.PaymentStatus>;
    responseDeserialize: grpc.deserialize<router_pb.PaymentStatus>;
}
interface IRouterService_ITrackPayment extends grpc.MethodDefinition<router_pb.TrackPaymentRequest, router_pb.PaymentStatus> {
    path: "/routerrpc.Router/TrackPayment";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.TrackPaymentRequest>;
    requestDeserialize: grpc.deserialize<router_pb.TrackPaymentRequest>;
    responseSerialize: grpc.serialize<router_pb.PaymentStatus>;
    responseDeserialize: grpc.deserialize<router_pb.PaymentStatus>;
}
interface IRouterService_IHtlcInterceptor extends grpc.MethodDefinition<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest> {
    path: "/routerrpc.Router/HtlcInterceptor";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<router_pb.ForwardHtlcInterceptResponse>;
    requestDeserialize: grpc.deserialize<router_pb.ForwardHtlcInterceptResponse>;
    responseSerialize: grpc.serialize<router_pb.ForwardHtlcInterceptRequest>;
    responseDeserialize: grpc.deserialize<router_pb.ForwardHtlcInterceptRequest>;
}
interface IRouterService_IUpdateChanStatus extends grpc.MethodDefinition<router_pb.UpdateChanStatusRequest, router_pb.UpdateChanStatusResponse> {
    path: "/routerrpc.Router/UpdateChanStatus";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<router_pb.UpdateChanStatusRequest>;
    requestDeserialize: grpc.deserialize<router_pb.UpdateChanStatusRequest>;
    responseSerialize: grpc.serialize<router_pb.UpdateChanStatusResponse>;
    responseDeserialize: grpc.deserialize<router_pb.UpdateChanStatusResponse>;
}

export const RouterService: IRouterService;

export interface IRouterServer extends grpc.UntypedServiceImplementation {
    sendPaymentV2: grpc.handleServerStreamingCall<router_pb.SendPaymentRequest, lightning_pb.Payment>;
    trackPaymentV2: grpc.handleServerStreamingCall<router_pb.TrackPaymentRequest, lightning_pb.Payment>;
    estimateRouteFee: grpc.handleUnaryCall<router_pb.RouteFeeRequest, router_pb.RouteFeeResponse>;
    sendToRoute: grpc.handleUnaryCall<router_pb.SendToRouteRequest, router_pb.SendToRouteResponse>;
    sendToRouteV2: grpc.handleUnaryCall<router_pb.SendToRouteRequest, lightning_pb.HTLCAttempt>;
    resetMissionControl: grpc.handleUnaryCall<router_pb.ResetMissionControlRequest, router_pb.ResetMissionControlResponse>;
    queryMissionControl: grpc.handleUnaryCall<router_pb.QueryMissionControlRequest, router_pb.QueryMissionControlResponse>;
    xImportMissionControl: grpc.handleUnaryCall<router_pb.XImportMissionControlRequest, router_pb.XImportMissionControlResponse>;
    getMissionControlConfig: grpc.handleUnaryCall<router_pb.GetMissionControlConfigRequest, router_pb.GetMissionControlConfigResponse>;
    setMissionControlConfig: grpc.handleUnaryCall<router_pb.SetMissionControlConfigRequest, router_pb.SetMissionControlConfigResponse>;
    queryProbability: grpc.handleUnaryCall<router_pb.QueryProbabilityRequest, router_pb.QueryProbabilityResponse>;
    buildRoute: grpc.handleUnaryCall<router_pb.BuildRouteRequest, router_pb.BuildRouteResponse>;
    subscribeHtlcEvents: grpc.handleServerStreamingCall<router_pb.SubscribeHtlcEventsRequest, router_pb.HtlcEvent>;
    sendPayment: grpc.handleServerStreamingCall<router_pb.SendPaymentRequest, router_pb.PaymentStatus>;
    trackPayment: grpc.handleServerStreamingCall<router_pb.TrackPaymentRequest, router_pb.PaymentStatus>;
    htlcInterceptor: grpc.handleBidiStreamingCall<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    updateChanStatus: grpc.handleUnaryCall<router_pb.UpdateChanStatusRequest, router_pb.UpdateChanStatusResponse>;
}

export interface IRouterClient {
    sendPaymentV2(request: router_pb.SendPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    sendPaymentV2(request: router_pb.SendPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    trackPaymentV2(request: router_pb.TrackPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    trackPaymentV2(request: router_pb.TrackPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    estimateRouteFee(request: router_pb.RouteFeeRequest, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    estimateRouteFee(request: router_pb.RouteFeeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    estimateRouteFee(request: router_pb.RouteFeeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    sendToRoute(request: router_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    sendToRoute(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    sendToRoute(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    sendToRouteV2(request: router_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    sendToRouteV2(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    sendToRouteV2(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    resetMissionControl(request: router_pb.ResetMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    resetMissionControl(request: router_pb.ResetMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    resetMissionControl(request: router_pb.ResetMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    queryMissionControl(request: router_pb.QueryMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    queryMissionControl(request: router_pb.QueryMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    queryMissionControl(request: router_pb.QueryMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    xImportMissionControl(request: router_pb.XImportMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    xImportMissionControl(request: router_pb.XImportMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    xImportMissionControl(request: router_pb.XImportMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    queryProbability(request: router_pb.QueryProbabilityRequest, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    queryProbability(request: router_pb.QueryProbabilityRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    queryProbability(request: router_pb.QueryProbabilityRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    buildRoute(request: router_pb.BuildRouteRequest, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    buildRoute(request: router_pb.BuildRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    buildRoute(request: router_pb.BuildRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    subscribeHtlcEvents(request: router_pb.SubscribeHtlcEventsRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.HtlcEvent>;
    subscribeHtlcEvents(request: router_pb.SubscribeHtlcEventsRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.HtlcEvent>;
    sendPayment(request: router_pb.SendPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    sendPayment(request: router_pb.SendPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    trackPayment(request: router_pb.TrackPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    trackPayment(request: router_pb.TrackPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    htlcInterceptor(): grpc.ClientDuplexStream<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    htlcInterceptor(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    htlcInterceptor(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    updateChanStatus(request: router_pb.UpdateChanStatusRequest, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
    updateChanStatus(request: router_pb.UpdateChanStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
    updateChanStatus(request: router_pb.UpdateChanStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
}

export class RouterClient extends grpc.Client implements IRouterClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public sendPaymentV2(request: router_pb.SendPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    public sendPaymentV2(request: router_pb.SendPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    public trackPaymentV2(request: router_pb.TrackPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    public trackPaymentV2(request: router_pb.TrackPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Payment>;
    public estimateRouteFee(request: router_pb.RouteFeeRequest, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    public estimateRouteFee(request: router_pb.RouteFeeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    public estimateRouteFee(request: router_pb.RouteFeeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.RouteFeeResponse) => void): grpc.ClientUnaryCall;
    public sendToRoute(request: router_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    public sendToRoute(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    public sendToRoute(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.SendToRouteResponse) => void): grpc.ClientUnaryCall;
    public sendToRouteV2(request: router_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    public sendToRouteV2(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    public sendToRouteV2(request: router_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.HTLCAttempt) => void): grpc.ClientUnaryCall;
    public resetMissionControl(request: router_pb.ResetMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    public resetMissionControl(request: router_pb.ResetMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    public resetMissionControl(request: router_pb.ResetMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.ResetMissionControlResponse) => void): grpc.ClientUnaryCall;
    public queryMissionControl(request: router_pb.QueryMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    public queryMissionControl(request: router_pb.QueryMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    public queryMissionControl(request: router_pb.QueryMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.QueryMissionControlResponse) => void): grpc.ClientUnaryCall;
    public xImportMissionControl(request: router_pb.XImportMissionControlRequest, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    public xImportMissionControl(request: router_pb.XImportMissionControlRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    public xImportMissionControl(request: router_pb.XImportMissionControlRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.XImportMissionControlResponse) => void): grpc.ClientUnaryCall;
    public getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public getMissionControlConfig(request: router_pb.GetMissionControlConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.GetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public setMissionControlConfig(request: router_pb.SetMissionControlConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.SetMissionControlConfigResponse) => void): grpc.ClientUnaryCall;
    public queryProbability(request: router_pb.QueryProbabilityRequest, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    public queryProbability(request: router_pb.QueryProbabilityRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    public queryProbability(request: router_pb.QueryProbabilityRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.QueryProbabilityResponse) => void): grpc.ClientUnaryCall;
    public buildRoute(request: router_pb.BuildRouteRequest, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    public buildRoute(request: router_pb.BuildRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    public buildRoute(request: router_pb.BuildRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.BuildRouteResponse) => void): grpc.ClientUnaryCall;
    public subscribeHtlcEvents(request: router_pb.SubscribeHtlcEventsRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.HtlcEvent>;
    public subscribeHtlcEvents(request: router_pb.SubscribeHtlcEventsRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.HtlcEvent>;
    public sendPayment(request: router_pb.SendPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    public sendPayment(request: router_pb.SendPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    public trackPayment(request: router_pb.TrackPaymentRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    public trackPayment(request: router_pb.TrackPaymentRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<router_pb.PaymentStatus>;
    public htlcInterceptor(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    public htlcInterceptor(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<router_pb.ForwardHtlcInterceptResponse, router_pb.ForwardHtlcInterceptRequest>;
    public updateChanStatus(request: router_pb.UpdateChanStatusRequest, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
    public updateChanStatus(request: router_pb.UpdateChanStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
    public updateChanStatus(request: router_pb.UpdateChanStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: router_pb.UpdateChanStatusResponse) => void): grpc.ClientUnaryCall;
}
