import { TaskQueueItemDataService } from "../TaskQueueItemDataService";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { TaskQueueItemTaskType } from "@blockspaces/shared/models/task-queue/TaskQueueItemTaskType";
import { DateTime } from "luxon";
import { TaskQueueItem, TaskQueueItemRecurrence, TaskQueueItemStatusOutcome } from '@blockspaces/shared/models/task-queue/TaskQueueItem';

describe(`${TaskQueueItemDataService.name}`, () => {
  let service: TaskQueueItemDataService;
  let mocks: {
    logger: ConnectLogger,
    dataContext: ConnectDbDataContext
  };

  let mockData: {
    taskQueueItem: TaskQueueItem,
    taskQueueItemsArray: Array<TaskQueueItem>
    taskId: String,
    taskRunDate: Number,
    taskPromise: Promise<TaskQueueItem>,
    taskType: TaskQueueItemTaskType
  };

  beforeEach(() => {
    mocks = {
      logger: createMock<ConnectLogger>(),
      dataContext: createMock<ConnectDbDataContext>()
    };

    mockData = {
      taskQueueItem: createMock<TaskQueueItem>(),
      taskQueueItemsArray: createMock<Array<TaskQueueItem>>(),
      taskId: createMock<String>(),
      taskRunDate: createMock<Number>(),
      taskPromise: createMock<Promise<TaskQueueItem>>(),
      taskType: TaskQueueItemTaskType.REPORT_SUBSCRIPTION_USAGE
    };

    service = new TaskQueueItemDataService(mocks.dataContext);
  });
  //

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`${TaskQueueItemDataService.prototype.createScheduledTask.name}`, () => {

    it(`${TaskQueueItemDataService.prototype.createScheduledTask.name} should be defined`, async () => {
      expect(service.createScheduledTask).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.createScheduledTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.create = jest.fn().mockReturnValue(mockData.taskQueueItem);
      // act
      const results = await service.createScheduledTask(TaskQueueItemTaskType.REPORT_SUBSCRIPTION_USAGE, TaskQueueItemRecurrence.DAILY, null, DateTime.utc().toMillis())
      // assert
      expect(results).toBeDefined();
    });
  });

  describe(`${TaskQueueItemDataService.prototype.createInstantTask.name}`, () => {

    it(`${TaskQueueItemDataService.prototype.createInstantTask.name} should be defined`, async () => {
      expect(service.createInstantTask).toBeDefined();
    });


    it(`${TaskQueueItemDataService.prototype.createInstantTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.create = jest.fn().mockReturnValue(mockData.taskQueueItem);
      // act
      const results = await service.createInstantTask(TaskQueueItemTaskType.REPORT_SUBSCRIPTION_USAGE, TaskQueueItemRecurrence.DAILY, null)
      // assert
      expect(results).toBeDefined();
    });

  });


  describe(`${TaskQueueItemDataService.prototype.updateTask.name}`, () => {

    it(`${TaskQueueItemDataService.prototype.updateTask.name} should be defined`, async () => {
      expect(service.updateTask).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.updateTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.taskQueueItem
      }));

      // act
      const results = await service.updateTask(mockData.taskQueueItem);
      // assert
      expect(results).toBeDefined();
    });

  });


  describe(`${TaskQueueItemDataService.prototype.getPendingTask.name}`, () => {

    it(`${TaskQueueItemDataService.prototype.getPendingTask.name} should be defined`, async () => {
      expect(service.getPendingTask).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.getPendingTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.find = jest.fn().mockReturnValue(mockData.taskQueueItemsArray);

      // act
      const results = await service.getPendingTask();
      // assert
      expect(results).toBeDefined();
    });

  });


  describe(`${TaskQueueItemDataService.prototype.setLastRunDateForTask.name}`, () => {

    it(`${TaskQueueItemDataService.prototype.setLastRunDateForTask.name} should be defined`, async () => {
      expect(service.setLastRunDateForTask).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.setLastRunDateForTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.find = jest.fn().mockReturnValue(mockData.taskQueueItemsArray);

      jest.spyOn(service as any, "getById").mockResolvedValue(mockData.taskPromise);
      jest.spyOn(service as any, "updateTask").mockResolvedValue(mockData.taskPromise);

      // act
      const results = await service.setLastRunDateForTask(mockData.taskId.toString(), Number(mockData.taskRunDate));
      // assert
      expect(results).toBeDefined();
    });

  });


  describe(`${TaskQueueItemDataService.prototype.deleteTask.name}`, () => {
    it(`${TaskQueueItemDataService.prototype.deleteTask.name} should be defined`, async () => {
      expect(service.deleteTask).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.deleteTask.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.findByIdAndDelete = jest.fn().mockReturnValue(mockData.taskQueueItem);

      // act
      const results = await service.deleteTask(mockData.taskId.toString());
      // assert
      expect(results).toBeDefined();
    });
  });

  describe(`${TaskQueueItemDataService.prototype.getByPayloadAndType.name}`, () => {
    it(`${TaskQueueItemDataService.prototype.getByPayloadAndType.name} should be defined`, async () => {
      expect(service.getByPayloadAndType).toBeDefined();
    });

    it(`${TaskQueueItemDataService.prototype.getByPayloadAndType.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.findOne = jest.fn().mockReturnValue(mockData.taskQueueItem);

      // act
      const results = await service.getByPayloadAndType(mockData.taskType, {});
      // assertU
      expect(results).toBeDefined();
    });
  });

  describe(`${TaskQueueItemDataService.prototype.findByPayloadAndType.name}`, () => {
    it(`${TaskQueueItemDataService.prototype.findByPayloadAndType.name} should be defined`, async () => {
      expect(service.findByPayloadAndType).toBeDefined();
    });
    it(`${TaskQueueItemDataService.prototype.findByPayloadAndType.name} should return`, async () => {
      // arrange
      mocks.dataContext.taskQueueItems.find = jest.fn().mockReturnValue(mockData.taskQueueItemsArray);

      // act
      const results = await service.findByPayloadAndType(mockData.taskType, {});
      // assertU
      expect(results).toBeDefined();
    });
  });
});