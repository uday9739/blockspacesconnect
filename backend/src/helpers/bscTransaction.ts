import { v4 as uuid } from 'uuid';
import {transactionLogger} from "@blockspaces/shared/loggers/bscLogger";
import axios, {AxiosRequestConfig} from "axios";
import path from "path";

const BLOCKSPACES_SERVICES_URL = process.env.BLOCKSPACES_SERVICES_URL;
const BLOCKSPACES_SERVICES_PORT = process.env.BLOCKSPACES_SERVICES_PORT;

type TTransactionStatus = "started"|"running"|"waiting"|"error"|"retry"|"completed";
type TTransactionType = "triggered flow" | "scheduled flow" | "billing" | "reporting" | "other";
type TTransactionMessage = {
  transactionId: string;
  startedOn: number;
  completedOn?: number;
  status: TTransactionStatus;
  description: string;
  transactionType: TTransactionType;
}

class bscTransaction {
  #transactionId: string;
  #startedOn: number;
  #completedOn?: number;
  #status: TTransactionStatus;
  #description: string;
  #transactionType: TTransactionType;

  //TODO May need to pass in an api key or some other credential in order to make api calls to the ui-backend
  constructor(transactionType?: TTransactionType, description?: string, error?: Error) {
    this.#transactionId = uuid();
    this.#startedOn = Date.now();
    this.#status = "started";
    this.#description = description ? description : "no description provided";
    this.#transactionType = transactionType ? transactionType : "other";

    let transactionMessage = {
      transactionId : this.#transactionId,
      startedOn : this.#startedOn,
      completedOn : this.#completedOn,
      status  : this.#status,
      description : this.#description,
      transactionType : this.#transactionType
    };

    transactionLogger.info(`${this.#transactionId}: Created`,
      {module: {functionName:`${path.basename(__filename)}:constructor()`,filepath:__dirname}},
      {event:transactionMessage});

    writeTransactionToDB(transactionMessage);
  }

  getTransactionId(){
    return this.#transactionId;
  }

  getCreatedOn(){
    return this.#startedOn;
  }

  getDescription(){
    return this.#description;
  }

  getCompletedOn(){
    return this.#completedOn;
  }

  getTransactionType(){
    return this.#transactionType;
  }

  getTransactionStatus(){
    return this.#status;
  }

  async setTransactionStatus(newStatus: TTransactionStatus){
    this.#status = newStatus;
    if("completed" == this.#status){
      this.#completedOn = Date.now();
      writeTransactionStatusToDB(this.#transactionId,this.#status,this.#completedOn);
    }else{
      writeTransactionStatusToDB(this.#transactionId,this.#status);
    }

    let transactionMessage:TTransactionMessage =  {
      transactionId : this.#transactionId,
      startedOn : this.#startedOn,
      completedOn : this.#completedOn,
      status  : this.#status,
      description : this.#description,
      transactionType : this.#transactionType
    };


    transactionLogger.info(`${this.#transactionId}: set Status: ${transactionMessage.status}`,
      {module: {functionName:`${path.basename(__filename)}:setTransactionStatus()`,filepath:__dirname}},
      {event:transactionMessage});

    return this.#status;
  }

}

//TODO may need to implement a non-blocking call here and retry mechanism
//TODO there is an opportunity to improve the logger, we have a lot of diplicate code
async function writeTransactionToDB(transactionMessage:TTransactionMessage){

  //TODO need to implement authorization system and middleware
  //{ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token}
  const requestOptions:AxiosRequestConfig = {
    baseURL: `${BLOCKSPACES_SERVICES_URL}:${BLOCKSPACES_SERVICES_PORT}`,
    url: `/api/transactions`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(transactionMessage),
  };

  await axios
    .request(requestOptions)
    .then((res) => {
      if(res.status == 200){
        transactionLogger.info(`${transactionMessage.transactionId}: DB Write Completed with Status ${res.status}`,
          {module: {functionName:`${path.basename(__filename)}.writeTransactionToDB()`,filepath:__dirname}},
          {event:requestOptions},{response:res.data});
      }else{
        transactionLogger.error(`${transactionMessage.transactionId}: DB Write Completed with Status ${res.status}`,
          {module: {functionName:`${path.basename(__filename)}.writeTransactionToDB()`,filepath:__dirname}},
          {event:requestOptions},{response:res.data});
      }
      return "success";
    })
    .catch((err) => {
      transactionLogger.error(`${transactionMessage.transactionId}: DB Write Error`,
        {module: {functionName: `${path.basename(__filename)}.writeTransactionToDB()`, filepath: __dirname}},
        {event:requestOptions},{response:`ERROR: ${err.message}`});
      return "error";
    });

}

//TODO may need to implement a non-blocking call here and retry mechanism
//TODO there is an opportunity to improve the logger, we have a lot of diplicate code
async function writeTransactionStatusToDB(transactionId:string,status:string,completedOn?:number){

  let completedTime = completedOn ? completedOn : "";

  //TODO need to implement authorization system and middleware
  //{ "Content-Type":"application/json", "Atuhorization":`Bearer ${access_token}`,"Identity":id_token}
  const requestOptions:AxiosRequestConfig = {
    baseURL: `${BLOCKSPACES_SERVICES_URL}:${BLOCKSPACES_SERVICES_PORT}`,
    url: `/api/transactions/${transactionId}/${status}/${completedTime}`,
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
  };

  await axios
    .request(requestOptions)
    .then((res) => {
      //TODO decode the response to display corresponding log message
      if(res.status == 200){
        transactionLogger.info(`${transactionId}: DB Write Completed with Status ${res.status}`,
          {module: {functionName:`${path.basename(__filename)}.writeTransactionStatusToDB()`,filepath:__dirname}},
          {event:requestOptions},{response:res.data});
      }else{
        transactionLogger.error(`${transactionId}: DB Write Completed with Status ${res.status}`,
          {module: {functionName:`${path.basename(__filename)}.writeTransactionStatusToDB()`,filepath:__dirname}},
          {event:requestOptions},{response:res.data});
      }
      return "success";
    })
    .catch((err) => {
      transactionLogger.error(`${transactionId}: DB Write Error`,
        {module: {functionName: `${path.basename(__filename)}.writeTransactionToDB()`, filepath: __dirname}},
        {event:requestOptions},{response:`ERROR: ${err.message}`});
      return "error";
    });
}

export {bscTransaction};
export type { TTransactionStatus, TTransactionType, TTransactionMessage };
