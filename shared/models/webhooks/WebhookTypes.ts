/* eslint-disable indent */
import { Min, IsOptional, IsEnum, IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsObject, IsISO8601, Matches, IsMimeType, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedCurrencies } from '../lightning/Currencies';
import { IsBitcoinAddress, IsPaymentRequest } from '../../validation/decorators';
import { PaymentSource, PaymentSources } from '../lightning/Invoice';
import { OmitType } from '@nestjs/swagger';
import { ErpMetadata } from '../lightning/Integration';


export enum WebhookEventTypes {
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_SENT = 'payment.sent',
  ONCHAIN_RECEIVED = 'onchain.received',
  ONCHAIN_SENT = 'onchain.sent',
  USER_ONBOARDED = 'user.onboarded'
}

export const WebhookResponseTypes = ['success', 'failed'] as const;
export type WebhookResponseType = typeof WebhookResponseTypes[number];

export type WebhookEndpoint = {
  tenantId: string;
  url: string;
}

export type WebhookSubscription = {
  webhookEndpoint: WebhookEndpoint;
  eventType: WebhookEventTypes[];
}


export class OwnerWebhookEndpoints extends Array<WebhookEndpoint> { };

export class Amount {
  @IsString()
  @IsNotEmpty()
  @Matches(`^${SupportedCurrencies.join('|')}$`, 'i') // Currency codes, ignore casing
  currency: string = null;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amountSats: number = null;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amountFiat: number = null;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  exchangeRate: number = null;
}

/**
 * Parent class for Webhook data. Contains
 * __type field for discrimination of types with
 * class-transformer.
 *
 * @class WebhookData
 * @typedef {WebhookData}
 */
class WebhookData {
  @IsEnum(Object.values(WebhookEventTypes))
  __type: WebhookEventTypes;

  @IsISO8601()
  timestamp: string;

  @IsBoolean()
  isUpdate?: boolean = false;

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => ErpMetadata)
  erpMetadata?: ErpMetadata[] = [];
}
class PaymentData extends WebhookData {
  @ValidateNested()
  amount: Amount = null;
}

/**
 * Payment Received webhook data
 *
 * @class PaymentReceivedData
 * @typedef {PaymentReceivedData}
 * @extends {PaymentData}
 */
export class PaymentReceivedData extends PaymentData {
  static __type = WebhookEventTypes.PAYMENT_RECEIVED;

  @IsString()
  @Matches(`^${PaymentSources.join('|')}$`, 'i') // PaymentSources, ignore casing
  @IsNotEmpty()
  source: PaymentSource;

  @IsBoolean()
  isOnchain?: boolean = false;

  @IsPaymentRequest()
  paymentRequest?: string;

}
export class PaymentSentData extends PaymentData {
  static readonly __type = WebhookEventTypes.PAYMENT_SENT;

  @IsPaymentRequest()
  paymentRequest?: string;

  @IsString()
  @IsBitcoinAddress()
  onchainAddress?: string = null;

  @IsBoolean()
  isOnchain?: boolean = false;
}
export class OnchainSentData extends PaymentData {
  static readonly __type: WebhookEventTypes = WebhookEventTypes.ONCHAIN_SENT;

  @IsString()
  @IsBitcoinAddress()
  receiver: string = null;

  @ValidateNested()
  totalFees: Amount = null;

  @ValidateNested()
  netBalanceChange: Amount = null;

  @IsString()
  txnHash: string = null;

  @IsString()
  blockHash: string = null;
}
export class OnchainReceivedData extends PaymentData {
  static readonly __type: WebhookEventTypes = WebhookEventTypes.ONCHAIN_RECEIVED;

  @ValidateNested()
  totalFees: Amount = null;

  @ValidateNested()
  netBalanceChange: Amount = null;

  @IsString()
  txnHash: string = null;

  @IsString()
  blockHash: string = null;

  @IsString()
  @Matches(`^${PaymentSources.join('|')}$`, 'i') // Payment Sources, ignore casing
  @IsNotEmpty()
  source?: PaymentSource = null;
}

export class UserOnboardedData extends WebhookData {
  static readonly __type: WebhookEventTypes = WebhookEventTypes.USER_ONBOARDED;
  tenantId: string;
  apiKey: string;
}

/**
 * Parent class for generic Webhook Event
 *
 * @class WebhookEvent
 * @typedef {WebhookEvent}
 */
export class WebhookEvent {
  @IsEnum(Object.values(WebhookEventTypes))
  eventType: WebhookEventTypes;

  @ValidateNested()
  @Type(() => WebhookData, {
    keepDiscriminatorProperty: false,
    discriminator: {
      property: '__type',
      subTypes: [
        { value: PaymentReceivedData, name: WebhookEventTypes.PAYMENT_RECEIVED },
        { value: PaymentSentData, name: WebhookEventTypes.PAYMENT_SENT },
        { value: OnchainReceivedData, name: WebhookEventTypes.ONCHAIN_RECEIVED },
        { value: OnchainSentData, name: WebhookEventTypes.ONCHAIN_SENT },
        { value: UserOnboardedData, name: WebhookEventTypes.USER_ONBOARDED },
      ]
    }
  })
  data: PaymentReceivedData | PaymentSentData | OnchainReceivedData | OnchainSentData | UserOnboardedData;

  @IsString()
  tenantId: string;

  @IsISO8601()
  eventTimestamp: string;
}

export class WebhookEventDto extends OmitType(WebhookEvent, ['tenantId', 'eventTimestamp'] as const) { }

export class WebhookResponse {
  @IsString()
  @IsMimeType()
  contentType: String;

  data: any;
  headers: string[];
  status: number;
}

export class WebhookEventRecord {
  responseStatus: WebhookResponseType;
  response?: WebhookResponse;
  reason?: string;
  event: WebhookEvent;
}