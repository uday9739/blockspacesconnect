import { GenericParameter } from "./GenericParameter";
import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";

export class Parameter extends GenericParameter {

  constructor(parameterDefinition: IParameter, address?: IParameterAddress) {
    super(parameterDefinition, address)
  }

  get asJson(): IParameter {
    return {
      guid: this.guid,
      name: this.name,
      description: this.description,
      in: this.in,
      type: this.type,
      items:this.items,
      format: this.format,
      required: this.required,
      example: this.example,
      enum: this.enum,
      properties: this.properties
    }
  }

}


