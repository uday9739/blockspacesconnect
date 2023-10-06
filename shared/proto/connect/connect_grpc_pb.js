// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var connect_pb = require('./connect_pb.js');

function serialize_blockspaces_Request(arg) {
  if (!(arg instanceof connect_pb.Request)) {
    throw new Error('Expected argument of type blockspaces.Request');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blockspaces_Request(buffer_arg) {
  return connect_pb.Request.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blockspaces_Response(arg) {
  if (!(arg instanceof connect_pb.Response)) {
    throw new Error('Expected argument of type blockspaces.Response');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blockspaces_Response(buffer_arg) {
  return connect_pb.Response.deserializeBinary(new Uint8Array(buffer_arg));
}


var ConnectService = exports.ConnectService = {
  send: {
    path: '/blockspaces.Connect/Send',
    requestStream: false,
    responseStream: false,
    requestType: connect_pb.Request,
    responseType: connect_pb.Response,
    requestSerialize: serialize_blockspaces_Request,
    requestDeserialize: deserialize_blockspaces_Request,
    responseSerialize: serialize_blockspaces_Response,
    responseDeserialize: deserialize_blockspaces_Response,
  },
};

exports.ConnectClient = grpc.makeGenericClientConstructor(ConnectService);
