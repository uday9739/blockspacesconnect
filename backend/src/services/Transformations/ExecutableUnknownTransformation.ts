import * as path from "path";
const thisModule = path.basename(__filename);
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import { TExecutableConnectionResponse } from "./../Connection";
import { ExecutableBaseTransformation } from "./ExecutableBaseTransformation";

export default class ExecutableUnknownTransformation extends ExecutableBaseTransformation {

    constructor(parameters:Record<string,any>) {
        super(parameters);   
    };
 
    protected validate():{isValid:Boolean;response:TExecutableConnectionResponse} {
        let isValid:Boolean=false;
        let returnResponse:TExecutableConnectionResponse = {
            responseCode:"500",
            message:"Unknown transformation type",
            data:this.parameters
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
        returnResponse = {
            responseCode:"500",
            message:`Unknown transformation type`,
            data: this.parameters
        };
        logger.error("transform()", { module: thisModule }, { context: this.parameters }, { error: returnResponse.message });

        return returnResponse;
    }
}

