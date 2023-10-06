// package: lnrpc
// file: lightning.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as lightning_pb from "./lightning_pb";

interface ILightningService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    walletBalance: ILightningService_IWalletBalance;
    channelBalance: ILightningService_IChannelBalance;
    getTransactions: ILightningService_IGetTransactions;
    estimateFee: ILightningService_IEstimateFee;
    sendCoins: ILightningService_ISendCoins;
    listUnspent: ILightningService_IListUnspent;
    subscribeTransactions: ILightningService_ISubscribeTransactions;
    sendMany: ILightningService_ISendMany;
    newAddress: ILightningService_INewAddress;
    signMessage: ILightningService_ISignMessage;
    verifyMessage: ILightningService_IVerifyMessage;
    connectPeer: ILightningService_IConnectPeer;
    disconnectPeer: ILightningService_IDisconnectPeer;
    listPeers: ILightningService_IListPeers;
    subscribePeerEvents: ILightningService_ISubscribePeerEvents;
    getInfo: ILightningService_IGetInfo;
    getRecoveryInfo: ILightningService_IGetRecoveryInfo;
    pendingChannels: ILightningService_IPendingChannels;
    listChannels: ILightningService_IListChannels;
    subscribeChannelEvents: ILightningService_ISubscribeChannelEvents;
    closedChannels: ILightningService_IClosedChannels;
    openChannelSync: ILightningService_IOpenChannelSync;
    openChannel: ILightningService_IOpenChannel;
    batchOpenChannel: ILightningService_IBatchOpenChannel;
    fundingStateStep: ILightningService_IFundingStateStep;
    channelAcceptor: ILightningService_IChannelAcceptor;
    closeChannel: ILightningService_ICloseChannel;
    abandonChannel: ILightningService_IAbandonChannel;
    sendPayment: ILightningService_ISendPayment;
    sendPaymentSync: ILightningService_ISendPaymentSync;
    sendToRoute: ILightningService_ISendToRoute;
    sendToRouteSync: ILightningService_ISendToRouteSync;
    addInvoice: ILightningService_IAddInvoice;
    listInvoices: ILightningService_IListInvoices;
    lookupInvoice: ILightningService_ILookupInvoice;
    subscribeInvoices: ILightningService_ISubscribeInvoices;
    decodePayReq: ILightningService_IDecodePayReq;
    listPayments: ILightningService_IListPayments;
    deletePayment: ILightningService_IDeletePayment;
    deleteAllPayments: ILightningService_IDeleteAllPayments;
    describeGraph: ILightningService_IDescribeGraph;
    getNodeMetrics: ILightningService_IGetNodeMetrics;
    getChanInfo: ILightningService_IGetChanInfo;
    getNodeInfo: ILightningService_IGetNodeInfo;
    queryRoutes: ILightningService_IQueryRoutes;
    getNetworkInfo: ILightningService_IGetNetworkInfo;
    stopDaemon: ILightningService_IStopDaemon;
    subscribeChannelGraph: ILightningService_ISubscribeChannelGraph;
    debugLevel: ILightningService_IDebugLevel;
    feeReport: ILightningService_IFeeReport;
    updateChannelPolicy: ILightningService_IUpdateChannelPolicy;
    forwardingHistory: ILightningService_IForwardingHistory;
    exportChannelBackup: ILightningService_IExportChannelBackup;
    exportAllChannelBackups: ILightningService_IExportAllChannelBackups;
    verifyChanBackup: ILightningService_IVerifyChanBackup;
    restoreChannelBackups: ILightningService_IRestoreChannelBackups;
    subscribeChannelBackups: ILightningService_ISubscribeChannelBackups;
    bakeMacaroon: ILightningService_IBakeMacaroon;
    listMacaroonIDs: ILightningService_IListMacaroonIDs;
    deleteMacaroonID: ILightningService_IDeleteMacaroonID;
    listPermissions: ILightningService_IListPermissions;
    checkMacaroonPermissions: ILightningService_ICheckMacaroonPermissions;
    registerRPCMiddleware: ILightningService_IRegisterRPCMiddleware;
    sendCustomMessage: ILightningService_ISendCustomMessage;
    subscribeCustomMessages: ILightningService_ISubscribeCustomMessages;
}

