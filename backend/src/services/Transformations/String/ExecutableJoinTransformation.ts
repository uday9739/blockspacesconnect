import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableJoinTransformation extends ExecutableBaseTransformation {

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
              returnResponse.message="Join: Need at least 2 parameter";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (!Array.isArray(this.parameters["strings[]"])):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Join: strings must be an array";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (this.parameters["strings[]"].some((string:any) => {return typeof string !== 'string'} )):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Join: strings must be an array of strings";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (typeof this.parameters.separator !== 'string' && typeof this.parameters.separator !== 'undefined'):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Join: separator must be a string or null";
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
                    result:this.parameters["strings[]"].join(this.parameters.separator || ',')
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`Join: Error joining strings[] with separator - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

