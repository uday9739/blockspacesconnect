import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableLowercaseTransformation extends ExecutableBaseTransformation {

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
        // Must be at least two parameters (string, startIndex and one optional numChars)
        // Parameter string should be an string
        // Parameters startIndex and numChars should be numbers
        switch (true) {
            case (Object.keys(this.parameters).length < 1):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Uppercase: Need at least 2 parameter";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (typeof String(this.parameters.string) !== 'string'):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Uppercase: string must be a string";
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
                    "result":String(this.parameters.string).toLowerCase()
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`Uppercase: Error converting string to uppercase - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

