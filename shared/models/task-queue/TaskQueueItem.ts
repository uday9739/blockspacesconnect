import { VersionedMongoDbModel } from "../MongoDbModel";
import { TaskQueueItemTaskType } from "./TaskQueueItemTaskType";


export enum TaskQueueItemRecurrence {
  ONCE = 'ONCE',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  DONE = 'DONE',
}

export enum TaskQueueItemStatusOutcome {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED'
}

export interface TaskQueueItem extends VersionedMongoDbModel {
  createdOn: number,
  updatedOn?: number,
  /**
   * determines which code path will fire
   */
  type: TaskQueueItemTaskType;
  /**
   * any data needed for code to execute or external reference
   */
  payload: any;
  /**
   * if null runs as soon as its picked up , else will run on date
   */
  runDate?: number
  /**
   * a way to auto schedule the next task run
   */
  recurrence: TaskQueueItemRecurrence
  /**
   * how many attempts to run task, a way to prevent running indefinitely if erroring out
   */
  attempts: number
  /**
   * Item Current Status
   */
  status: TaskQueueItemStatusOutcome
  /**
   * Running logs of past runs and outcomes 
   */
  auditTrail?: Array<{
    timestamp: number,
    outcome: TaskQueueItemStatusOutcome,
    payload?: any,
    attempts: number
  }> // capture error from failure run
}
