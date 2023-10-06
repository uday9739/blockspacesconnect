import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { WebhookEvent, WebhookEventRecord, WebhookResponse, WebhookSubscription } from "@blockspaces/shared/models/webhooks/WebhookTypes";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";

@Injectable()
export class WebhookService {

  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly http: HttpService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
  }
  /**
   *
   * createWebhookSubscription - Creates a subscription to a webhook
   *
   * @param  {@link WebhookSubscription} webhookSubscription - the Webhook Subscription being added
   *
   */
  async createWebhookSubscription(webhookSubscription: WebhookSubscription): AsyncApiResult<void> {
    try {
      const existingSubscription = await this.db.webhookSubscription.find({ webhookEndpoint: webhookSubscription.webhookEndpoint });
      if (existingSubscription.length === 1) {
        // If the tenant ID and URL already exists, updte the eventTypes array with the merge of requested and existing
        const currentEventTypes = existingSubscription[0].eventType;
        const mergedEventTypes = Array.from(new Set([...currentEventTypes, ...webhookSubscription.eventType]));
        webhookSubscription.eventType = mergedEventTypes;
        await this.db.webhookSubscription.findOneAndUpdate({ webhookEndpoint: webhookSubscription.webhookEndpoint }, webhookSubscription);
      } else {
        await this.db.webhookSubscription.create(webhookSubscription);
      }
    } catch (error) {
      throw new BadRequestException(error, 'Error creating Webhook Subscription');
    }
    return ApiResult.success();
  }
  /**
   *
   * deleteWebhookSubscription - deletes a webhook subscription
   *
   * @param  {@link WebhookSubscription} webhookSubscription - the subscription to be deleted
   *
   */
  async deleteWebhookSubscription(webhookSubscription: WebhookSubscription): AsyncApiResult<void> {
    try {
      const existingSubscription = await this.db.webhookSubscription.find({ webhookEndpoint: webhookSubscription.webhookEndpoint });
      if (existingSubscription.length === 1) {
        // Update the existing subscription to remove the event types being deleted.
        const currentEventTypes = existingSubscription[0].eventType;
        const filteredEventTypes = currentEventTypes.filter((eventType) => !webhookSubscription.eventType.includes(eventType));
        webhookSubscription.eventType = filteredEventTypes;
        await this.db.webhookSubscription.findOneAndUpdate({ webhookEndpoint: webhookSubscription.webhookEndpoint }, webhookSubscription);
      }
    } catch (error) {
      throw new BadRequestException(error, 'Error deleting Webhook Subscription');
    }
    return ApiResult.success();
  }

  /**
   *
   * callWebhookUrl - calls the url specified for the webhook triggered by the webhook event
   *
   * @param  {@link WebhookEvent} webhookEvent - the event that triggered the webhook call
   * @param  {string} url - the url to be called with a POST
   *
   * @returns {@link ApiResult} - Returns a success or failure and the associated response data
   *
   */
  private callWebhookUrl = async (webhookEvent: WebhookEvent, url: string): AsyncApiResult<WebhookResponse> => {
    let response: HttpResponse;
    try {
      response = await this.http.request({
        url: `${url}`,
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        data: webhookEvent
      });
    } catch (error) {
      return ApiResult.failure('Error calling webhook', this.removeCyclicReferences(error.response));
    }
    if (response.status === HttpStatus.OK) {
      const res: WebhookResponse = {
        status: response.status,
        data: await this.removeCyclicReferences(response.data),
        // @ts-ignore
        headers: response.headers,
        contentType: response.headers['Content-Type'] ?? undefined
      };
      return ApiResult.success(res, 'Webhook completed successfully');
    } else {
      return ApiResult.failure('Webhook failed', this.removeCyclicReferences(response.data));
    }
  };

  /**
   *
   * removeCyclicReferences - in the HTTP response data, there is often cyclic references that need to be removed when inserting this to Mongo
   *
   * @param  {object} jsonDocument - the JSON that might have cyclic references
   *
   * @returns {any} - A de-cyclic-referenced JSON document
   *
   */
  private removeCyclicReferences = (jsonDocument: object): any => {
    const seen = [];
    const jsonString = JSON.stringify(jsonDocument, (key, val) => {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    });
    return JSON.parse(jsonString);
  };

  /**
   *
   * callWebhookWithRetry - Will attempt the webhook no more than 3 times until it is successful
   *
   * @param  {@link WebhookEvent} webhookEvent - The event being triggered
   * @param  {@link WebhookSubscription} webhookSubscription - The subscription being notified
   *
   * @returns {@link ApiResult} - The success or failure and the response from the last webhook call
   *
   */
  private callWebhookWithRetry = async (webhookEvent: WebhookEvent, webhookSubscription: WebhookSubscription): AsyncApiResult<WebhookEventRecord> => {
    let webhookResponseSuccessful: boolean = false;
    let retryCount = 0;
    let webhookResponse: ApiResult<WebhookResponse>;
    while (!webhookResponseSuccessful && retryCount < 3) {
      webhookResponse = await this.callWebhookUrl(webhookEvent, webhookSubscription.webhookEndpoint.url);
      webhookResponseSuccessful = webhookResponse.isSuccess;
      retryCount++;
    }

    if (webhookResponse.isSuccess) {
      return ApiResult.success({ event: webhookEvent, responseStatus: 'success', response: webhookResponse.data }, webhookResponse.message);
    } else {
      return ApiResult.failure(webhookResponse.message, { event: webhookEvent, responseStatus: 'failed', response: webhookResponse.data });
    }
  };

  /**
   *
   * triggerWebhooks - Trigger all of the subscribed webhooks based on the event
   *
   * @param  {@link WebhookEvent} webhookEvent - The event that will trigger the calls
   *
   * @returns {@link ApiResult} - Notification when done
   *
   */
  async triggerWebhooks(webhookEvent: WebhookEvent): AsyncApiResult<WebhookEventRecord[]> {
    let webhookSubscriptions: WebhookSubscription[] = [];
    try {
      webhookSubscriptions = await this.db.webhookSubscription.find({
        eventType: webhookEvent.eventType,
        'webhookEndpoint.tenantId': webhookEvent.tenantId
      });
      if (webhookSubscriptions.length === 0) {
        this.logger.warn(`Event not emitted. The tenant (${webhookEvent.tenantId}) \
        is not subscribed to event type: ${webhookEvent.eventType}`);
        const webhookRecordFailed: WebhookEventRecord = {
          event: webhookEvent,
          responseStatus: 'failed',
          reason: 'NO SUBSCRIPTION'
        };
        await this.db.webhookEvent.create(webhookRecordFailed);
        return;
      }
    } catch (err) {
      const webhookRecordFailed: WebhookEventRecord = {
        event: webhookEvent,
        responseStatus: 'failed',
        reason: 'EXCEPTION RAISED'
      };
      await this.db.webhookEvent.create(webhookRecordFailed).catch(e => {
        this.logger.warn('Failed to create failed webhook record', e);
      });
      throw new BadRequestException(err.data, 'Error finding Webhook Subscription to trigger');
    }
    const promises: AsyncApiResult<WebhookEventRecord>[] = [];
    webhookSubscriptions.forEach(webhookSubscription => {
      promises.push(this.callWebhookWithRetry(webhookEvent, webhookSubscription));
    });
    const settled = await Promise.allSettled(promises);
    let webhookRecord: WebhookEventRecord;
    const webhookResults: WebhookEventRecord[] = [];
    settled.forEach(async (res) => {
      if (res.status === 'rejected') {
        webhookRecord = {
          event: webhookEvent,
          responseStatus: 'failed',
          response: res.reason
        };
      } else {
        webhookRecord = res.value.data;
      }
      try {
        webhookResults.push(webhookRecord);
        this.logger.debug("Client Webhook Invoked", null, webhookRecord, WebhookService.name);
        await this.db.webhookEvent.create(webhookRecord);
      } catch (error) {
        throw new ServiceUnavailableException(error, 'Error creating Webhook Event');
      }
    });

    return ApiResult.success(webhookResults);
  }

}