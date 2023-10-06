import { bscTransaction } from "../helpers/bscTransaction";
import { FlowType } from "@blockspaces/shared/models/flows/Flow";
import { IConnection } from "@blockspaces/shared/models/flows/Connection";
import { ExecutableFlow } from "./ExecutableFlow";
import { TExecutableConnectionResponse } from "./Connection/ExecutableConnectionResponse";

export class DataQueue {
  #queue: Record<string,any>;

  constructor () {
    this.#queue = {};
  }

  public addItem (key:string,value:any) {
    this.#queue[key] = value;
  }

  public getItem (key:string):any {
    return this.#queue[key];
  }

};

export class ExecutableFlowState {
  dataQueue:DataQueue;
  clientId:string;
  transaction: bscTransaction;
  actualResponses: Record<string,any>;
  executionResponse: Array<TExecutableConnectionResponse>;

  constructor(flow:ExecutableFlow) {
    this.dataQueue=new DataQueue();
    this.clientId=flow.clientId;
    this.transaction=new bscTransaction(flow.type===FlowType.SCHEDULED?"scheduled flow":"triggered flow");
    this.actualResponses={};
    this.executionResponse=[];
  }

  started() {
    this.transaction.setTransactionStatus("started");
  }
  
  completed() {
    this.transaction.setTransactionStatus("completed");
  }

  errored() {
    this.transaction.setTransactionStatus("error");
  }

  waiting() {
    this.transaction.setTransactionStatus("waiting");
  }

  connectionCompleted(connection:IConnection, response:TExecutableConnectionResponse) {
    this.actualResponses[connection.id]=response.responseCode;
    this.dataQueue.addItem(`${connection.id}:${connection.activeMethod?.method}:${connection.activeMethod?.name}:${response.responseCode}`,response.data);
    this.executionResponse.push(response);
    this.transaction.setTransactionStatus("running");
  }

  connectionErrored(connection:IConnection, response:TExecutableConnectionResponse) {
    this.transaction.setTransactionStatus("error");
  }

  connectionSkipped(connection:IConnection, message:string) {
      this.executionResponse.push({message: `Will not run node ${connection.id}. ${message}`, responseCode: '000', data:{} })
      this.transaction.setTransactionStatus("running");
    }
}
