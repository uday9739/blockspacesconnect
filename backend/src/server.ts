import {config} from "dotenv";
import * as grpc from "@grpc/grpc-js";
import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { Request, Response } from '@blockspaces/shared/proto/connect/connect_pb';
import { ConnectService, IConnectServer } from '@blockspaces/shared/proto/connect/connect_grpc_pb';
import { IFlow } from '@blockspaces/shared/models/flows/Flow';
import { ExecutableConnectionFactory, TExecutableConnectionResponse } from "./services/Connection";
import { getBlockFlowDefinition } from './helpers';
import { ExecutableFlow } from './services/ExecutableFlow';
import { ParameterFactory } from '@blockspaces/shared/models/flows/Parameter';

/** Load .env file or for tests the .env.test file. */
config({path: path.join(process.cwd(), `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`)});

const SERVER_URL = process.env.SERVER_URL;
const SERVER_PORT = process.env.SERVER_PORT;

const server = new grpc.Server();

const connectServer: IConnectServer = {
  send (call: grpc.ServerUnaryCall<Request, Response>,callback: grpc.sendUnaryData<Response>) {
    const reply: Response = new Response();
    const jsonBytes = <Uint8Array>call.request.getData();
    const initialData = JSON.parse(String.fromCharCode(...jsonBytes));
    const blockFlowId = call.request.getId();
    logger.debug("Send()", { module: thisModule }, { context: {initialData: initialData, blockFlowId:blockFlowId} });
    // Get the blockflow based on the blockflow ID passed in
    // This will get the BlockFlow Definition from Mongo soon
    getBlockFlowDefinition(blockFlowId, "1")
    .then(async (blockFlowDefinition:IFlow) => {
        // logger.debug("server.js", "data", initialData);
        logger.debug("Send()", "getBlockFlowDefinition()", { module: thisModule }, { context: blockFlowDefinition });
        let executableFlow = new ExecutableFlow(blockFlowDefinition, ExecutableConnectionFactory, ParameterFactory)
        executableFlow.execute(initialData)
        .then((response:Array<TExecutableConnectionResponse>) => {
          const dataToRespondWith = Buffer.from(JSON.stringify(response), "utf8");
          reply.setData(dataToRespondWith);
          callback(null, reply);
        })
        .catch((error:Error) => {
          reply.setData(Buffer.from(JSON.stringify({message: error}), "utf8"));
          callback({code:grpc.status.INTERNAL,message:JSON.stringify(error)}, reply);
        })
    })
    .catch((error:any) => {
        logger.error("Send()", "getBlockFlowDefinition", { module: thisModule }, { error: error });
        //reply.setData(Buffer.from(JSON.stringify({ message: {...error} }), "utf8"))
        callback({code:grpc.status.INTERNAL,message:JSON.stringify(error)}, reply);
    });
}};

// logger.info("adding service", { module: thisModule });
server.addService(ConnectService, connectServer);

server.bindAsync(SERVER_URL + ":" + SERVER_PORT, grpc.ServerCredentials.createInsecure(), (err:Error | null, port:number) => {
  if (err != null) {
    logger.error("bindAsync", { module: thisModule }, { error: err });
    throw err;
    //return console.error(err);
  }
  server.start();
  //console.log('started');
  logger.info( { module: thisModule }, { response: `BlockSpaces Connect Engine listening on ${port}` });
});
