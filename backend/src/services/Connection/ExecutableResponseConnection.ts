import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { ExecutableFlowState } from "../ExecutableFlowState";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import { mapData } from "../../helpers";
import { Connection, IConnection } from "@blockspaces/shared/models/flows/Connection";
import { IConnectorRoute } from "@blockspaces/shared/models/flows/Connector";
import { TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";

export class ExecutableResponseConnection extends Connection {

  constructor (connection:IConnection, parameterFactory:TParameterFactory) {
    super(connection,parameterFactory);
  };  

  public async execute(mappings: Array<Mapping>, flowState: ExecutableFlowState): Promise<TExecutableConnectionResponse> {
    logger.trace("class Connection", "entering execute", { module: thisModule }, {context: {object:this, mappings: mappings, dataQueue: flowState.dataQueue}});
    return new Promise<TExecutableConnectionResponse>((resolve, reject) => {
      let parameters = mapData(mappings,flowState,<IConnectorRoute>this.activeMethod);
      flowState.dataQueue.addItem('responseData',parameters);
      logger.trace("class ExecutableResponseConnection", "leaving execute", { module: thisModule }, {response: parameters}); 
      resolve ({message:"Successful",responseCode:"RESPONSE",data:parameters});
    })
  };

};