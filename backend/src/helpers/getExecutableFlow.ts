import { IFlow } from "@blockspaces/shared/models/flows/Flow";
import { ParameterFactory, TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";
import { getBlockFlowDefinition } from ".";
import { ExecutableConnectionFactory, TExecutableConnectionFactory } from "../services/Connection";
import { ExecutableFlow } from "../services/ExecutableFlow";

export default async function getExecutableFlow(
  flowId: string,
  clientId: string,
  connectionFactory: TExecutableConnectionFactory = ExecutableConnectionFactory,
  parameterFactory: TParameterFactory = ParameterFactory
): Promise<ExecutableFlow> {

  const flow: IFlow = await getBlockFlowDefinition(flowId, clientId);
  return new ExecutableFlow(flow, connectionFactory, parameterFactory);
}