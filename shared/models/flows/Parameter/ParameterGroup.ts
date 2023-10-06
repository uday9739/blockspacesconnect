import { GenericParameter } from "./GenericParameter";
import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";
import { TParameterFactory } from "./ParameterFactory";


export class ParameterGroup extends GenericParameter {

  constructor(parameterDefinition: IParameter, address: IParameterAddress, Factory: TParameterFactory) {
    super(parameterDefinition, address);
    if (this.properties)
      Object.keys(this.properties).forEach(name => {
        this.properties[name] = Factory(this.properties[name], { ...this.address });
      });
  }

  get asJson() {
    return {
      guid: this.guid,
      name: this.name,
      description: this.description,
      in: this.in,
      type: this.type,
      format: this.format,
      required: this.required,
      example: this.example,
      enum: this.enum,
      properties: Object.keys(this.properties || {}).map(name => this.properties[name].asJson)
    };
  }

}
