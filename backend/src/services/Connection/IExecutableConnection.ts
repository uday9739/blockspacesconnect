import { IConnection } from "@blockspaces/shared/models/flows/Connection";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { ExecutableFlowState } from "../ExecutableFlowState";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";


export interface IExecutableConnection extends IConnection {
  execute(mappings: Array<Mapping>, flowState: ExecutableFlowState): Promise<TExecutableConnectionResponse>;
}
