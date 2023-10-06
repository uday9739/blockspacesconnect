import { ParameterType } from ".";
import { IParameterAddress } from "./IParameterAddress";
import { ParameterTypeOrString } from "./ParameterType";


export interface IParameter {
  guid?: string;
  name?: string;
  description?: string;
  in?: string;
  type?: ParameterTypeOrString;
  arrayType?: ParameterTypeOrString;
  format?: string;
  required?: boolean;
  example?: string | number | boolean;
  enum?: Array<string | number | boolean>;
  items?: {
    item?: IParameter;
  };
  properties?: Record<string, IParameter>;
  address?: IParameterAddress;
}
