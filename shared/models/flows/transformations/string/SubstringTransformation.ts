import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class SubstringTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new SubstringTransformation());

  private constructor() {
    super();

    this.name = TransformationName.SUBSTRING
    this.category = TransformationCategory.STRING
    this.description = "Extract a specified number of characters from a string, starting at a specific index"

    this.parameters = [
      {
        name: "string",
        description: "The string to extract from",
        type: ParameterType.STRING,
        required: true,
        example: "Lorem ipsum dolor sit amet"
      },
      {
        name: "startIndex",
        type: ParameterType.NUMBER,
        description: "Index to start at (starting at 0)",
        required: true,
        example: 0
      },
      {
        name: "numChars",
        type: ParameterType.NUMBER,
        description: "the number of characters to extract",
        required: false,
        example: 2
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the extracted string",
      type: ParameterType.STRING
    }
  }
}