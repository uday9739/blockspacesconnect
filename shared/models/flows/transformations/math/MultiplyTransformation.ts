import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class MultiplyTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new MultiplyTransformation());

  private constructor() {
    super();

    this.name = TransformationName.MULTIPLY
    this.category = TransformationCategory.MATH
    this.description = "Multiply two, or more, numbers"

    this.parameters = [
      {
        name: "value1",
        description: "The first value to multiply",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      },
      {
        name: "value2",
        description: "The second value to multiply",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the result of multiplication",
      type: ParameterType.NUMBER
    }
  }
}