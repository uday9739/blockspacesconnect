
import { Inject, Injectable } from '@nestjs/common';
import { ConnectDbDataContext } from '../../connect-db/services/ConnectDbDataContext';
import { TaskQueueItemTaskType } from '@blockspaces/shared/models/task-queue/TaskQueueItemTaskType';
import { TaskQueueItem, TaskQueueItemRecurrence, TaskQueueItemStatusOutcome } from '@blockspaces/shared/models/task-queue/TaskQueueItem';
import { DateTime } from 'luxon';


@Injectable()
export class TaskQueueItemDataService {
  public readonly MAX_ATTEMPTS = 10;
  constructor(private readonly dataContext: ConnectDbDataContext) {
  }


  /**
   * Creates a task that will be picked up by task runner on run date; please allow for time slippage 
   * @param type determines which code path will fire
   * @param recurrence a way to auto schedule the next task run
   * @param payload any data needed for code to execute 
   * @param runDateInUTC Date in UTC
   */
  async createScheduledTask(type: TaskQueueItemTaskType, recurrence: TaskQueueItemRecurrence, payload: any, runDate: number): Promise<TaskQueueItem> {
    return await this.dataContext.taskQueueItems.create({
      createdOn: DateTime.utc().toMillis(),
      type,
      payload: payload,
      runDate,
      recurrence,
      attempts: 0,
      status: TaskQueueItemStatusOutcome.QUEUED
    });
  }

  /**
   * Creates as task that runs immediately (with-in 5 min window), 
   * @param type determines which code path will fire
   * @param recurrence a way to auto schedule the next task run
   * @param payload any data needed for code to execute or external reference
   * @returns 
   */
  async createInstantTask(type: TaskQueueItemTaskType, recurrence: TaskQueueItemRecurrence, payload: any): Promise<TaskQueueItem> {
    return await this.dataContext.taskQueueItems.create({
      createdOn: DateTime.utc().toMillis(),
      type,
      payload: payload,
      recurrence,
      attempts: 0,
      status: TaskQueueItemStatusOutcome.QUEUED
    });
  }

  /**
   * Update Task Queue Item 
   * @param task 
   * @returns 
   */
  async updateTask(task: TaskQueueItem): Promise<TaskQueueItem> {
    task.updatedOn = DateTime.utc().toMillis();
    return (await this.dataContext.taskQueueItems.updateByIdAndSave(task._id, task)).toObject<TaskQueueItem>();
  }

  /**
   * Get list of all task pending to be processed 
   * @returns List of tasks pending 
   */
  async getPendingTask(): Promise<Array<TaskQueueItem>> {
    const utcNow = DateTime.utc().toMillis();
    const limboThreshold = DateTime.utc().minus({ minutes: 10 }).toMillis();
    const limboTaskClause = `(task.status === "${TaskQueueItemStatusOutcome.PROCESSING}" && task.updatedOn <= ${limboThreshold})`;
    const $where = `function (){
      const task = this;
      return ((!task.runDate || task.runDate <= ${utcNow})
        &&
        (task.status === "${TaskQueueItemStatusOutcome.QUEUED}" || task.status === "${TaskQueueItemStatusOutcome.ERROR}")
        &&
        (task.attempts < ${this.MAX_ATTEMPTS})) || ${limboTaskClause};
    }`;
    const items = await this.dataContext.taskQueueItems.find({ $where });
    return items;
  }


  async setLastRunDateForTask(id: string, runDate: number): Promise<TaskQueueItem> {
    const scheduledTask = await this.getById(id);
    // update
    scheduledTask.recurrence = TaskQueueItemRecurrence.ONCE; // setting to once will ensure no more future runs
    scheduledTask.runDate = runDate;
    // persist
    return this.updateTask(scheduledTask);
  }


  async deleteTask(id: string) {
    return this.dataContext.taskQueueItems.findByIdAndDelete(id);
  }

  async getByPayloadAndType(type: TaskQueueItemTaskType, payload: any): Promise<TaskQueueItem> {
    return this.dataContext.taskQueueItems.findOne({ type, payload });
  }

  async findByPayloadAndType(type: TaskQueueItemTaskType, payloadFilter: any): Promise<TaskQueueItem[]> {
    return this.dataContext.taskQueueItems.find({ type: type, ...payloadFilter });
  }

  private async getById(id: string): Promise<TaskQueueItem> {
    return await this.dataContext.taskQueueItems.findOne({ _id: id });
  }


}