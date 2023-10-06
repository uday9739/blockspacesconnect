import { TransformationNameOrString } from ".";
import { AddTransformation, DivideTransformation, MultiplyTransformation, SubtractTransformation } from "./math";
import {
  JoinTransformation,
  LowercaseTransformation,
  SplitTransformation,
  StringToNumberTransformation,
  NumberToStringTransformation,
  SubstringTransformation,
  UppercaseTransformation
} from "./string";
import { Transformation } from "./Transformation";
import { TransformationName } from "./TransformationName";

export default function TransformationFactory(name: TransformationNameOrString): Transformation {
  switch (name) {
    case TransformationName.ADD:
      return AddTransformation.Instance

    case TransformationName.SUBTRACT:
      return SubtractTransformation.Instance

    case TransformationName.MULTIPLY:
      return MultiplyTransformation.Instance

    case TransformationName.DIVIDE:
      return DivideTransformation.Instance

    case TransformationName.JOIN:
      return JoinTransformation.Instance

    case TransformationName.SUBSTRING:
      return SubstringTransformation.Instance

    case TransformationName.SPLIT:
      return SplitTransformation.Instance;

    case TransformationName.UPPERCASE:
      return UppercaseTransformation.Instance

    case TransformationName.LOWERCASE:
      return LowercaseTransformation.Instance

    case TransformationName.STRING_TO_NUMBER:
      return StringToNumberTransformation.Instance
    
    case TransformationName.NUMBER_TO_STRING:
      return NumberToStringTransformation.Instance

    default:
      throw new Error(`"${name}" is a not a supported transformation`);
  }
}

export type TTransformationFactory = typeof TransformationFactory;