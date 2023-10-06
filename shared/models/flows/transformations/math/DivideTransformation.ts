import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class DivideTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new DivideTransformation());

  private constructor() {
    super();

    this.name = TransformationName.DIVIDE
    this.category = TransformationCategory.MATH
    this.description = "Divide two, or more, numbers"

    this.parameters = [
      {
        name: "value1",
        description: "The first value to divide",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      },
      {
        name: "value2",
        description: "The second value to divide",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the result of division",
      type: ParameterType.NUMBER
    }
  }
}