interface ILightningService_IWalletBalance extends grpc.MethodDefinition<lightning_pb.WalletBalanceRequest, lightning_pb.WalletBalanceResponse> {
    path: "/lnrpc.Lightning/WalletBalance";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.WalletBalanceRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.WalletBalanceRequest>;
    responseSerialize: grpc.serialize<lightning_pb.WalletBalanceResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.WalletBalanceResponse>;
}
interface ILightningService_IChannelBalance extends grpc.MethodDefinition<lightning_pb.ChannelBalanceRequest, lightning_pb.ChannelBalanceResponse> {
    path: "/lnrpc.Lightning/ChannelBalance";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ChannelBalanceRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChannelBalanceRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelBalanceResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelBalanceResponse>;
}
interface ILightningService_IGetTransactions extends grpc.MethodDefinition<lightning_pb.GetTransactionsRequest, lightning_pb.TransactionDetails> {
    path: "/lnrpc.Lightning/GetTransactions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.GetTransactionsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.GetTransactionsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.TransactionDetails>;
    responseDeserialize: grpc.deserialize<lightning_pb.TransactionDetails>;
}
interface ILightningService_IEstimateFee extends grpc.MethodDefinition<lightning_pb.EstimateFeeRequest, lightning_pb.EstimateFeeResponse> {
    path: "/lnrpc.Lightning/EstimateFee";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.EstimateFeeRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.EstimateFeeRequest>;
    responseSerialize: grpc.serialize<lightning_pb.EstimateFeeResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.EstimateFeeResponse>;
}
interface ILightningService_ISendCoins extends grpc.MethodDefinition<lightning_pb.SendCoinsRequest, lightning_pb.SendCoinsResponse> {
    path: "/lnrpc.Lightning/SendCoins";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SendCoinsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendCoinsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendCoinsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendCoinsResponse>;
}
interface ILightningService_IListUnspent extends grpc.MethodDefinition<lightning_pb.ListUnspentRequest, lightning_pb.ListUnspentResponse> {
    path: "/lnrpc.Lightning/ListUnspent";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListUnspentRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListUnspentRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListUnspentResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListUnspentResponse>;
}
interface ILightningService_ISubscribeTransactions extends grpc.MethodDefinition<lightning_pb.GetTransactionsRequest, lightning_pb.Transaction> {
    path: "/lnrpc.Lightning/SubscribeTransactions";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.GetTransactionsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.GetTransactionsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.Transaction>;
    responseDeserialize: grpc.deserialize<lightning_pb.Transaction>;
}
interface ILightningService_ISendMany extends grpc.MethodDefinition<lightning_pb.SendManyRequest, lightning_pb.SendManyResponse> {
    path: "/lnrpc.Lightning/SendMany";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SendManyRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendManyRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendManyResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendManyResponse>;
}
interface ILightningService_INewAddress extends grpc.MethodDefinition<lightning_pb.NewAddressRequest, lightning_pb.NewAddressResponse> {
    path: "/lnrpc.Lightning/NewAddress";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.NewAddressRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.NewAddressRequest>;
    responseSerialize: grpc.serialize<lightning_pb.NewAddressResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.NewAddressResponse>;
}
interface ILightningService_ISignMessage extends grpc.MethodDefinition<lightning_pb.SignMessageRequest, lightning_pb.SignMessageResponse> {
    path: "/lnrpc.Lightning/SignMessage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SignMessageRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SignMessageRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SignMessageResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SignMessageResponse>;
}
interface ILightningService_IVerifyMessage extends grpc.MethodDefinition<lightning_pb.VerifyMessageRequest, lightning_pb.VerifyMessageResponse> {
    path: "/lnrpc.Lightning/VerifyMessage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.VerifyMessageRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.VerifyMessageRequest>;
    responseSerialize: grpc.serialize<lightning_pb.VerifyMessageResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.VerifyMessageResponse>;
}
interface ILightningService_IConnectPeer extends grpc.MethodDefinition<lightning_pb.ConnectPeerRequest, lightning_pb.ConnectPeerResponse> {
    path: "/lnrpc.Lightning/ConnectPeer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ConnectPeerRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ConnectPeerRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ConnectPeerResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ConnectPeerResponse>;
}
interface ILightningService_IDisconnectPeer extends grpc.MethodDefinition<lightning_pb.DisconnectPeerRequest, lightning_pb.DisconnectPeerResponse> {
    path: "/lnrpc.Lightning/DisconnectPeer";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.DisconnectPeerRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.DisconnectPeerRequest>;
    responseSerialize: grpc.serialize<lightning_pb.DisconnectPeerResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.DisconnectPeerResponse>;
}
interface ILightningService_IListPeers extends grpc.MethodDefinition<lightning_pb.ListPeersRequest, lightning_pb.ListPeersResponse> {
    path: "/lnrpc.Lightning/ListPeers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListPeersRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListPeersRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListPeersResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListPeersResponse>;
}
interface ILightningService_ISubscribePeerEvents extends grpc.MethodDefinition<lightning_pb.PeerEventSubscription, lightning_pb.PeerEvent> {
    path: "/lnrpc.Lightning/SubscribePeerEvents";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.PeerEventSubscription>;
    requestDeserialize: grpc.deserialize<lightning_pb.PeerEventSubscription>;
    responseSerialize: grpc.serialize<lightning_pb.PeerEvent>;
    responseDeserialize: grpc.deserialize<lightning_pb.PeerEvent>;
}
interface ILightningService_IGetInfo extends grpc.MethodDefinition<lightning_pb.GetInfoRequest, lightning_pb.GetInfoResponse> {
    path: "/lnrpc.Lightning/GetInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.GetInfoRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.GetInfoRequest>;
    responseSerialize: grpc.serialize<lightning_pb.GetInfoResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.GetInfoResponse>;
}
interface ILightningService_IGetRecoveryInfo extends grpc.MethodDefinition<lightning_pb.GetRecoveryInfoRequest, lightning_pb.GetRecoveryInfoResponse> {
    path: "/lnrpc.Lightning/GetRecoveryInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.GetRecoveryInfoRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.GetRecoveryInfoRequest>;
    responseSerialize: grpc.serialize<lightning_pb.GetRecoveryInfoResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.GetRecoveryInfoResponse>;
}
interface ILightningService_IPendingChannels extends grpc.MethodDefinition<lightning_pb.PendingChannelsRequest, lightning_pb.PendingChannelsResponse> {
    path: "/lnrpc.Lightning/PendingChannels";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.PendingChannelsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.PendingChannelsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.PendingChannelsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.PendingChannelsResponse>;
}
interface ILightningService_IListChannels extends grpc.MethodDefinition<lightning_pb.ListChannelsRequest, lightning_pb.ListChannelsResponse> {
    path: "/lnrpc.Lightning/ListChannels";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListChannelsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListChannelsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListChannelsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListChannelsResponse>;
}
interface ILightningService_ISubscribeChannelEvents extends grpc.MethodDefinition<lightning_pb.ChannelEventSubscription, lightning_pb.ChannelEventUpdate> {
    path: "/lnrpc.Lightning/SubscribeChannelEvents";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.ChannelEventSubscription>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChannelEventSubscription>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelEventUpdate>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelEventUpdate>;
}
interface ILightningService_IClosedChannels extends grpc.MethodDefinition<lightning_pb.ClosedChannelsRequest, lightning_pb.ClosedChannelsResponse> {
    path: "/lnrpc.Lightning/ClosedChannels";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ClosedChannelsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ClosedChannelsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ClosedChannelsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ClosedChannelsResponse>;
}
interface ILightningService_IOpenChannelSync extends grpc.MethodDefinition<lightning_pb.OpenChannelRequest, lightning_pb.ChannelPoint> {
    path: "/lnrpc.Lightning/OpenChannelSync";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.OpenChannelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.OpenChannelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelPoint>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelPoint>;
}
interface ILightningService_IOpenChannel extends grpc.MethodDefinition<lightning_pb.OpenChannelRequest, lightning_pb.OpenStatusUpdate> {
    path: "/lnrpc.Lightning/OpenChannel";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.OpenChannelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.OpenChannelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.OpenStatusUpdate>;
    responseDeserialize: grpc.deserialize<lightning_pb.OpenStatusUpdate>;
}
interface ILightningService_IBatchOpenChannel extends grpc.MethodDefinition<lightning_pb.BatchOpenChannelRequest, lightning_pb.BatchOpenChannelResponse> {
    path: "/lnrpc.Lightning/BatchOpenChannel";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.BatchOpenChannelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.BatchOpenChannelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.BatchOpenChannelResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.BatchOpenChannelResponse>;
}
interface ILightningService_IFundingStateStep extends grpc.MethodDefinition<lightning_pb.FundingTransitionMsg, lightning_pb.FundingStateStepResp> {
    path: "/lnrpc.Lightning/FundingStateStep";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.FundingTransitionMsg>;
    requestDeserialize: grpc.deserialize<lightning_pb.FundingTransitionMsg>;
    responseSerialize: grpc.serialize<lightning_pb.FundingStateStepResp>;
    responseDeserialize: grpc.deserialize<lightning_pb.FundingStateStepResp>;
}
interface ILightningService_IChannelAcceptor extends grpc.MethodDefinition<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest> {
    path: "/lnrpc.Lightning/ChannelAcceptor";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.ChannelAcceptResponse>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChannelAcceptResponse>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelAcceptRequest>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelAcceptRequest>;
}
interface ILightningService_ICloseChannel extends grpc.MethodDefinition<lightning_pb.CloseChannelRequest, lightning_pb.CloseStatusUpdate> {
    path: "/lnrpc.Lightning/CloseChannel";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.CloseChannelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.CloseChannelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.CloseStatusUpdate>;
    responseDeserialize: grpc.deserialize<lightning_pb.CloseStatusUpdate>;
}
interface ILightningService_IAbandonChannel extends grpc.MethodDefinition<lightning_pb.AbandonChannelRequest, lightning_pb.AbandonChannelResponse> {
    path: "/lnrpc.Lightning/AbandonChannel";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.AbandonChannelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.AbandonChannelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.AbandonChannelResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.AbandonChannelResponse>;
}
interface ILightningService_ISendPayment extends grpc.MethodDefinition<lightning_pb.SendRequest, lightning_pb.SendResponse> {
    path: "/lnrpc.Lightning/SendPayment";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.SendRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendResponse>;
}
interface ILightningService_ISendPaymentSync extends grpc.MethodDefinition<lightning_pb.SendRequest, lightning_pb.SendResponse> {
    path: "/lnrpc.Lightning/SendPaymentSync";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SendRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendResponse>;
}
interface ILightningService_ISendToRoute extends grpc.MethodDefinition<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse> {
    path: "/lnrpc.Lightning/SendToRoute";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.SendToRouteRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendToRouteRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendResponse>;
}
interface ILightningService_ISendToRouteSync extends grpc.MethodDefinition<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse> {
    path: "/lnrpc.Lightning/SendToRouteSync";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SendToRouteRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendToRouteRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendResponse>;
}
interface ILightningService_IAddInvoice extends grpc.MethodDefinition<lightning_pb.Invoice, lightning_pb.AddInvoiceResponse> {
    path: "/lnrpc.Lightning/AddInvoice";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.Invoice>;
    requestDeserialize: grpc.deserialize<lightning_pb.Invoice>;
    responseSerialize: grpc.serialize<lightning_pb.AddInvoiceResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.AddInvoiceResponse>;
}
interface ILightningService_IListInvoices extends grpc.MethodDefinition<lightning_pb.ListInvoiceRequest, lightning_pb.ListInvoiceResponse> {
    path: "/lnrpc.Lightning/ListInvoices";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListInvoiceRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListInvoiceRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListInvoiceResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListInvoiceResponse>;
}
interface ILightningService_ILookupInvoice extends grpc.MethodDefinition<lightning_pb.PaymentHash, lightning_pb.Invoice> {
    path: "/lnrpc.Lightning/LookupInvoice";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.PaymentHash>;
    requestDeserialize: grpc.deserialize<lightning_pb.PaymentHash>;
    responseSerialize: grpc.serialize<lightning_pb.Invoice>;
    responseDeserialize: grpc.deserialize<lightning_pb.Invoice>;
}
interface ILightningService_ISubscribeInvoices extends grpc.MethodDefinition<lightning_pb.InvoiceSubscription, lightning_pb.Invoice> {
    path: "/lnrpc.Lightning/SubscribeInvoices";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.InvoiceSubscription>;
    requestDeserialize: grpc.deserialize<lightning_pb.InvoiceSubscription>;
    responseSerialize: grpc.serialize<lightning_pb.Invoice>;
    responseDeserialize: grpc.deserialize<lightning_pb.Invoice>;
}
interface ILightningService_IDecodePayReq extends grpc.MethodDefinition<lightning_pb.PayReqString, lightning_pb.PayReq> {
    path: "/lnrpc.Lightning/DecodePayReq";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.PayReqString>;
    requestDeserialize: grpc.deserialize<lightning_pb.PayReqString>;
    responseSerialize: grpc.serialize<lightning_pb.PayReq>;
    responseDeserialize: grpc.deserialize<lightning_pb.PayReq>;
}
interface ILightningService_IListPayments extends grpc.MethodDefinition<lightning_pb.ListPaymentsRequest, lightning_pb.ListPaymentsResponse> {
    path: "/lnrpc.Lightning/ListPayments";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListPaymentsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListPaymentsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListPaymentsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListPaymentsResponse>;
}
interface ILightningService_IDeletePayment extends grpc.MethodDefinition<lightning_pb.DeletePaymentRequest, lightning_pb.DeletePaymentResponse> {
    path: "/lnrpc.Lightning/DeletePayment";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.DeletePaymentRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.DeletePaymentRequest>;
    responseSerialize: grpc.serialize<lightning_pb.DeletePaymentResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.DeletePaymentResponse>;
}
interface ILightningService_IDeleteAllPayments extends grpc.MethodDefinition<lightning_pb.DeleteAllPaymentsRequest, lightning_pb.DeleteAllPaymentsResponse> {
    path: "/lnrpc.Lightning/DeleteAllPayments";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.DeleteAllPaymentsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.DeleteAllPaymentsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.DeleteAllPaymentsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.DeleteAllPaymentsResponse>;
}
interface ILightningService_IDescribeGraph extends grpc.MethodDefinition<lightning_pb.ChannelGraphRequest, lightning_pb.ChannelGraph> {
    path: "/lnrpc.Lightning/DescribeGraph";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ChannelGraphRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChannelGraphRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelGraph>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelGraph>;
}
interface ILightningService_IGetNodeMetrics extends grpc.MethodDefinition<lightning_pb.NodeMetricsRequest, lightning_pb.NodeMetricsResponse> {
    path: "/lnrpc.Lightning/GetNodeMetrics";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.NodeMetricsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.NodeMetricsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.NodeMetricsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.NodeMetricsResponse>;
}
interface ILightningService_IGetChanInfo extends grpc.MethodDefinition<lightning_pb.ChanInfoRequest, lightning_pb.ChannelEdge> {
    path: "/lnrpc.Lightning/GetChanInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ChanInfoRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChanInfoRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelEdge>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelEdge>;
}
interface ILightningService_IGetNodeInfo extends grpc.MethodDefinition<lightning_pb.NodeInfoRequest, lightning_pb.NodeInfo> {
    path: "/lnrpc.Lightning/GetNodeInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.NodeInfoRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.NodeInfoRequest>;
    responseSerialize: grpc.serialize<lightning_pb.NodeInfo>;
    responseDeserialize: grpc.deserialize<lightning_pb.NodeInfo>;
}
interface ILightningService_IQueryRoutes extends grpc.MethodDefinition<lightning_pb.QueryRoutesRequest, lightning_pb.QueryRoutesResponse> {
    path: "/lnrpc.Lightning/QueryRoutes";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.QueryRoutesRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.QueryRoutesRequest>;
    responseSerialize: grpc.serialize<lightning_pb.QueryRoutesResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.QueryRoutesResponse>;
}
interface ILightningService_IGetNetworkInfo extends grpc.MethodDefinition<lightning_pb.NetworkInfoRequest, lightning_pb.NetworkInfo> {
    path: "/lnrpc.Lightning/GetNetworkInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.NetworkInfoRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.NetworkInfoRequest>;
    responseSerialize: grpc.serialize<lightning_pb.NetworkInfo>;
    responseDeserialize: grpc.deserialize<lightning_pb.NetworkInfo>;
}
interface ILightningService_IStopDaemon extends grpc.MethodDefinition<lightning_pb.StopRequest, lightning_pb.StopResponse> {
    path: "/lnrpc.Lightning/StopDaemon";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.StopRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.StopRequest>;
    responseSerialize: grpc.serialize<lightning_pb.StopResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.StopResponse>;
}
interface ILightningService_ISubscribeChannelGraph extends grpc.MethodDefinition<lightning_pb.GraphTopologySubscription, lightning_pb.GraphTopologyUpdate> {
    path: "/lnrpc.Lightning/SubscribeChannelGraph";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.GraphTopologySubscription>;
    requestDeserialize: grpc.deserialize<lightning_pb.GraphTopologySubscription>;
    responseSerialize: grpc.serialize<lightning_pb.GraphTopologyUpdate>;
    responseDeserialize: grpc.deserialize<lightning_pb.GraphTopologyUpdate>;
}
interface ILightningService_IDebugLevel extends grpc.MethodDefinition<lightning_pb.DebugLevelRequest, lightning_pb.DebugLevelResponse> {
    path: "/lnrpc.Lightning/DebugLevel";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.DebugLevelRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.DebugLevelRequest>;
    responseSerialize: grpc.serialize<lightning_pb.DebugLevelResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.DebugLevelResponse>;
}
interface ILightningService_IFeeReport extends grpc.MethodDefinition<lightning_pb.FeeReportRequest, lightning_pb.FeeReportResponse> {
    path: "/lnrpc.Lightning/FeeReport";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.FeeReportRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.FeeReportRequest>;
    responseSerialize: grpc.serialize<lightning_pb.FeeReportResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.FeeReportResponse>;
}
interface ILightningService_IUpdateChannelPolicy extends grpc.MethodDefinition<lightning_pb.PolicyUpdateRequest, lightning_pb.PolicyUpdateResponse> {
    path: "/lnrpc.Lightning/UpdateChannelPolicy";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.PolicyUpdateRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.PolicyUpdateRequest>;
    responseSerialize: grpc.serialize<lightning_pb.PolicyUpdateResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.PolicyUpdateResponse>;
}
interface ILightningService_IForwardingHistory extends grpc.MethodDefinition<lightning_pb.ForwardingHistoryRequest, lightning_pb.ForwardingHistoryResponse> {
    path: "/lnrpc.Lightning/ForwardingHistory";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ForwardingHistoryRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ForwardingHistoryRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ForwardingHistoryResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ForwardingHistoryResponse>;
}
interface ILightningService_IExportChannelBackup extends grpc.MethodDefinition<lightning_pb.ExportChannelBackupRequest, lightning_pb.ChannelBackup> {
    path: "/lnrpc.Lightning/ExportChannelBackup";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ExportChannelBackupRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ExportChannelBackupRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChannelBackup>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChannelBackup>;
}
interface ILightningService_IExportAllChannelBackups extends grpc.MethodDefinition<lightning_pb.ChanBackupExportRequest, lightning_pb.ChanBackupSnapshot> {
    path: "/lnrpc.Lightning/ExportAllChannelBackups";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ChanBackupExportRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChanBackupExportRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ChanBackupSnapshot>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChanBackupSnapshot>;
}
interface ILightningService_IVerifyChanBackup extends grpc.MethodDefinition<lightning_pb.ChanBackupSnapshot, lightning_pb.VerifyChanBackupResponse> {
    path: "/lnrpc.Lightning/VerifyChanBackup";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ChanBackupSnapshot>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChanBackupSnapshot>;
    responseSerialize: grpc.serialize<lightning_pb.VerifyChanBackupResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.VerifyChanBackupResponse>;
}
interface ILightningService_IRestoreChannelBackups extends grpc.MethodDefinition<lightning_pb.RestoreChanBackupRequest, lightning_pb.RestoreBackupResponse> {
    path: "/lnrpc.Lightning/RestoreChannelBackups";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.RestoreChanBackupRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.RestoreChanBackupRequest>;
    responseSerialize: grpc.serialize<lightning_pb.RestoreBackupResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.RestoreBackupResponse>;
}
interface ILightningService_ISubscribeChannelBackups extends grpc.MethodDefinition<lightning_pb.ChannelBackupSubscription, lightning_pb.ChanBackupSnapshot> {
    path: "/lnrpc.Lightning/SubscribeChannelBackups";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.ChannelBackupSubscription>;
    requestDeserialize: grpc.deserialize<lightning_pb.ChannelBackupSubscription>;
    responseSerialize: grpc.serialize<lightning_pb.ChanBackupSnapshot>;
    responseDeserialize: grpc.deserialize<lightning_pb.ChanBackupSnapshot>;
}
interface ILightningService_IBakeMacaroon extends grpc.MethodDefinition<lightning_pb.BakeMacaroonRequest, lightning_pb.BakeMacaroonResponse> {
    path: "/lnrpc.Lightning/BakeMacaroon";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.BakeMacaroonRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.BakeMacaroonRequest>;
    responseSerialize: grpc.serialize<lightning_pb.BakeMacaroonResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.BakeMacaroonResponse>;
}
interface ILightningService_IListMacaroonIDs extends grpc.MethodDefinition<lightning_pb.ListMacaroonIDsRequest, lightning_pb.ListMacaroonIDsResponse> {
    path: "/lnrpc.Lightning/ListMacaroonIDs";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListMacaroonIDsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListMacaroonIDsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListMacaroonIDsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListMacaroonIDsResponse>;
}
interface ILightningService_IDeleteMacaroonID extends grpc.MethodDefinition<lightning_pb.DeleteMacaroonIDRequest, lightning_pb.DeleteMacaroonIDResponse> {
    path: "/lnrpc.Lightning/DeleteMacaroonID";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.DeleteMacaroonIDRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.DeleteMacaroonIDRequest>;
    responseSerialize: grpc.serialize<lightning_pb.DeleteMacaroonIDResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.DeleteMacaroonIDResponse>;
}
interface ILightningService_IListPermissions extends grpc.MethodDefinition<lightning_pb.ListPermissionsRequest, lightning_pb.ListPermissionsResponse> {
    path: "/lnrpc.Lightning/ListPermissions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.ListPermissionsRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.ListPermissionsRequest>;
    responseSerialize: grpc.serialize<lightning_pb.ListPermissionsResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.ListPermissionsResponse>;
}
interface ILightningService_ICheckMacaroonPermissions extends grpc.MethodDefinition<lightning_pb.CheckMacPermRequest, lightning_pb.CheckMacPermResponse> {
    path: "/lnrpc.Lightning/CheckMacaroonPermissions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.CheckMacPermRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.CheckMacPermRequest>;
    responseSerialize: grpc.serialize<lightning_pb.CheckMacPermResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.CheckMacPermResponse>;
}
interface ILightningService_IRegisterRPCMiddleware extends grpc.MethodDefinition<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest> {
    path: "/lnrpc.Lightning/RegisterRPCMiddleware";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.RPCMiddlewareResponse>;
    requestDeserialize: grpc.deserialize<lightning_pb.RPCMiddlewareResponse>;
    responseSerialize: grpc.serialize<lightning_pb.RPCMiddlewareRequest>;
    responseDeserialize: grpc.deserialize<lightning_pb.RPCMiddlewareRequest>;
}
interface ILightningService_ISendCustomMessage extends grpc.MethodDefinition<lightning_pb.SendCustomMessageRequest, lightning_pb.SendCustomMessageResponse> {
    path: "/lnrpc.Lightning/SendCustomMessage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<lightning_pb.SendCustomMessageRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SendCustomMessageRequest>;
    responseSerialize: grpc.serialize<lightning_pb.SendCustomMessageResponse>;
    responseDeserialize: grpc.deserialize<lightning_pb.SendCustomMessageResponse>;
}
interface ILightningService_ISubscribeCustomMessages extends grpc.MethodDefinition<lightning_pb.SubscribeCustomMessagesRequest, lightning_pb.CustomMessage> {
    path: "/lnrpc.Lightning/SubscribeCustomMessages";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<lightning_pb.SubscribeCustomMessagesRequest>;
    requestDeserialize: grpc.deserialize<lightning_pb.SubscribeCustomMessagesRequest>;
    responseSerialize: grpc.serialize<lightning_pb.CustomMessage>;
    responseDeserialize: grpc.deserialize<lightning_pb.CustomMessage>;
}

