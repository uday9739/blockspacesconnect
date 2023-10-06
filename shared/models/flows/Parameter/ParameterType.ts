export enum ParameterType {
  STRING = "string",
  INTEGER = "integer",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}

export type ParameterTypeOrString = ParameterType | `${ParameterType}`