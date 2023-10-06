import ApiResult from "@blockspaces/shared/models/ApiResult";
import { createMock } from "ts-auto-mock";
import { OnchainReceivedData, OnchainSentData, PaymentReceivedData, PaymentSentData, UserOnboardedData, WebhookEventRecord } from "../../../../../shared/models/webhooks/WebhookTypes";
import { EventEmitService } from "../EventEmitService";
import { WebhookService } from "../WebhookService";

describe(EventEmitService, () => {
  let mocks: {
    webhooks: WebhookService
  };
  let eventEmitService: EventEmitService;
  let successResult: ApiResult<WebhookEventRecord[]>;

  beforeEach(() => {
    mocks = {
      webhooks: createMock<WebhookService>()
    };

    successResult = createMock<ApiResult<WebhookEventRecord[]>>();
    eventEmitService = new EventEmitService(mocks.webhooks);
  });

  describe(EventEmitService.prototype.emitPaymentReceived, () => {
    let data: PaymentReceivedData;
    beforeEach(() => {
      data = createMock<PaymentReceivedData>();
    });
    it('should fail when data is empty', async () => {
      data = null;
      mocks.webhooks.triggerWebhooks = jest.fn().mockRejectedValue({ message: 'failed' });
      const result = await eventEmitService.emitPaymentReceived('', data);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.isSuccess).toBeFalsy();
    });
    it('should succeed', async () => {
      const data = createMock<PaymentReceivedData>();
      const result = await eventEmitService.emitPaymentReceived('', data);
      expect(result).toMatchObject(successResult);
    });
  });

  describe(EventEmitService.prototype.emitPaymentSent, () => {
    let data: PaymentSentData;
    beforeEach(() => {
      data = createMock<PaymentSentData>();
    });
    it('should fail when data is empty', async () => {
      data = null;
      mocks.webhooks.triggerWebhooks = jest.fn().mockRejectedValue({ message: 'failed' });
      const result = await eventEmitService.emitPaymentSent('', data);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.isSuccess).toBeFalsy();
    });
    it('should succeed', async () => {
      const data = createMock<PaymentSentData>();
      const result = eventEmitService.emitPaymentSent('', data);
      expect(result).resolves.toMatchObject(successResult);
    });
  });

  describe(EventEmitService.prototype.emitOnchainSent, () => {
    let data: OnchainSentData;
    beforeEach(() => {
      data = createMock<OnchainSentData>();
    });
    it('should fail when data is empty', async () => {
      data = null;
      mocks.webhooks.triggerWebhooks = jest.fn().mockRejectedValue({ message: 'failed' });
      const result = await eventEmitService.emitOnchainSent('', data);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.isSuccess).toBeFalsy();
    });
    it('should succeed', async () => {
      const data = createMock<OnchainSentData>();
      const result = eventEmitService.emitOnchainSent('', data);
      expect(result).resolves.toMatchObject(successResult);
    });
  });

  describe(EventEmitService.prototype.emitOnchainReceived, () => {
    let data: OnchainReceivedData;
    beforeEach(() => {
      data = createMock<OnchainReceivedData>();
    });
    it('should fail when data is empty', async () => {
      data = null;
      mocks.webhooks.triggerWebhooks = jest.fn().mockRejectedValue({ message: 'failed' });
      const result = await eventEmitService.emitOnchainReceived('', data);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.isSuccess).toBeFalsy();
    });
    it('should succeed', async () => {
      const data = createMock<OnchainReceivedData>();
      const result = eventEmitService.emitOnchainReceived('', data);
      expect(result).resolves.toMatchObject(successResult);
    });
  });

  describe(EventEmitService.prototype.emitUserOnboarded, () => {
    let data: UserOnboardedData;
    beforeEach(() => {
      data = createMock<UserOnboardedData>();
    });
    it('should fail when data is empty', async () => {
      data = null;
      mocks.webhooks.triggerWebhooks = jest.fn().mockRejectedValue({ message: 'failed' });
      const result = await eventEmitService.emitUserOnboarded('', data);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.isSuccess).toBeFalsy();
    });
    it('should succeed', async () => {
      const data = createMock<UserOnboardedData>();
      const result = eventEmitService.emitUserOnboarded('', data);
      expect(result).resolves.toMatchObject(successResult);
    });
  });
});