export const LightningService: ILightningService;

export interface ILightningServer extends grpc.UntypedServiceImplementation {
    walletBalance: grpc.handleUnaryCall<lightning_pb.WalletBalanceRequest, lightning_pb.WalletBalanceResponse>;
    channelBalance: grpc.handleUnaryCall<lightning_pb.ChannelBalanceRequest, lightning_pb.ChannelBalanceResponse>;
    getTransactions: grpc.handleUnaryCall<lightning_pb.GetTransactionsRequest, lightning_pb.TransactionDetails>;
    estimateFee: grpc.handleUnaryCall<lightning_pb.EstimateFeeRequest, lightning_pb.EstimateFeeResponse>;
    sendCoins: grpc.handleUnaryCall<lightning_pb.SendCoinsRequest, lightning_pb.SendCoinsResponse>;
    listUnspent: grpc.handleUnaryCall<lightning_pb.ListUnspentRequest, lightning_pb.ListUnspentResponse>;
    subscribeTransactions: grpc.handleServerStreamingCall<lightning_pb.GetTransactionsRequest, lightning_pb.Transaction>;
    sendMany: grpc.handleUnaryCall<lightning_pb.SendManyRequest, lightning_pb.SendManyResponse>;
    newAddress: grpc.handleUnaryCall<lightning_pb.NewAddressRequest, lightning_pb.NewAddressResponse>;
    signMessage: grpc.handleUnaryCall<lightning_pb.SignMessageRequest, lightning_pb.SignMessageResponse>;
    verifyMessage: grpc.handleUnaryCall<lightning_pb.VerifyMessageRequest, lightning_pb.VerifyMessageResponse>;
    connectPeer: grpc.handleUnaryCall<lightning_pb.ConnectPeerRequest, lightning_pb.ConnectPeerResponse>;
    disconnectPeer: grpc.handleUnaryCall<lightning_pb.DisconnectPeerRequest, lightning_pb.DisconnectPeerResponse>;
    listPeers: grpc.handleUnaryCall<lightning_pb.ListPeersRequest, lightning_pb.ListPeersResponse>;
    subscribePeerEvents: grpc.handleServerStreamingCall<lightning_pb.PeerEventSubscription, lightning_pb.PeerEvent>;
    getInfo: grpc.handleUnaryCall<lightning_pb.GetInfoRequest, lightning_pb.GetInfoResponse>;
    getRecoveryInfo: grpc.handleUnaryCall<lightning_pb.GetRecoveryInfoRequest, lightning_pb.GetRecoveryInfoResponse>;
    pendingChannels: grpc.handleUnaryCall<lightning_pb.PendingChannelsRequest, lightning_pb.PendingChannelsResponse>;
    listChannels: grpc.handleUnaryCall<lightning_pb.ListChannelsRequest, lightning_pb.ListChannelsResponse>;
    subscribeChannelEvents: grpc.handleServerStreamingCall<lightning_pb.ChannelEventSubscription, lightning_pb.ChannelEventUpdate>;
    closedChannels: grpc.handleUnaryCall<lightning_pb.ClosedChannelsRequest, lightning_pb.ClosedChannelsResponse>;
    openChannelSync: grpc.handleUnaryCall<lightning_pb.OpenChannelRequest, lightning_pb.ChannelPoint>;
    openChannel: grpc.handleServerStreamingCall<lightning_pb.OpenChannelRequest, lightning_pb.OpenStatusUpdate>;
    batchOpenChannel: grpc.handleUnaryCall<lightning_pb.BatchOpenChannelRequest, lightning_pb.BatchOpenChannelResponse>;
    fundingStateStep: grpc.handleUnaryCall<lightning_pb.FundingTransitionMsg, lightning_pb.FundingStateStepResp>;
    channelAcceptor: grpc.handleBidiStreamingCall<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    closeChannel: grpc.handleServerStreamingCall<lightning_pb.CloseChannelRequest, lightning_pb.CloseStatusUpdate>;
    abandonChannel: grpc.handleUnaryCall<lightning_pb.AbandonChannelRequest, lightning_pb.AbandonChannelResponse>;
    sendPayment: grpc.handleBidiStreamingCall<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    sendPaymentSync: grpc.handleUnaryCall<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    sendToRoute: grpc.handleBidiStreamingCall<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    sendToRouteSync: grpc.handleUnaryCall<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    addInvoice: grpc.handleUnaryCall<lightning_pb.Invoice, lightning_pb.AddInvoiceResponse>;
    listInvoices: grpc.handleUnaryCall<lightning_pb.ListInvoiceRequest, lightning_pb.ListInvoiceResponse>;
    lookupInvoice: grpc.handleUnaryCall<lightning_pb.PaymentHash, lightning_pb.Invoice>;
    subscribeInvoices: grpc.handleServerStreamingCall<lightning_pb.InvoiceSubscription, lightning_pb.Invoice>;
    decodePayReq: grpc.handleUnaryCall<lightning_pb.PayReqString, lightning_pb.PayReq>;
    listPayments: grpc.handleUnaryCall<lightning_pb.ListPaymentsRequest, lightning_pb.ListPaymentsResponse>;
    deletePayment: grpc.handleUnaryCall<lightning_pb.DeletePaymentRequest, lightning_pb.DeletePaymentResponse>;
    deleteAllPayments: grpc.handleUnaryCall<lightning_pb.DeleteAllPaymentsRequest, lightning_pb.DeleteAllPaymentsResponse>;
    describeGraph: grpc.handleUnaryCall<lightning_pb.ChannelGraphRequest, lightning_pb.ChannelGraph>;
    getNodeMetrics: grpc.handleUnaryCall<lightning_pb.NodeMetricsRequest, lightning_pb.NodeMetricsResponse>;
    getChanInfo: grpc.handleUnaryCall<lightning_pb.ChanInfoRequest, lightning_pb.ChannelEdge>;
    getNodeInfo: grpc.handleUnaryCall<lightning_pb.NodeInfoRequest, lightning_pb.NodeInfo>;
    queryRoutes: grpc.handleUnaryCall<lightning_pb.QueryRoutesRequest, lightning_pb.QueryRoutesResponse>;
    getNetworkInfo: grpc.handleUnaryCall<lightning_pb.NetworkInfoRequest, lightning_pb.NetworkInfo>;
    stopDaemon: grpc.handleUnaryCall<lightning_pb.StopRequest, lightning_pb.StopResponse>;
    subscribeChannelGraph: grpc.handleServerStreamingCall<lightning_pb.GraphTopologySubscription, lightning_pb.GraphTopologyUpdate>;
    debugLevel: grpc.handleUnaryCall<lightning_pb.DebugLevelRequest, lightning_pb.DebugLevelResponse>;
    feeReport: grpc.handleUnaryCall<lightning_pb.FeeReportRequest, lightning_pb.FeeReportResponse>;
    updateChannelPolicy: grpc.handleUnaryCall<lightning_pb.PolicyUpdateRequest, lightning_pb.PolicyUpdateResponse>;
    forwardingHistory: grpc.handleUnaryCall<lightning_pb.ForwardingHistoryRequest, lightning_pb.ForwardingHistoryResponse>;
    exportChannelBackup: grpc.handleUnaryCall<lightning_pb.ExportChannelBackupRequest, lightning_pb.ChannelBackup>;
    exportAllChannelBackups: grpc.handleUnaryCall<lightning_pb.ChanBackupExportRequest, lightning_pb.ChanBackupSnapshot>;
    verifyChanBackup: grpc.handleUnaryCall<lightning_pb.ChanBackupSnapshot, lightning_pb.VerifyChanBackupResponse>;
    restoreChannelBackups: grpc.handleUnaryCall<lightning_pb.RestoreChanBackupRequest, lightning_pb.RestoreBackupResponse>;
    subscribeChannelBackups: grpc.handleServerStreamingCall<lightning_pb.ChannelBackupSubscription, lightning_pb.ChanBackupSnapshot>;
    bakeMacaroon: grpc.handleUnaryCall<lightning_pb.BakeMacaroonRequest, lightning_pb.BakeMacaroonResponse>;
    listMacaroonIDs: grpc.handleUnaryCall<lightning_pb.ListMacaroonIDsRequest, lightning_pb.ListMacaroonIDsResponse>;
    deleteMacaroonID: grpc.handleUnaryCall<lightning_pb.DeleteMacaroonIDRequest, lightning_pb.DeleteMacaroonIDResponse>;
    listPermissions: grpc.handleUnaryCall<lightning_pb.ListPermissionsRequest, lightning_pb.ListPermissionsResponse>;
    checkMacaroonPermissions: grpc.handleUnaryCall<lightning_pb.CheckMacPermRequest, lightning_pb.CheckMacPermResponse>;
    registerRPCMiddleware: grpc.handleBidiStreamingCall<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    sendCustomMessage: grpc.handleUnaryCall<lightning_pb.SendCustomMessageRequest, lightning_pb.SendCustomMessageResponse>;
    subscribeCustomMessages: grpc.handleServerStreamingCall<lightning_pb.SubscribeCustomMessagesRequest, lightning_pb.CustomMessage>;
}

