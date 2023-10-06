import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";


export default class StringToNumberTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new StringToNumberTransformation());

  private constructor() {
    super();

    this.name = TransformationName.STRING_TO_NUMBER;
    this.category = TransformationCategory.STRING;
    this.description = "Converts a string to a number";

    this.parameters = [
      {
        name: "string",
        description: "The string to convert to uppercase",
        type: ParameterType.STRING,
        required: true,
        example: "123"
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the string converted to a number",
      type: ParameterType.NUMBER,
      example: 123
    };
  }
}
