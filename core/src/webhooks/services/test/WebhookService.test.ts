import { HttpService } from "@blockspaces/shared/services/http";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables } from "../../../env";
import { PaymentSentData, WebhookEvent, WebhookEventTypes, WebhookSubscription } from "../../../../../shared/models/webhooks/WebhookTypes";
import { WebhookService } from "../WebhookService";
import { AxiosResponse } from "axios";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { BadRequestException } from "../../../exceptions/common";
import { ConnectLogger } from "../../../logging/ConnectLogger";

describe(WebhookService, () => {

  let mocks: {
    env: EnvironmentVariables,
    db: ConnectDbDataContext,
    http: HttpService,
    logger: ConnectLogger
  };
  let webhookService: WebhookService;


  beforeEach(() => {
    mocks = {
      env: createMock<EnvironmentVariables>(),
      db: createMock<ConnectDbDataContext>(),
      http: createMock<HttpService>(),
      logger: createMock<ConnectLogger>()
    };

    webhookService = new WebhookService(mocks.db, mocks.http, mocks.logger);

  });

  it("Should fail creating a Webhook Subscription", async () => {
    mocks.db.webhookSubscription.find = jest.fn().mockRejectedValue(new Error());
    const createWebhookSubscriptionResponse = webhookService.createWebhookSubscription(null);
    await expect(createWebhookSubscriptionResponse).rejects.toThrowError(BadRequestException);
  });

  it("Should succeed creating a Webhook Subscription for a new tenant and url", async () => {
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue([]);
    mocks.db.webhookSubscription.create = jest.fn().mockResolvedValue(<WebhookSubscription>webhookSubscriptionRequest);
    const createWebhookSubscriptionResponse = webhookService.createWebhookSubscription(webhookSubscriptionRequest);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
  });

  it("Should succeed creating a Webhook Subscription for an existing tenant and url", async () => {
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue(<WebhookSubscription>webhookSubscriptionRequest);
    mocks.db.webhookSubscription.findOneAndUpdate = jest.fn().mockResolvedValue(<WebhookSubscription>webhookSubscriptionRequest);
    const createWebhookSubscriptionResponse = webhookService.createWebhookSubscription(webhookSubscriptionRequest);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
  });

  it("Should fail deleting a Webhook Subscription", async () => {
    mocks.db.webhookSubscription.find = jest.fn().mockRejectedValue(new Error());
    const createWebhookSubscriptionResponse = webhookService.deleteWebhookSubscription(null);
    await expect(createWebhookSubscriptionResponse).rejects.toThrowError(BadRequestException);
  });

  it("Should succeed deleting a Webhook Subscription", async () => {
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue(<WebhookSubscription>webhookSubscriptionRequest);
    mocks.db.webhookSubscription.findOneAndUpdate = jest.fn().mockResolvedValueOnce(<WebhookSubscription>webhookSubscriptionRequest);
    const createWebhookSubscriptionResponse = webhookService.deleteWebhookSubscription(webhookSubscriptionRequest);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
  });

  it("Should succeed triggering a Webhook", async () => {
    const webhookEvent: WebhookEvent = createMock<WebhookEvent>();
    webhookEvent.eventType = WebhookEventTypes.PAYMENT_SENT;
    webhookEvent.eventTimestamp = new Date().toISOString();
    webhookEvent.data = createMock<PaymentSentData>();
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue([<WebhookSubscription>webhookSubscriptionRequest]);
    mocks.http.request = jest.fn().mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.OK,
      data: {}
    });
    mocks.db.webhookEvent.create = jest.fn().mockResolvedValue({});
    const createWebhookSubscriptionResponse = webhookService.triggerWebhooks(webhookEvent);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
    expect(mocks.db.webhookEvent.create).toBeCalledTimes(1);
    expect(mocks.http.request).toBeCalledTimes(1);
  });

  it("Should call webhook 2 times because it failed the first time", async () => {
    const webhookEvent: WebhookEvent = createMock<WebhookEvent>();
    webhookEvent.eventType = WebhookEventTypes.PAYMENT_SENT;
    webhookEvent.eventTimestamp = new Date().toISOString();
    webhookEvent.data = createMock<PaymentSentData>();
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue([<WebhookSubscription>webhookSubscriptionRequest]);
    mocks.http.request = jest.fn().mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.BAD_REQUEST,
      data: {}
    }).mockResolvedValueOnce(<AxiosResponse>{
      status: HttpStatus.OK,
      data: {}
    });
    mocks.db.webhookEvent.create = jest.fn().mockResolvedValue({});
    const createWebhookSubscriptionResponse = webhookService.triggerWebhooks(webhookEvent);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
    expect(mocks.http.request).toBeCalledTimes(2);
    expect(mocks.db.webhookEvent.create).toBeCalledTimes(1);
  });

  it("Should call webhook 3 times, failing on all three", async () => {
    const webhookEvent: WebhookEvent = createMock<WebhookEvent>();
    webhookEvent.eventType = WebhookEventTypes.PAYMENT_SENT;
    webhookEvent.eventTimestamp = new Date().toISOString();
    webhookEvent.data = createMock<PaymentSentData>();
    const webhookSubscriptionRequest: WebhookSubscription = createMock<WebhookSubscription>();
    webhookSubscriptionRequest.webhookEndpoint.tenantId = "test";
    webhookSubscriptionRequest.webhookEndpoint.url = "http://test.com/webhook";
    webhookSubscriptionRequest.eventType = [WebhookEventTypes.PAYMENT_SENT];
    mocks.db.webhookSubscription.find = jest.fn().mockResolvedValue([<WebhookSubscription>webhookSubscriptionRequest]);
    mocks.http.request = jest.fn().mockResolvedValue(<AxiosResponse>{
      status: HttpStatus.BAD_REQUEST,
      data: {}
    });
    mocks.db.webhookEvent.create = jest.fn().mockResolvedValue({});
    const createWebhookSubscriptionResponse = webhookService.triggerWebhooks(webhookEvent);
    await expect(createWebhookSubscriptionResponse).resolves.not.toThrowError();
    expect(mocks.http.request).toBeCalledTimes(3);
    expect(mocks.db.webhookEvent.create).toBeCalledTimes(1);
  });

});