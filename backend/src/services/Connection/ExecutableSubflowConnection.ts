import { ISubflowConnection, SubflowConnection } from "@blockspaces/shared/models/flows/Connection";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { ParameterFactory, TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import { ExecutableConnectionFactory } from ".";
import { getExecutableFlow, mapData } from "../../helpers";
import { ExecutableFlow } from "../ExecutableFlow";
import { ExecutableFlowState } from "../ExecutableFlowState";
import { ExecutableConnectionResponse, TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import { IExecutableConnection } from "./IExecutableConnection";

export class ExecutableSubflowConnection extends SubflowConnection implements IExecutableConnection {

  constructor(connection: ISubflowConnection, parameterFactory: TParameterFactory = ParameterFactory) {
    super(connection, parameterFactory);
  }

  public async execute(mappings: Mapping[], flowState: ExecutableFlowState): Promise<TExecutableConnectionResponse> {

    if (!this.activeMethod)
      return ExecutableConnectionResponse.Failure("Failed executing subflow. No active method was defined.")

    try {
      const parameters: Record<string, any> = mapData(mappings, flowState, this.activeMethod)

      const flow: ExecutableFlow = await getExecutableFlow(
        this.flowId,
        flowState.clientId,
        ExecutableConnectionFactory,
        ParameterFactory
      );

      const flowResponse: TExecutableConnectionResponse[] = await flow.execute(parameters);

      if (!flowResponse?.length) {
        return ExecutableConnectionResponse.Failure(`No data was returned from the subflow "${flow.name}" (flowId: ${flow.id})`)
      }

      return flowResponse[0];
    } catch (error: any) {
      let message = "Failed while executing subflow";

      if (error?.message) {
        message += `: ${error.message}`
      }

      throw ExecutableConnectionResponse.Failure(message, error);
    }
  }
}