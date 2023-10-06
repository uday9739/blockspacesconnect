import { IConnection } from "@blockspaces/shared/models/flows/Connection";
import { IConnectorRoute } from "@blockspaces/shared/models/flows/Connector";
import { TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import { TransformationConnection } from "@blockspaces/shared/models/flows/Connection";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import { ExecutableFlowState } from "../ExecutableFlowState";
import { mapData } from "../../helpers";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "../../loggers/bscLogger";
import { createExecutableTransformation } from "../Transformations";

export class ExecutableTransformationConnection extends TransformationConnection {

  constructor (connection:IConnection, parameterFactory:TParameterFactory) {
    super(connection, parameterFactory);
  };

  public async execute(mappings:Array<Mapping>, flowState:ExecutableFlowState):Promise<TExecutableConnectionResponse> {
    return new Promise<TExecutableConnectionResponse>(async (resolve,reject) => {
      let parameters = mapData(mappings,flowState, <IConnectorRoute>this.activeMethod);

      let transformer = createExecutableTransformation(this.transformationName, parameters);
      let response = transformer?.execute() || {responseCode:"500",message:"Unknown transformation type",data:this.activeMethod?.name};

      resolve(response);
    });
  };
};