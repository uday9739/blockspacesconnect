import { TasksRunnerService } from "../TasksRunnerService";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { TaskQueueItem } from '@blockspaces/shared/models/task-queue/TaskQueueItem';
import { TaskQueueItemDataService } from "../TaskQueueItemDataService";
import { TaskRunnerResult } from "../../types/Types";
import { ConnectSubscriptionService } from "../../../connect-subscription/services/ConnectSubscriptionService";
import { QuickbooksClient } from "../../../quickbooks/clients/QuickbooksClient";
import { CronExpression } from "@nestjs/schedule";
import { AppIdService } from "../../../app-id";
import { SecretService } from "../../../secrets/services/SecretService";
import { VaultService } from "../../../vault";
import { LightningTasksService } from "../../../networks/lightning/onboarding/services/LightningTasksService";
import { CancellationService } from '../../../connect-subscription/services/CancellationService';
import { EndpointsService } from "../../../endpoints/services";
import { EnvironmentVariables } from "../../../env";
describe(`${TasksRunnerService.name}`, () => {
  let service: TasksRunnerService;
  let mocks: {
    logger: ConnectLogger,
    taskQueueItemDataService: TaskQueueItemDataService,
    connectSubscriptionService: ConnectSubscriptionService,
    quickbooksClient: QuickbooksClient,
    appIdService: AppIdService,
    vaultService: VaultService,
    secretService: SecretService,
    db: ConnectDbDataContext,
    lightningTasksService: LightningTasksService,
    cancellationService: CancellationService,
    endpointsService: EndpointsService,
    env: EnvironmentVariables
  };

  let mockData: {
    promise: Promise<void>,
    task: TaskQueueItem,
    taskRunnerResult: TaskRunnerResult
  };

  beforeEach(() => {
    mocks = {
      logger: createMock<ConnectLogger>(),
      taskQueueItemDataService: createMock<TaskQueueItemDataService>(),
      connectSubscriptionService: createMock<ConnectSubscriptionService>(),
      quickbooksClient: createMock<QuickbooksClient>(),
      appIdService: createMock<AppIdService>(),
      vaultService: createMock<VaultService>(),
      secretService: createMock<SecretService>(),
      db: createMock<ConnectDbDataContext>(),
      lightningTasksService: createMock<LightningTasksService>(),
      cancellationService: createMock<CancellationService>(),
      endpointsService: createMock<EndpointsService>(),
      env: createMock<EnvironmentVariables>(),
    };

    mockData = {
      promise: createMock<Promise<void>>(),
      task: createMock<TaskQueueItem>(),
      taskRunnerResult: createMock<TaskRunnerResult>()
    };

    service = new TasksRunnerService(
      mocks.logger,
      mocks.taskQueueItemDataService,
      mocks.connectSubscriptionService,
      mocks.quickbooksClient,
      mocks.appIdService,
      mocks.vaultService,
      mocks.secretService,
      mocks.db,
      mocks.lightningTasksService,
      mocks.cancellationService,
      mocks.endpointsService,
      mocks.env,
    );
  });
  //

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`${TasksRunnerService.prototype.handleCron.name}`, () => {

    it(`${TasksRunnerService.prototype.handleCron.name} should be defined`, async () => {
      expect(service.handleCron).toBeDefined();
    });

    it(`${TasksRunnerService.prototype.handleCron.name} should run`, async () => {
      // arrange
      jest.spyOn(service as any, "processTask").mockResolvedValue(mockData.promise);
      jest.spyOn(service as any, "preProcessHelper").mockResolvedValue(mockData.task);
      jest.spyOn(service as any, "processTaskItemHelper").mockResolvedValue(mockData.taskRunnerResult);
      jest.spyOn(service as any, "postProcessHelper").mockResolvedValue(mockData.task);

      // act
      const results = await service.handleCron();
      // assert

      expect(results);
    });


    it(`Make sure cron schedule is set to ${CronExpression.EVERY_5_MINUTES}}`, async () => {
      // act
      const guard = Reflect.getMetadata('SCHEDULE_CRON_OPTIONS', TasksRunnerService.prototype.handleCron);
      // assert
      expect(guard?.cronTime).toEqual(CronExpression.EVERY_5_MINUTES);
    });
  });


});