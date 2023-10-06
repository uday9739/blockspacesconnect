import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class JoinTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new JoinTransformation());

  private constructor() {
    super();

    this.name = TransformationName.JOIN
    this.category = TransformationCategory.STRING
    this.description = "Combine multiple strings from an array, with an optional separator, and output a single string"

    this.parameters = [
      {
        name: "strings",
        description: "The strings to join",
        type: ParameterType.ARRAY,
        required: true,
        items: {
          item: {
            type: ParameterType.STRING
          }
        }
      },
      {
        name: "separator",
        description: "The string that will separate the strings when joined (default is ,)",
        type: ParameterType.STRING,
        required: false,
        example: ", "
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the result of joining the string array",
      type: ParameterType.STRING
    }
  }
}