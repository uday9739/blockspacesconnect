import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class SubtractTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new SubtractTransformation());

  private constructor() {
    super();

    this.name = TransformationName.SUBTRACT
    this.category = TransformationCategory.MATH
    this.description = "Subtract two, or more, numbers"

    this.parameters = [
      {
        name: "value1",
        description: "The first value to subtract",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      },
      {
        name: "value2",
        description: "The second value to subtract",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the result of subtraction",
      type: ParameterType.NUMBER
    }
  }
}