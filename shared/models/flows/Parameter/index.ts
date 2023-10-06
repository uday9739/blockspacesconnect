import { GenericParameter } from "./GenericParameter";
import { IParameter } from "./IParameter";
import { IParameterAddress } from "./IParameterAddress";
import { Parameter } from "./Parameter";
import { ParameterArray } from "./ParameterArray";
import { ParameterFactory, TParameterFactory } from "./ParameterFactory";
import { ParameterGroup } from "./ParameterGroup";
import { ParameterType, ParameterTypeOrString } from "./ParameterType";

export type TParameter = Parameter | ParameterGroup | ParameterArray

export type {
  TParameterFactory,
  IParameterAddress,
  IParameter,
  ParameterTypeOrString
};

export {
  GenericParameter,
  Parameter,
  ParameterGroup,
  ParameterArray,
  ParameterFactory,
  ParameterType
};

export enum MappingType {
  SOURCE="source",
  DESTINATION="destination"
}
