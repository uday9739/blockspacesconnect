import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";


export default class NumberToStringTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new NumberToStringTransformation());

  private constructor() {
    super();

    this.name = TransformationName.NUMBER_TO_STRING;
    this.category = TransformationCategory.STRING;
    this.description = "Converts a number to a string";

    this.parameters = [
      {
        name: "number",
        description: "The number to convert to string",
        type: ParameterType.NUMBER,
        required: true,
        example: 123
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the number converted to a string",
      type: ParameterType.STRING,
      example: "123"
    };
  }
}
