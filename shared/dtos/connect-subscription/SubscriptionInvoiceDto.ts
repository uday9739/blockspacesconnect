import { ConnectSubscriptionInvoiceStatus } from "../../models/connect-subscription/ConnectSubscription";
import { BillingAddressDto } from "../cart";
import { PagedResults } from "../PagedResults";


export class PagedSubscriptionInvoiceResults extends PagedResults<SubscriptionInvoiceDto[]> { }

export interface SubscriptionInvoiceDto {
  id: string;
  number: string;
  userId: string;
  status: ConnectSubscriptionInvoiceStatus;
  amount?: number;
  billingAddress?: BillingAddressDto;
  totalDiscountAmount?: number;
  period: {
    billingStart: number,
    billingEnd: number,
    meteredUsageStart: number,
    meteredUsageEnd: number
  },
  lines?: ConnectSubscriptionInvoiceLineItemDto[]
}
export interface ConnectSubscriptionInvoiceLineItemDto {

  connectSubscriptionItemId: string;
  networkId: string;
  //networkPrice: string;
  title: string;
  description: string;
  quantity: number;
  lineTotal: number;
  unitAmount: number;
  proration?: boolean;
  prorationDate?: number;
}