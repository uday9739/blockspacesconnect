import { IFlow } from '@blockspaces/shared/models/flows/Flow';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";

export const getBlockFlowDefinition = (blockFlowId: string, clientId: string):Promise<IFlow> => {
  return new Promise<IFlow>(async (resolve, reject) => {
    logger.debug("started getBlockFlowDefinitionPromise()", { module: thisModule }, { response: { blockFlowId: blockFlowId, clientId: clientId } });
    if (!blockFlowId) {
      reject(new Error("No BlockFlow ID provided"));
    } else if (!clientId) {
      reject(new Error("No ClientId provided"));
    } else {
      const requestOptions:AxiosRequestConfig = {
        baseURL: process.env.BLOCKSPACES_SERVICES_URL + ":" + process.env.BLOCKSPACES_SERVICES_PORT,
        url: "/api/blockflow/" + blockFlowId,
        method: 'GET',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
      await axios
        .request(requestOptions)
        .then((res) => {
          logger.debug("finished getBlockFlowDefinitionPromise()", { module: thisModule }, { response: res.data });
          resolve(<IFlow>res.data);
        })
        .catch((error:AxiosError) => {
          logger.error("getBlockFlowDefinitionPromise()", { module: thisModule }, { error: error.message });
          reject(error);
        });
    }
  });
};

