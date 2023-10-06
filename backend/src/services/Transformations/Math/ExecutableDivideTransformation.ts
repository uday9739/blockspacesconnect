import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableDivideTransformation extends ExecutableBaseTransformation {

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
            case (Number(Object.values(this.parameters)[Object.values(this.parameters).length]) === Number(0)):
                isValid = false;
                returnResponse.responseCode="500";
                returnResponse.message="Divide: value2 must not be equal to 0";
                logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
            case (Object.keys(this.parameters).length < 2):
                isValid = false;
                returnResponse.responseCode="500";
                returnResponse.message="Divide: Need at least 2 parameters";
                logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
            case (Object.values(this.parameters).some((value) => {return isNaN(Number(value))})):
                isValid = false;
                returnResponse.responseCode="500";
                returnResponse.message="Divide: values must be numeric";
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
            returnResponse = {
                responseCode:"200",
                message:"Success",
                data: {
                    result:Number(this.parameters.value1)/Number(this.parameters.value2)
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`Divide: Error dividing value1 and value2 - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

