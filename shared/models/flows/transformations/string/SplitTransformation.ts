import { ParameterType } from "../../Parameter";
import { Transformation } from "../Transformation";
import { TransformationCategory } from "../TransformationCategory";
import { TransformationName } from "../TransformationName";

export default class SplitTransformation extends Transformation {

  static readonly Instance: Readonly<Transformation> = Object.freeze(new SplitTransformation());

  private constructor() {
    super();

    this.name = TransformationName.SPLIT
    this.category = TransformationCategory.STRING
    this.description = "Split a string into an array based on a delimiter"

    this.parameters = [
      {
        name: "string",
        description: "The string to split",
        type: ParameterType.STRING,
        required: true,
        example: "Lorem,ipsum,dolor,sit,amet"
      },
      {
        name: "delimiter",
        type: ParameterType.STRING,
        description: "Delimiter to split on",
        required: true,
        example: ","
      }
    ];

    this.returnValue = {
      name: "result",
      description: "array of strings based on delimiter",
      type: ParameterType.ARRAY,
      items: {
        item: {
          type: ParameterType.STRING
        }
      }
    }
  }
}
