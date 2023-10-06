
export enum TransformationName {
  ADD = "add",
  SUBTRACT = "subtract",
  MULTIPLY = "multiply",
  DIVIDE = "divide",

  JOIN = "join",
  SUBSTRING = "substring",
  SPLIT = "split",
  UPPERCASE = "uppercase",
  LOWERCASE = "lowercase",
  STRING_TO_NUMBER = "stringToNumber",
  NUMBER_TO_STRING = "Number to String",

  // ITERATE = "iterate"
}

export type TransformationNameOrString = TransformationName | `${TransformationName}`;