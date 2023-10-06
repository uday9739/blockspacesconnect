import { TransformationName } from "@blockspaces/shared/models/flows/transformations";
import { TExecutableConnectionResponse } from "../Connection";
import { ExecutableAddTransformation, ExecutableDivideTransformation, ExecutableJoinTransformation, ExecutableLowercaseTransformation, ExecutableMultiplyTransformation, ExecutableNumberToStringTransformation, ExecutableSplitTransformation, ExecutableStringToNumberTransformation, ExecutableSubstringTransformation, ExecutableSubtractTransformation, ExecutableUnknownTransformation, ExecutableUppercaseTransformation } from ".";
import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";

export abstract class ExecutableBaseTransformation {
    protected parameters:Record<string,any>;

    constructor(parameters:Record<string,any>) {
        this.parameters=parameters;
    }

    protected abstract validate():{isValid:Boolean;response:TExecutableConnectionResponse};

    protected abstract transform():TExecutableConnectionResponse;

    public execute(): TExecutableConnectionResponse {
        let validation=this.validate();
        return validation.isValid ? this.transform() : validation.response
    };
}

export const createExecutableTransformation = ((name:TransformationName, parameters:Record<string,any>) => {
    switch (name) {
        case TransformationName.SUBTRACT:
          return new ExecutableSubtractTransformation(parameters);
        case TransformationName.ADD:
          return new ExecutableAddTransformation(parameters);
        case TransformationName.MULTIPLY:
          return new ExecutableMultiplyTransformation(parameters);
        case TransformationName.DIVIDE:
          return new ExecutableDivideTransformation(parameters);
        case TransformationName.JOIN:
          return new ExecutableJoinTransformation(parameters);
        case TransformationName.SPLIT:
          return new ExecutableSplitTransformation(parameters);
        case TransformationName.SUBSTRING:
          return new ExecutableSubstringTransformation(parameters);
        case TransformationName.UPPERCASE:
          return new ExecutableUppercaseTransformation(parameters);
        case TransformationName.LOWERCASE:
          return new ExecutableLowercaseTransformation(parameters);
        case TransformationName.STRING_TO_NUMBER:
          return new ExecutableStringToNumberTransformation(parameters);
        case TransformationName.NUMBER_TO_STRING:
          return new ExecutableNumberToStringTransformation(parameters);
        default:
          logger.error("transform()", { module: thisModule }, { context: {name:name, parameters:parameters} }, { error: "Unknown tranformation type" });
          return new ExecutableUnknownTransformation(parameters);     
    }
});