import {logger} from "@blockspaces/shared/loggers/bscLogger";
import grpc from "@blockspaces/shared/proto/connect/grpc";
import {env} from "./env";
import {ConnectClient} from "@blockspaces/shared/proto/connect/connect_grpc_pb";
import {Request as ConnectRequest, Response as ConnectResponse} from "@blockspaces/shared/proto/connect/connect_pb";
import {BscStatusReponse} from "./helpers/bscTypes";

const thisModule = "engineClient.service.ts";

class EngineClient {
  connectGRPCClient: ConnectClient;

  private constructor() {
    this.connectGRPCClient = new ConnectClient(env.backend.backendGrpcUrl + ":" + env.backend.backendGrpcPort, grpc.credentials.createInsecure());
  }

  public static newEngineClient = async (): Promise<EngineClient> => {
    return new EngineClient();
  };

  executeFlowJob = async (blockFlowId: string, initialData: object): Promise<BscStatusReponse> => {
    logger.debug("started executeFlowJob()", {module: thisModule});
    const deadline = new Date().setSeconds(new Date().getSeconds() + 300);
    const dataToSend = Buffer.from(JSON.stringify(initialData));
    const metadata = new grpc.Metadata();
    metadata.add("authorization", `Bearer 1234`);
    const message = new ConnectRequest();
    message.setId(blockFlowId);
    message.setData(dataToSend);

    logger.debug(`executeFlowJob()", "executing blockflow ${blockFlowId}`, {module: thisModule}, {response: message});

    try {
      logger.debug("finished executeFlowJob()", {module: thisModule});
      // this.connectGRPCClient.send(message, metadata, {deadline: deadline}, (err: grpc.ServiceError | null, response: ConnectResponse) => {
      //   if (err) {
      //     logger.error("executeFlowJob()", {module: thisModule}, {error: err.message ? err.message : `error testing blockflow Id: ${blockFlowId}`});
      //   } else {
      //     logger.debug("finished executeFlowJob()", {module: thisModule});
      //   }
      // });
    } catch (err: any) {
      return {status: "error", data: err.message ? err.message : `error testing blockflow Id: ${blockFlowId}`};
    }
    return {status: "success", data: "Execution request sent to backend"};
  };
}

export default EngineClient;
