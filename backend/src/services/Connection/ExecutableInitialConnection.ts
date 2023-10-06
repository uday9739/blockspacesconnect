import { Connection, IConnection } from "@blockspaces/shared/models/flows/Connection";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { TParameter, TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import { ExecutableFlowState } from "../ExecutableFlowState";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";

export class ExecutableInitialConnection extends Connection {

  constructor (connection:IConnection, parameterFactory:TParameterFactory) {
    super(connection, parameterFactory);
  };  

  public async execute(mappings: Array<Mapping>, flowState: ExecutableFlowState): Promise<TExecutableConnectionResponse> {
    logger.trace("class Connection", "entering execute", { module: thisModule }, {context: {object:this, mappings: mappings, dataQueue: flowState.dataQueue}});
    return new Promise<TExecutableConnectionResponse>((resolve, reject) => {
      logger.trace("class Connection", "leaving execute", { module: thisModule }, {response: true}); 
      resolve ({message:"Successful",responseCode:"INIT",data:flowState.dataQueue.getItem('initialData')});
    })
  }
};
