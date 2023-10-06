import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableStringToNumberTransformation extends ExecutableBaseTransformation {

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
 
        // Validity checks
        // Must be at least one parameters 
        // Parameter number should be a number
        switch (true) {
            case (Object.keys(this.parameters).length < 1):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="StringToNumber: Need at least 1 parameter";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (typeof String(this.parameters.string) !== 'string'):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="StringToNumber: string must be a string";
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
                    "result":Number(this.parameters.string)
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`StringToNumber: Error converting number to string - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

