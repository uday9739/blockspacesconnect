import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class AddTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new AddTransformation());

  private constructor() {
    super();

    this.name = TransformationName.ADD
    this.category = TransformationCategory.MATH
    this.description = "Add two, or more, numbers"

    this.parameters = [
      {
        name: "value1",
        description: "The first value to add",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      },
      {
        name: "value2",
        description: "The second value to add",
        type: ParameterType.NUMBER,
        required: true,
        example: 1
      }
    ];

    this.returnValue = {
      name: "result",
      description: "the result of addition",
      type: ParameterType.NUMBER
    }
  }
}