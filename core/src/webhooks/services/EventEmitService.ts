import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { Injectable } from "@nestjs/common";
import { OnchainReceivedData, OnchainSentData, PaymentReceivedData, PaymentSentData, UserOnboardedData, WebhookEventRecord, WebhookEventTypes } from "../../../../shared/models/webhooks/WebhookTypes";
import { WebhookService } from "./WebhookService";

@Injectable()
export class EventEmitService {
  // This class assumes an integration is ALREADY LISTENING to the appropriate Webhooks

  constructor(
    private readonly webhooks: WebhookService,
  ) { }

  /**
   * Emits PaymentReceived Event to webhook associated with tenantId
   *
   * @param {string} tenantId
   * @param {PaymentReceivedData} data
   * @returns {AsyncApiResult}
   */
  async emitPaymentReceived(tenantId: string, data: PaymentReceivedData): AsyncApiResult<WebhookEventRecord[]> {
    try {
      delete data?.__type;
      const ind = data?.erpMetadata?.findIndex(v => v.dataType === 'posted') ?? -1;
      if (ind !== -1) data.erpMetadata.splice(ind, 1);
      const result: ApiResult<WebhookEventRecord[]> = await this.webhooks.triggerWebhooks({
        eventType: WebhookEventTypes.PAYMENT_RECEIVED,
        tenantId: tenantId,
        data: data,
        eventTimestamp: new Date().toISOString(),
      });
      return result;

    } catch (e) {
      return ApiResult.failure("Failed to emit event.", e.message);
    }
  }

  /**
   * Emits PaymentSent Event to webhook associated with tenantId
   *
   * @param {string} tenantId
   * @param {PaymentSentData} data
   * @returns {AsyncApiResult<WebhookEventRecord[]>}
   */
  async emitPaymentSent(tenantId: string, data: PaymentSentData): AsyncApiResult<WebhookEventRecord[]> {
    try {
      delete data.__type;
      const ind = data?.erpMetadata?.findIndex(v => v.dataType === 'posted') ?? -1;
      if (ind !== -1) data.erpMetadata.splice(ind, 1);
      const result = await this.webhooks.triggerWebhooks({
        eventType: WebhookEventTypes.PAYMENT_SENT,
        tenantId: tenantId,
        data: data,
        eventTimestamp: new Date().toISOString(),
      });
      return result;

    } catch (e) {
      return ApiResult.failure("Failed to emit event.", e.message);
    }
  }

  /**
   * Emits OnchainSent Event to webhook associated with tenantId
   *
   * @param {string} tenantId
   * @param {OnchainSentData} data
   * @returns {AsyncApiResult<WebhookEventRecord[]>}
   */
  async emitOnchainSent(tenantId: string, data: OnchainSentData): AsyncApiResult<WebhookEventRecord[]> {
    try {
      delete data.__type;
      const ind = data?.erpMetadata?.findIndex(v => v.dataType === 'posted') ?? -1;
      if (ind !== -1) data.erpMetadata.splice(ind, 1);
      const result = await this.webhooks.triggerWebhooks({
        eventType: WebhookEventTypes.ONCHAIN_SENT,
        tenantId: tenantId,
        data: data,
        eventTimestamp: new Date().toISOString(),
      });
      return result;

    } catch (e) {
      return ApiResult.failure("Failed to emit event.", e.message);
    }
  }

  /**
   * Emits OnchainReceived Event to webhook associated with tenantId
   *
   * @param {string} tenantId
   * @param {OnchainReceivedData} data
   * @returns {AsyncApiResult<WebhookEventRecord[]>}
   */
  async emitOnchainReceived(tenantId: string, data: OnchainReceivedData): AsyncApiResult<WebhookEventRecord[]> {
    try {
      delete data.__type;
      const ind = data?.erpMetadata?.findIndex(v => v.dataType === 'posted') ?? -1;
      if (ind !== -1) data.erpMetadata.splice(ind, 1);
      const result = await this.webhooks.triggerWebhooks({
        eventType: WebhookEventTypes.ONCHAIN_RECEIVED,
        tenantId: tenantId,
        data: data,
        eventTimestamp: new Date().toISOString(),
      });
      return result;

    } catch (e) {
      return ApiResult.failure("Failed to emit event.", e.message);
    }
  }
  /**
   * Emits UserOnboarded Event to webhook associated with partnerTenantId
   *
   * @param {string} partnerTenantId
   * @param {UserOnboardedData} data
   * @returns {AsyncApiResult<WebhookEventRecord[]>}
   */
  async emitUserOnboarded(partnerTenantId: string, data: UserOnboardedData): AsyncApiResult<WebhookEventRecord[]> {
    try {
      delete data.__type;
      const ind = data?.erpMetadata?.findIndex(v => v.dataType === 'posted') ?? -1;
      if (ind !== -1) data.erpMetadata.splice(ind, 1);
      const result = await this.webhooks.triggerWebhooks({
        eventType: WebhookEventTypes.USER_ONBOARDED,
        tenantId: partnerTenantId,
        data: data,
        eventTimestamp: new Date().toISOString(),
      });
      return result;

    } catch (e) {
      return ApiResult.failure("Failed to emit event.", e.message);
    }
  }
}