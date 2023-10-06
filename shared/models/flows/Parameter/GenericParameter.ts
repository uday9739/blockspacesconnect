import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";
import { ParameterTypeOrString } from "./ParameterType";
import { MappingType, TParameter } from ".";

export class GenericParameter implements IParameter {
  guid?: string;
  name?: string;
  description?: string;
  in?: string;
  type?: ParameterTypeOrString;
  format?: string;
  required?: boolean;
  example?: string | number | boolean;
  enum?: Array<string | number | boolean>;
  items?: {
    item: TParameter;
  };
  properties?: Record<string, TParameter>;
  mappingType?: MappingType.SOURCE | MappingType.DESTINATION;
  address: IParameterAddress;

  constructor(parameterDefinition: IParameter, address: IParameterAddress) {

    Object.keys(parameterDefinition).map(key => {
      if (key === 'name' && parameterDefinition['type'] === 'array') {
        const strippedName = parameterDefinition[key].replace(/\[]/g, '');
        this[key] = strippedName + '[]';
      } else {
        this[key] = parameterDefinition[key];
      }
    });

    if (Boolean(address)) {
      let path = address.path ? `${address.path}.${this.name}` : this.name;
      this.address = { ...address, path };
      if (!this.mappingType)
        this.mappingType = address.responseCode ? MappingType.SOURCE : MappingType.DESTINATION;
    }

  }

  get arrayType():ParameterTypeOrString | undefined {
    return this.items?.item?.type;
  }

  getPathString() {
    const { connectionId, method, endpoint, responseCode, path } = this.address;
    return responseCode ?
      `${connectionId}:${method}:${endpoint}:${responseCode}:${path}` :
      `${connectionId}:${method}:${endpoint}:${path}`;
  }
}
