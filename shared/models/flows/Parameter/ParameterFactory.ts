import { ParameterArray } from "./ParameterArray";
import { ParameterGroup } from "./ParameterGroup";
import { Parameter } from "./Parameter";
import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";
import { TParameter } from ".";


export type TParameterFactory = (parameterDefinition: IParameter, address?: IParameterAddress) => TParameter;
export const ParameterFactory: TParameterFactory = (parameterDefinition, address) => {

  switch (parameterDefinition.type) {
    case 'array':
      return new ParameterArray(parameterDefinition, address, ParameterFactory);

    case 'object':
      return new ParameterGroup(parameterDefinition, address, ParameterFactory);

    default:
      return new Parameter(parameterDefinition, address);
  }

};
