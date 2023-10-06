import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableSubtractTransformation extends ExecutableBaseTransformation {

    constructor(parameters:Record<string,any>) {
        super(parameters);   
    };

    protected validate():{isValid:Boolean;response:TExecutableConnectionResponse} {
        let isValid:Boolean=true;
        let returnResponse:TExecutableConnectionResponse = {
            responseCode:"200",
            message:"Success",
            data:this.parameters
        };

        switch (true) {
            case (Object.keys(this.parameters).length < 2):
                isValid = false;
                returnResponse.responseCode="500";
                returnResponse.message="Subtract: Need at least 2 parameters";
                logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
            case (Object.values(this.parameters).some((value) => {return isNaN(Number(value))})):
                isValid = false;
                returnResponse.responseCode="500";
                returnResponse.message="Subtract: values must be numeric";
                logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
                break;
        };

        return {
            isValid:isValid,
            response:returnResponse
        }
    };

    protected transform():TExecutableConnectionResponse {
        let returnResponse:TExecutableConnectionResponse = {
            responseCode:"200",
            message:"Success",
            data: {
            }
        };
        try {
            let result = Object.values(this.parameters).reduce((prevValue,currentValue)=> Number(prevValue)-Number(currentValue))
            returnResponse = {
                responseCode:"200",
                message:"Success",
                data: {
                    result:result
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`Subtract: Error subtracting value2 from value1 - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

