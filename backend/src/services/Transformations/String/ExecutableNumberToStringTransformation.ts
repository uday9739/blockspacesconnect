import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "../../Connection";
import { ExecutableBaseTransformation } from "../ExecutableBaseTransformation";

export default class ExecutableNumberToStringTransformation extends ExecutableBaseTransformation {

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
              returnResponse.message="NumberToString: Need at least 1 parameter";
              logger.error("validate()", { module: thisModule }, { context: this.parameters }, {error:returnResponse.message});
              break;
            case (isNaN(Number(this.parameters.number))):
              isValid = false;
              returnResponse.responseCode="500";
              returnResponse.message="Substring: number must be a number";
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
                    "result":Number(this.parameters.number).toString()
                }
            }
        } 
        catch (error:any) {
            returnResponse = {
                responseCode:"500",
                message:`NumberToString: Error converting number to string - ${error}`,
                data: this.parameters
            };
            logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });
        };

        return returnResponse;
    }
}

