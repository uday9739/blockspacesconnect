import { TransformationNameOrString } from ".";
import { IConnectorRoute } from "../Connector";
import { IParameter, ParameterType, TParameter } from "../Parameter";
import { TransformationCategory } from "./TransformationCategory";
import { TransformationName } from "./TransformationName";

export interface ITransformation {
  name: TransformationNameOrString,
  description: string,
  category: TransformationCategory,

  /** metadata describing the transformation's default input parameters */
  parameters: IParameter[],

  /** metadata describing the transformation's return value */
  returnValue: IParameter
}

export abstract class Transformation implements ITransformation {
  name: TransformationNameOrString;
  description: string;
  category: TransformationCategory;
  parameters: IParameter[];
  returnValue: IParameter;

  get asRoute(): IConnectorRoute {
    return {
      name: this.name,
      method: "POST",
      description: this.description,
      contentType: "application/json",
      parameters: <TParameter[]>this.parameters,
      responses: [{
        parameters: [<TParameter>this.returnValue],
        description: this.returnValue?.description,
        responseCode: "200"
      }]
    }
  }

  /** the return type for this transformation */
  get returnType(): ParameterType | `${ParameterType}` {
    return this.returnValue?.type;
  };

  static getNameFromRoute(route: IConnectorRoute): TransformationName {
    const name = route?.name as TransformationName;

    if (!name || !(Object.values(TransformationName).includes(name))) {
      return null;
    }

    return name;
  }
}