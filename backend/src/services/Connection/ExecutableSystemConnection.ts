import { TParameterFactory } from "@blockspaces/shared/models/flows/Parameter";

import { SystemConnection, IConnection } from "@blockspaces/shared/models/flows/Connection";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { ExecutableFlowState } from "../ExecutableFlowState";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { TExecutableConnectionResponse } from "./ExecutableConnectionResponse";
import { mapData, mapURLParameters, Oauth1Helper } from "../../helpers";
import { IConnectorRoute } from "@blockspaces/shared/models/flows/Connector";

const AUTH_TYPE = {
  BASIC: false,
  JWT: false,
  APIKEY: false,
  OAUTH2: false,
};

export class ExecutableSystemConnection extends SystemConnection {
  #credential: any;
  #token: any;

  constructor (connection:IConnection, parameterFactory:TParameterFactory) {
    super(connection, parameterFactory);
    this.#credential = {};
    this.#token = '';
  };

  #getAuthType() {
    AUTH_TYPE.BASIC = false;
    AUTH_TYPE.JWT = false;
    AUTH_TYPE.APIKEY = false;
    AUTH_TYPE.OAUTH2 = false;
    if (this.securitySchemes?.connectorAuth?.type === "http") {
      if (this.securitySchemes?.connectorAuth?.scheme === "basic") {
        AUTH_TYPE.BASIC = true;
      } else if (this.securitySchemes?.connectorAuth?.scheme === "bearer") {
        AUTH_TYPE.JWT = true;
      }
    } else if (this.securitySchemes?.connectorAuth?.type === "apikey") {
      AUTH_TYPE.APIKEY = true;
    } else if (this.securitySchemes?.connectorAuth?.type === "oauth2") {
      AUTH_TYPE.OAUTH2 = true;
    }
    return AUTH_TYPE;
  }

  async #getVaultCredentials(clientId:string) {
    logger.trace("started getVaultCredentials()", { module: thisModule });

    const data = {
      clientId: <string>clientId,
      credentialId: <string>this.credential?.credentialId,
      connector: <string>this.connectorId,
    };

    const requestOptions:AxiosRequestConfig = {
      baseURL: process.env.BLOCKSPACES_SERVICES_URL + ":" + process.env.BLOCKSPACES_SERVICES_PORT,
      url: "api/clientcredentials/use",
      method:"POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: data
    }
    logger.debug("getVaultCredentials()", "requestOptions", { module: thisModule }, { context: requestOptions });
    await axios
      .request(requestOptions)
      .then((response:AxiosResponse) => {
        logger.trace("finished getVaultCredentials()", "response data", {module: thisModule}, {response: response.data});
        this.#credential = response.data.data.credential;
      })
      .catch((error:AxiosError) => {
        logger.error("error getting vault credentials", { module: thisModule }, { error: error });
        throw <TExecutableConnectionResponse> {
          responseCode:"500",
          message:"Error getting Vault Credentials",
          data: error
        };
      });
    return;
  };

  async #getToken() {
    logger.trace("started getToken()", { module: thisModule });
    const parameters = {
      initialData: this.#credential
    };

    const requestOptions: AxiosRequestConfig = {
      baseURL: `${process.env.BLOCKSPACES_SERVICES_URL}:${process.env.BLOCKSPACES_SERVICES_PORT}`,
      url: `/api/blockflow/test/${this.securitySchemes?.connectorAuth["x-source"]["authflow-id"]}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: parameters,
    };
    logger.debug("requestOptions", { module: thisModule }, { context: requestOptions });
    await axios
      .request(requestOptions)
      .then((response: AxiosResponse) => {
        logger.trace("finished getToken()", { module: thisModule }, { response: response.data });
        this.#token = response.data;
      })
      .catch((error: AxiosError) => {
        logger.error("getToken()", { module: thisModule }, { error: error });
        throw <TExecutableConnectionResponse>{
          responseCode:"500",
          message:"Error Getting Token",
          data:error
        };
      });
  };

  async #init(flowState:ExecutableFlowState) {
    logger.trace("started init()", { module: thisModule });
    await this.#getVaultCredentials(flowState.clientId)
      .then(async () => {
        if (this.#getAuthType().JWT) {
          await this.#getToken()
            .then(() => {
              logger.trace("finished init()", { module: thisModule }, { response: this.#token });
            })
            .catch((error) => {
              logger.error("init()", { module: thisModule }, { error: error });
              throw <TExecutableConnectionResponse> {
                responseCode:"500",
                message: "Error initializing connection",
                data: error
              };
            });
        } else if (this.#getAuthType().APIKEY) {

        }
    })
    .catch((error) => {
      logger.error("init()", { module: thisModule }, { error: error });
      throw <TExecutableConnectionResponse> {
        responseCode:"500",
        message:"Error initializing connection",
        data: error
      };
    });
  }
  public async execute(mappings:Array<Mapping>, flowState:ExecutableFlowState):Promise<TExecutableConnectionResponse> {
    logger.trace("class Connection", "entering execute", { module: thisModule }, {context: {mappings: mappings, dataQueue: flowState.dataQueue}});
    return new Promise<TExecutableConnectionResponse>(async (resolve,reject) => {
      await this.#init(flowState)
      .then(async() => {
        let parameters = mapData(mappings,flowState,<IConnectorRoute>this.activeMethod);

        const baseURL = mapURLParameters(parameters, <string>this.server?.url);
        const activeMethod = mapURLParameters(parameters, <string>this.activeMethod?.name);

        const requestOptions:AxiosRequestConfig = {
          baseURL: baseURL,
          url: activeMethod,
          method: <Method>this.activeMethod?.method,
          headers: {
            "Content-Type": <string>this.activeMethod?.contentType,
          },
        };

        let parametersInQuery:Record<string,any> = {};
        if (this.activeMethod?.parameters) {
          const onlyQueryParameters = this.activeMethod.parameters.filter((parameter) => ['query', ''].includes((<string>parameter.in).toLowerCase()))
          const allRequestParameters = parameters;
          onlyQueryParameters.map((parameter) => {
            if (allRequestParameters[(<string>parameter.name)]) {
              parametersInQuery[(<string>parameter.name).replace("[]","")] =  allRequestParameters[(<string>parameter.name)];
            }
          })
        }

        if (this.activeMethod?.method === "GET") {
          requestOptions.params = parametersInQuery;
        } else if (this.activeMethod?.contentType === "application/x-www-form-urlencoded") {
          requestOptions.params = parametersInQuery;
        } else {
          requestOptions.data = parametersInQuery;
        }

        if (this.#getAuthType().JWT) {
          requestOptions.headers.Authorization = `Bearer ${this.#token["token"]}`;
        } else if (this.#getAuthType().APIKEY) {
          const request_data:any = {
            url: (<string>requestOptions.baseURL + requestOptions.url),
            method: requestOptions.method,
            data: requestOptions.params,
          }
          const oauth = new Oauth1Helper(this.#credential);
          requestOptions.headers.Authorization = oauth.getAuthHeaderForRequest(request_data).Authorization;
        }

        logger.debug("getData()", "requestOptions", { module: thisModule }, { context: requestOptions });

        await axios
          .request(requestOptions)
          .then((response:AxiosResponse) => {
            logger.trace("finished getData()", { module: thisModule }, { response: response.data });
            resolve({responseCode: response.status.toString(), message:response.statusText, data: response.data});
          })
          .catch((error:AxiosError) => {
            logger.error("getData()", { module: thisModule }, { response: error.response?.statusText }, { error: error.message });
            resolve({responseCode: error.response?.status.toString() || '500', message:error.message , data: error.response?.data});
          });
      })
      .catch((error) => {
        reject(<TExecutableConnectionResponse> {
          responseCode:"500",
          message: "Error in execute calling Init()",
          data: error
        })
      });
    })
  }
};
