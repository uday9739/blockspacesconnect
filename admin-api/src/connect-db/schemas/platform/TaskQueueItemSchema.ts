import { Schema } from "mongoose";
import { TaskQueueItem, TaskQueueItemStatusOutcome, TaskQueueItemRecurrence } from "@blockspaces/shared/models/task-queue/TaskQueueItem";
import { TaskQueueItemTaskType } from "@blockspaces/shared/models/task-queue/TaskQueueItemTaskType";


export const TaskQueueItemSchema = new Schema<TaskQueueItem>({
  type: {
    type: String,
    enum: Object.values(TaskQueueItemTaskType),
    required: true
  },
  runDate: {
    type: Number,
    required: false
  },
  createdOn: {
    type: Number,
    required: false
  },
  updatedOn: {
    type: Number,
    required: false
  },
  payload: {

  },
  recurrence: {
    type: String,
    enum: Object.values(TaskQueueItemRecurrence),
    required: true
  },
  attempts: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TaskQueueItemStatusOutcome),
    default: TaskQueueItemStatusOutcome.QUEUED,
    required: true
  },
  auditTrail: {
    type: [new Schema({
      timestamp: {
        type: Number,
        required: true
      },
      outcome: {
        type: String,
        enum: Object.values(TaskQueueItemStatusOutcome),
        default: TaskQueueItemStatusOutcome.QUEUED,
        required: true
      },
      payload: {

      },
    })],
    required: [false, ``]
  }
});