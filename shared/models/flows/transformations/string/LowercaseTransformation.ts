import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class LowercaseTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new LowercaseTransformation());

  private constructor() {
    super();

    this.name = TransformationName.LOWERCASE;
    this.category = TransformationCategory.STRING;
    this.description = "Converts a string to all uppercase characters";

    this.parameters = [
      {
        name: "string",
        description: "The string to convert to uppercase",
        type: ParameterType.STRING,
        required: true,
        example: "Lorem ipsum dolor sit amet"
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the input string converted to uppercase",
      type: ParameterType.STRING,
      example: "LOREM IPSUM DOLOR SIT AMET"
    };
  }
}