export interface ILightningClient {
    walletBalance(request: lightning_pb.WalletBalanceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    walletBalance(request: lightning_pb.WalletBalanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    walletBalance(request: lightning_pb.WalletBalanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    channelBalance(request: lightning_pb.ChannelBalanceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    channelBalance(request: lightning_pb.ChannelBalanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    channelBalance(request: lightning_pb.ChannelBalanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    getTransactions(request: lightning_pb.GetTransactionsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    getTransactions(request: lightning_pb.GetTransactionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    getTransactions(request: lightning_pb.GetTransactionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    estimateFee(request: lightning_pb.EstimateFeeRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    estimateFee(request: lightning_pb.EstimateFeeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    estimateFee(request: lightning_pb.EstimateFeeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    sendCoins(request: lightning_pb.SendCoinsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    sendCoins(request: lightning_pb.SendCoinsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    sendCoins(request: lightning_pb.SendCoinsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    listUnspent(request: lightning_pb.ListUnspentRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    listUnspent(request: lightning_pb.ListUnspentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    listUnspent(request: lightning_pb.ListUnspentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    subscribeTransactions(request: lightning_pb.GetTransactionsRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Transaction>;
    subscribeTransactions(request: lightning_pb.GetTransactionsRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Transaction>;
    sendMany(request: lightning_pb.SendManyRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    sendMany(request: lightning_pb.SendManyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    sendMany(request: lightning_pb.SendManyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    newAddress(request: lightning_pb.NewAddressRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    newAddress(request: lightning_pb.NewAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    newAddress(request: lightning_pb.NewAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    signMessage(request: lightning_pb.SignMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    signMessage(request: lightning_pb.SignMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    signMessage(request: lightning_pb.SignMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    verifyMessage(request: lightning_pb.VerifyMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    verifyMessage(request: lightning_pb.VerifyMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    verifyMessage(request: lightning_pb.VerifyMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    connectPeer(request: lightning_pb.ConnectPeerRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    connectPeer(request: lightning_pb.ConnectPeerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    connectPeer(request: lightning_pb.ConnectPeerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    disconnectPeer(request: lightning_pb.DisconnectPeerRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    disconnectPeer(request: lightning_pb.DisconnectPeerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    disconnectPeer(request: lightning_pb.DisconnectPeerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    listPeers(request: lightning_pb.ListPeersRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    listPeers(request: lightning_pb.ListPeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    listPeers(request: lightning_pb.ListPeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    subscribePeerEvents(request: lightning_pb.PeerEventSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.PeerEvent>;
    subscribePeerEvents(request: lightning_pb.PeerEventSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.PeerEvent>;
    getInfo(request: lightning_pb.GetInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    getInfo(request: lightning_pb.GetInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    getInfo(request: lightning_pb.GetInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    pendingChannels(request: lightning_pb.PendingChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    pendingChannels(request: lightning_pb.PendingChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    pendingChannels(request: lightning_pb.PendingChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    listChannels(request: lightning_pb.ListChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    listChannels(request: lightning_pb.ListChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    listChannels(request: lightning_pb.ListChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    subscribeChannelEvents(request: lightning_pb.ChannelEventSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChannelEventUpdate>;
    subscribeChannelEvents(request: lightning_pb.ChannelEventSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChannelEventUpdate>;
    closedChannels(request: lightning_pb.ClosedChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    closedChannels(request: lightning_pb.ClosedChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    closedChannels(request: lightning_pb.ClosedChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    openChannelSync(request: lightning_pb.OpenChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    openChannelSync(request: lightning_pb.OpenChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    openChannelSync(request: lightning_pb.OpenChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    openChannel(request: lightning_pb.OpenChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.OpenStatusUpdate>;
    openChannel(request: lightning_pb.OpenChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.OpenStatusUpdate>;
    batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    fundingStateStep(request: lightning_pb.FundingTransitionMsg, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    fundingStateStep(request: lightning_pb.FundingTransitionMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    fundingStateStep(request: lightning_pb.FundingTransitionMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    channelAcceptor(): grpc.ClientDuplexStream<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    channelAcceptor(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    channelAcceptor(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    closeChannel(request: lightning_pb.CloseChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CloseStatusUpdate>;
    closeChannel(request: lightning_pb.CloseChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CloseStatusUpdate>;
    abandonChannel(request: lightning_pb.AbandonChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    abandonChannel(request: lightning_pb.AbandonChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    abandonChannel(request: lightning_pb.AbandonChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    sendPayment(): grpc.ClientDuplexStream<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    sendPayment(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    sendPayment(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    sendPaymentSync(request: lightning_pb.SendRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    sendPaymentSync(request: lightning_pb.SendRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    sendPaymentSync(request: lightning_pb.SendRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    sendToRoute(): grpc.ClientDuplexStream<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    sendToRoute(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    sendToRoute(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    sendToRouteSync(request: lightning_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    sendToRouteSync(request: lightning_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    sendToRouteSync(request: lightning_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    addInvoice(request: lightning_pb.Invoice, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    addInvoice(request: lightning_pb.Invoice, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    addInvoice(request: lightning_pb.Invoice, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    listInvoices(request: lightning_pb.ListInvoiceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    listInvoices(request: lightning_pb.ListInvoiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    listInvoices(request: lightning_pb.ListInvoiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    lookupInvoice(request: lightning_pb.PaymentHash, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    lookupInvoice(request: lightning_pb.PaymentHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    lookupInvoice(request: lightning_pb.PaymentHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    subscribeInvoices(request: lightning_pb.InvoiceSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    subscribeInvoices(request: lightning_pb.InvoiceSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    decodePayReq(request: lightning_pb.PayReqString, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    decodePayReq(request: lightning_pb.PayReqString, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    decodePayReq(request: lightning_pb.PayReqString, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    listPayments(request: lightning_pb.ListPaymentsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    listPayments(request: lightning_pb.ListPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    listPayments(request: lightning_pb.ListPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    deletePayment(request: lightning_pb.DeletePaymentRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    deletePayment(request: lightning_pb.DeletePaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    deletePayment(request: lightning_pb.DeletePaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    describeGraph(request: lightning_pb.ChannelGraphRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    describeGraph(request: lightning_pb.ChannelGraphRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    describeGraph(request: lightning_pb.ChannelGraphRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    getNodeMetrics(request: lightning_pb.NodeMetricsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    getNodeMetrics(request: lightning_pb.NodeMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    getNodeMetrics(request: lightning_pb.NodeMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    getChanInfo(request: lightning_pb.ChanInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    getChanInfo(request: lightning_pb.ChanInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    getChanInfo(request: lightning_pb.ChanInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    getNodeInfo(request: lightning_pb.NodeInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    getNodeInfo(request: lightning_pb.NodeInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    getNodeInfo(request: lightning_pb.NodeInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    queryRoutes(request: lightning_pb.QueryRoutesRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    queryRoutes(request: lightning_pb.QueryRoutesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    queryRoutes(request: lightning_pb.QueryRoutesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    getNetworkInfo(request: lightning_pb.NetworkInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    getNetworkInfo(request: lightning_pb.NetworkInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    getNetworkInfo(request: lightning_pb.NetworkInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    stopDaemon(request: lightning_pb.StopRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    stopDaemon(request: lightning_pb.StopRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    stopDaemon(request: lightning_pb.StopRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    subscribeChannelGraph(request: lightning_pb.GraphTopologySubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.GraphTopologyUpdate>;
    subscribeChannelGraph(request: lightning_pb.GraphTopologySubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.GraphTopologyUpdate>;
    debugLevel(request: lightning_pb.DebugLevelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    debugLevel(request: lightning_pb.DebugLevelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    debugLevel(request: lightning_pb.DebugLevelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    feeReport(request: lightning_pb.FeeReportRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    feeReport(request: lightning_pb.FeeReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    feeReport(request: lightning_pb.FeeReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    subscribeChannelBackups(request: lightning_pb.ChannelBackupSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChanBackupSnapshot>;
    subscribeChannelBackups(request: lightning_pb.ChannelBackupSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChanBackupSnapshot>;
    bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    listPermissions(request: lightning_pb.ListPermissionsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    listPermissions(request: lightning_pb.ListPermissionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    listPermissions(request: lightning_pb.ListPermissionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    registerRPCMiddleware(): grpc.ClientDuplexStream<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    registerRPCMiddleware(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    registerRPCMiddleware(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    subscribeCustomMessages(request: lightning_pb.SubscribeCustomMessagesRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CustomMessage>;
    subscribeCustomMessages(request: lightning_pb.SubscribeCustomMessagesRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CustomMessage>;
}

export class LightningClient extends grpc.Client implements ILightningClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public walletBalance(request: lightning_pb.WalletBalanceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    public walletBalance(request: lightning_pb.WalletBalanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    public walletBalance(request: lightning_pb.WalletBalanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.WalletBalanceResponse) => void): grpc.ClientUnaryCall;
    public channelBalance(request: lightning_pb.ChannelBalanceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    public channelBalance(request: lightning_pb.ChannelBalanceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    public channelBalance(request: lightning_pb.ChannelBalanceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBalanceResponse) => void): grpc.ClientUnaryCall;
    public getTransactions(request: lightning_pb.GetTransactionsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    public getTransactions(request: lightning_pb.GetTransactionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    public getTransactions(request: lightning_pb.GetTransactionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.TransactionDetails) => void): grpc.ClientUnaryCall;
    public estimateFee(request: lightning_pb.EstimateFeeRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    public estimateFee(request: lightning_pb.EstimateFeeRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    public estimateFee(request: lightning_pb.EstimateFeeRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.EstimateFeeResponse) => void): grpc.ClientUnaryCall;
    public sendCoins(request: lightning_pb.SendCoinsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    public sendCoins(request: lightning_pb.SendCoinsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    public sendCoins(request: lightning_pb.SendCoinsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCoinsResponse) => void): grpc.ClientUnaryCall;
    public listUnspent(request: lightning_pb.ListUnspentRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    public listUnspent(request: lightning_pb.ListUnspentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    public listUnspent(request: lightning_pb.ListUnspentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListUnspentResponse) => void): grpc.ClientUnaryCall;
    public subscribeTransactions(request: lightning_pb.GetTransactionsRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Transaction>;
    public subscribeTransactions(request: lightning_pb.GetTransactionsRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Transaction>;
    public sendMany(request: lightning_pb.SendManyRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    public sendMany(request: lightning_pb.SendManyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    public sendMany(request: lightning_pb.SendManyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendManyResponse) => void): grpc.ClientUnaryCall;
    public newAddress(request: lightning_pb.NewAddressRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    public newAddress(request: lightning_pb.NewAddressRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    public newAddress(request: lightning_pb.NewAddressRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NewAddressResponse) => void): grpc.ClientUnaryCall;
    public signMessage(request: lightning_pb.SignMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    public signMessage(request: lightning_pb.SignMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    public signMessage(request: lightning_pb.SignMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SignMessageResponse) => void): grpc.ClientUnaryCall;
    public verifyMessage(request: lightning_pb.VerifyMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    public verifyMessage(request: lightning_pb.VerifyMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    public verifyMessage(request: lightning_pb.VerifyMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyMessageResponse) => void): grpc.ClientUnaryCall;
    public connectPeer(request: lightning_pb.ConnectPeerRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    public connectPeer(request: lightning_pb.ConnectPeerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    public connectPeer(request: lightning_pb.ConnectPeerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ConnectPeerResponse) => void): grpc.ClientUnaryCall;
    public disconnectPeer(request: lightning_pb.DisconnectPeerRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    public disconnectPeer(request: lightning_pb.DisconnectPeerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    public disconnectPeer(request: lightning_pb.DisconnectPeerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DisconnectPeerResponse) => void): grpc.ClientUnaryCall;
    public listPeers(request: lightning_pb.ListPeersRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    public listPeers(request: lightning_pb.ListPeersRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    public listPeers(request: lightning_pb.ListPeersRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPeersResponse) => void): grpc.ClientUnaryCall;
    public subscribePeerEvents(request: lightning_pb.PeerEventSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.PeerEvent>;
    public subscribePeerEvents(request: lightning_pb.PeerEventSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.PeerEvent>;
    public getInfo(request: lightning_pb.GetInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    public getInfo(request: lightning_pb.GetInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    public getInfo(request: lightning_pb.GetInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetInfoResponse) => void): grpc.ClientUnaryCall;
    public getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    public getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    public getRecoveryInfo(request: lightning_pb.GetRecoveryInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.GetRecoveryInfoResponse) => void): grpc.ClientUnaryCall;
    public pendingChannels(request: lightning_pb.PendingChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    public pendingChannels(request: lightning_pb.PendingChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    public pendingChannels(request: lightning_pb.PendingChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PendingChannelsResponse) => void): grpc.ClientUnaryCall;
    public listChannels(request: lightning_pb.ListChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    public listChannels(request: lightning_pb.ListChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    public listChannels(request: lightning_pb.ListChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListChannelsResponse) => void): grpc.ClientUnaryCall;
    public subscribeChannelEvents(request: lightning_pb.ChannelEventSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChannelEventUpdate>;
    public subscribeChannelEvents(request: lightning_pb.ChannelEventSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChannelEventUpdate>;
    public closedChannels(request: lightning_pb.ClosedChannelsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    public closedChannels(request: lightning_pb.ClosedChannelsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    public closedChannels(request: lightning_pb.ClosedChannelsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ClosedChannelsResponse) => void): grpc.ClientUnaryCall;
    public openChannelSync(request: lightning_pb.OpenChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    public openChannelSync(request: lightning_pb.OpenChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    public openChannelSync(request: lightning_pb.OpenChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelPoint) => void): grpc.ClientUnaryCall;
    public openChannel(request: lightning_pb.OpenChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.OpenStatusUpdate>;
    public openChannel(request: lightning_pb.OpenChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.OpenStatusUpdate>;
    public batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    public batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    public batchOpenChannel(request: lightning_pb.BatchOpenChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.BatchOpenChannelResponse) => void): grpc.ClientUnaryCall;
    public fundingStateStep(request: lightning_pb.FundingTransitionMsg, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    public fundingStateStep(request: lightning_pb.FundingTransitionMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    public fundingStateStep(request: lightning_pb.FundingTransitionMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.FundingStateStepResp) => void): grpc.ClientUnaryCall;
    public channelAcceptor(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    public channelAcceptor(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.ChannelAcceptResponse, lightning_pb.ChannelAcceptRequest>;
    public closeChannel(request: lightning_pb.CloseChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CloseStatusUpdate>;
    public closeChannel(request: lightning_pb.CloseChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CloseStatusUpdate>;
    public abandonChannel(request: lightning_pb.AbandonChannelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    public abandonChannel(request: lightning_pb.AbandonChannelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    public abandonChannel(request: lightning_pb.AbandonChannelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.AbandonChannelResponse) => void): grpc.ClientUnaryCall;
    public sendPayment(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    public sendPayment(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendRequest, lightning_pb.SendResponse>;
    public sendPaymentSync(request: lightning_pb.SendRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public sendPaymentSync(request: lightning_pb.SendRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public sendPaymentSync(request: lightning_pb.SendRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public sendToRoute(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    public sendToRoute(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.SendToRouteRequest, lightning_pb.SendResponse>;
    public sendToRouteSync(request: lightning_pb.SendToRouteRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public sendToRouteSync(request: lightning_pb.SendToRouteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public sendToRouteSync(request: lightning_pb.SendToRouteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendResponse) => void): grpc.ClientUnaryCall;
    public addInvoice(request: lightning_pb.Invoice, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    public addInvoice(request: lightning_pb.Invoice, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    public addInvoice(request: lightning_pb.Invoice, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.AddInvoiceResponse) => void): grpc.ClientUnaryCall;
    public listInvoices(request: lightning_pb.ListInvoiceRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    public listInvoices(request: lightning_pb.ListInvoiceRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    public listInvoices(request: lightning_pb.ListInvoiceRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListInvoiceResponse) => void): grpc.ClientUnaryCall;
    public lookupInvoice(request: lightning_pb.PaymentHash, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    public lookupInvoice(request: lightning_pb.PaymentHash, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    public lookupInvoice(request: lightning_pb.PaymentHash, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.Invoice) => void): grpc.ClientUnaryCall;
    public subscribeInvoices(request: lightning_pb.InvoiceSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    public subscribeInvoices(request: lightning_pb.InvoiceSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.Invoice>;
    public decodePayReq(request: lightning_pb.PayReqString, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    public decodePayReq(request: lightning_pb.PayReqString, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    public decodePayReq(request: lightning_pb.PayReqString, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PayReq) => void): grpc.ClientUnaryCall;
    public listPayments(request: lightning_pb.ListPaymentsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public listPayments(request: lightning_pb.ListPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public listPayments(request: lightning_pb.ListPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPaymentsResponse) => void): grpc.ClientUnaryCall;
    public deletePayment(request: lightning_pb.DeletePaymentRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    public deletePayment(request: lightning_pb.DeletePaymentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    public deletePayment(request: lightning_pb.DeletePaymentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeletePaymentResponse) => void): grpc.ClientUnaryCall;
    public deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    public deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    public deleteAllPayments(request: lightning_pb.DeleteAllPaymentsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteAllPaymentsResponse) => void): grpc.ClientUnaryCall;
    public describeGraph(request: lightning_pb.ChannelGraphRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    public describeGraph(request: lightning_pb.ChannelGraphRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    public describeGraph(request: lightning_pb.ChannelGraphRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelGraph) => void): grpc.ClientUnaryCall;
    public getNodeMetrics(request: lightning_pb.NodeMetricsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    public getNodeMetrics(request: lightning_pb.NodeMetricsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    public getNodeMetrics(request: lightning_pb.NodeMetricsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeMetricsResponse) => void): grpc.ClientUnaryCall;
    public getChanInfo(request: lightning_pb.ChanInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    public getChanInfo(request: lightning_pb.ChanInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    public getChanInfo(request: lightning_pb.ChanInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelEdge) => void): grpc.ClientUnaryCall;
    public getNodeInfo(request: lightning_pb.NodeInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    public getNodeInfo(request: lightning_pb.NodeInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    public getNodeInfo(request: lightning_pb.NodeInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NodeInfo) => void): grpc.ClientUnaryCall;
    public queryRoutes(request: lightning_pb.QueryRoutesRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    public queryRoutes(request: lightning_pb.QueryRoutesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    public queryRoutes(request: lightning_pb.QueryRoutesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.QueryRoutesResponse) => void): grpc.ClientUnaryCall;
    public getNetworkInfo(request: lightning_pb.NetworkInfoRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    public getNetworkInfo(request: lightning_pb.NetworkInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    public getNetworkInfo(request: lightning_pb.NetworkInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.NetworkInfo) => void): grpc.ClientUnaryCall;
    public stopDaemon(request: lightning_pb.StopRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    public stopDaemon(request: lightning_pb.StopRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    public stopDaemon(request: lightning_pb.StopRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.StopResponse) => void): grpc.ClientUnaryCall;
    public subscribeChannelGraph(request: lightning_pb.GraphTopologySubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.GraphTopologyUpdate>;
    public subscribeChannelGraph(request: lightning_pb.GraphTopologySubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.GraphTopologyUpdate>;
    public debugLevel(request: lightning_pb.DebugLevelRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    public debugLevel(request: lightning_pb.DebugLevelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    public debugLevel(request: lightning_pb.DebugLevelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DebugLevelResponse) => void): grpc.ClientUnaryCall;
    public feeReport(request: lightning_pb.FeeReportRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    public feeReport(request: lightning_pb.FeeReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    public feeReport(request: lightning_pb.FeeReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.FeeReportResponse) => void): grpc.ClientUnaryCall;
    public updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    public updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    public updateChannelPolicy(request: lightning_pb.PolicyUpdateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.PolicyUpdateResponse) => void): grpc.ClientUnaryCall;
    public forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    public forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    public forwardingHistory(request: lightning_pb.ForwardingHistoryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ForwardingHistoryResponse) => void): grpc.ClientUnaryCall;
    public exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    public exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    public exportChannelBackup(request: lightning_pb.ExportChannelBackupRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChannelBackup) => void): grpc.ClientUnaryCall;
    public exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    public exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    public exportAllChannelBackups(request: lightning_pb.ChanBackupExportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ChanBackupSnapshot) => void): grpc.ClientUnaryCall;
    public verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    public verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    public verifyChanBackup(request: lightning_pb.ChanBackupSnapshot, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.VerifyChanBackupResponse) => void): grpc.ClientUnaryCall;
    public restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    public restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    public restoreChannelBackups(request: lightning_pb.RestoreChanBackupRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.RestoreBackupResponse) => void): grpc.ClientUnaryCall;
    public subscribeChannelBackups(request: lightning_pb.ChannelBackupSubscription, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChanBackupSnapshot>;
    public subscribeChannelBackups(request: lightning_pb.ChannelBackupSubscription, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.ChanBackupSnapshot>;
    public bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    public bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    public bakeMacaroon(request: lightning_pb.BakeMacaroonRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.BakeMacaroonResponse) => void): grpc.ClientUnaryCall;
    public listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    public listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    public listMacaroonIDs(request: lightning_pb.ListMacaroonIDsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListMacaroonIDsResponse) => void): grpc.ClientUnaryCall;
    public deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    public deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    public deleteMacaroonID(request: lightning_pb.DeleteMacaroonIDRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.DeleteMacaroonIDResponse) => void): grpc.ClientUnaryCall;
    public listPermissions(request: lightning_pb.ListPermissionsRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    public listPermissions(request: lightning_pb.ListPermissionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    public listPermissions(request: lightning_pb.ListPermissionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.ListPermissionsResponse) => void): grpc.ClientUnaryCall;
    public checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    public checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    public checkMacaroonPermissions(request: lightning_pb.CheckMacPermRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.CheckMacPermResponse) => void): grpc.ClientUnaryCall;
    public registerRPCMiddleware(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    public registerRPCMiddleware(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<lightning_pb.RPCMiddlewareResponse, lightning_pb.RPCMiddlewareRequest>;
    public sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    public sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    public sendCustomMessage(request: lightning_pb.SendCustomMessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: lightning_pb.SendCustomMessageResponse) => void): grpc.ClientUnaryCall;
    public subscribeCustomMessages(request: lightning_pb.SubscribeCustomMessagesRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CustomMessage>;
    public subscribeCustomMessages(request: lightning_pb.SubscribeCustomMessagesRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<lightning_pb.CustomMessage>;
}
