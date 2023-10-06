import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableSplitTransformation extends ExecutableBaseTransformation {

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
        // Must be at least two parameters (strings[] and separator)
        // Parameter strings should be an array
        // Parameter separator should be either a string or null
        switch (true) {
            case (Object.keys(this.parameters).length < 2):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Split: Need at least 2 parameter";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (typeof String(this.parameters.string) !== 'string'):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Split: string must be a string"; 
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (typeof String(this.parameters.delimiter) !== 'string' && typeof String(this.parameters.delimiter) !== 'undefined'):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Split: separator must be a string or null";
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
                    "result":String(this.parameters.string).split(this.parameters.delimiter || ',')
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`Split: Error joining strings[] with separator - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

