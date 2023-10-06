import { GenericParameter } from "./GenericParameter";
import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";
import { TParameterFactory } from "./ParameterFactory";


export class ParameterArray extends GenericParameter {

  constructor(parameterDefinition: IParameter, address: IParameterAddress, Factory: TParameterFactory) {
    super(parameterDefinition, address);

    const type = this.items?.item?.type;

    if (type === 'object') {
      const properties = this.items?.item?.properties;
      Object.keys(properties).forEach(name => {
        this.items.item.properties[name] = Factory(this.items.item.properties[name], { ...this.address });
      });
    } else {
      this.items.item = Factory(this.items?.item, { ...this.address });
    }
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
      items: {
        item: {
          ...this.items.item,
          properties: Object.keys(this.items.item.properties || {}).map(name => this.items.item.properties[name].asJson)
        }
      },
    };
  }

}
