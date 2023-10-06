import { TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";

import { SystemConnection, IConnection } from "@blockspaces/shared/models/flows/Connection";
import axios, { AxiosError, AxiosRequestConfig} from "axios";
import { ExecutableFlowState } from "../ExecutableFlowState";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import { mapData, mapURLParameters, Oauth1Helper, Oauth2Helper } from "../../helpers";
import { IConnectorRoute } from "@blockspaces/shared/models/flows/Connector";

export class ExecutableAuthenticationConnection extends SystemConnection {

  constructor(connection: IConnection, parameterFactory: TParameterFactory) {
    super(connection, parameterFactory);
  };

  public async execute(mappings:Array<Mapping>, flowState:ExecutableFlowState):Promise<TExecutableConnectionResponse> {
    logger.trace("class ExecutableAuthenticationConnection", "entering execute", { module: thisModule }, {context: {mappings: mappings, dataQueue: flowState.dataQueue}});
    return new Promise<TExecutableConnectionResponse>(async (resolve,reject) => {
      let parameters = mapData(mappings,flowState,<IConnectorRoute>this.activeMethod);

      const baseURL = mapURLParameters(parameters, (<string>this.server?.url));
      const activeMethod = mapURLParameters(parameters, (<string>this.activeMethod?.name));

      let parametersInQuery:Record<string,any> = {};
      let parametersInHeader:Record<string,any> = {};
      if (this.activeMethod?.parameters) {
        const onlyQueryParameters = this.activeMethod.parameters.filter((parameter) => ['query', ''].includes(<string>parameter.in?.toLowerCase()))
        const onlyHeaderParameters = this.activeMethod.parameters.filter((parameter) => ['header', ''].includes(<string>parameter.in?.toLowerCase()))
        const allRequestParameters = parameters;
        onlyQueryParameters.map((parameter) => {
          if (allRequestParameters[<string>parameter.name]) {
            parametersInQuery[(<string>parameter.name)] = allRequestParameters[<string>parameter.name];
          }
        })
        onlyHeaderParameters.map((parameter) => {
          if (allRequestParameters[<string>parameter.name]) {
            parametersInHeader[<string>parameter.name] = allRequestParameters[<string>parameter.name];
          }
        })
      }
      let requestConfig:AxiosRequestConfig = {
        withCredentials:true
      }
      const getClientCredentials = Oauth2Helper.client(axios.create(requestConfig), {...parametersInQuery,"url":`${baseURL}${activeMethod}`});
      await getClientCredentials()
        .then((response:any) => {
          logger.trace("finished getData()", { module: thisModule }, { response: response });
          resolve({responseCode: "200", message:"Successful", data: {...response.data,"jwt":response.headers && Array.isArray(response.headers["set-cookie"]) && response.headers["set-cookie"].length > 0 && response.headers["set-cookie"][0]?.substring(4,response.headers["set-cookie"][0]?.indexOf('; Path=/; HttpOnly; Secure') )||""}});
        })
        .catch((error:AxiosError) => {
          logger.error("getData()", { module: thisModule }, { error: error.message });
          resolve({responseCode: error.response?.status.toString()||'500', message:error.message , data: {}});
        });
    })
  }

};
