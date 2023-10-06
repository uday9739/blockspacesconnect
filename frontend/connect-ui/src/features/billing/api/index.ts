
import { IApiResult } from "@blockspaces/shared/models/ApiResult"
import { CreditCard } from "@blockspaces/shared/dtos/billing/CreditCard"
import axios from "axios"
import { getApiUrl } from "@src/platform/utils"
import { PagedSubscriptionInvoiceResults, SubscriptionInvoiceDto } from "@blockspaces/shared/dtos/connect-subscription/SubscriptionInvoiceDto";

const controllerBaseUri = `/connect-subscription`;

export async function listPaymentMethods(): Promise<CreditCard[]> {
  const { data: results } = await axios.get<IApiResult<CreditCard[]>>(getApiUrl(`/payment-methods`))
  return results.data
}

export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<Boolean> {
  const result = await axios.put<{ paymentMethodId: string }, IApiResult<Boolean>>(getApiUrl(`/payment-methods/${paymentMethodId}`), {})
  return result.data as any
}

export async function attachPaymentMethod(paymentMethodId: string, setAsDefault?: boolean): Promise<Boolean> {
  const result = await axios.post<{ paymentMethodId: string }, IApiResult<Boolean>>(getApiUrl(`$/payment-methods/${paymentMethodId}}`), { setAsDefault })
  return result.data as any
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<Boolean> {
  const result = await axios.delete<{ paymentMethodId: string }, IApiResult<Boolean>>(getApiUrl(`payment-methods/${paymentMethodId}`))
  return result.data as any
}
export async function getPublishableKey(): Promise<string> {
  const { data: results } = await axios.get<IApiResult<string>>(getApiUrl(`/payment-methods/publishable-key`))
  return results.data;
}

export async function getInvoicesForTenant(page: number, take: number, sortByField: string, sortByFieldDirection: string): Promise<PagedSubscriptionInvoiceResults> {
  const result = await axios.get<IApiResult<PagedSubscriptionInvoiceResults>>(getApiUrl("/invoices"), { params: { page, take, sortByField, sortByFieldDirection } });
  return result.data.data;
}

export async function getInvoiceDetails(id: string): Promise<SubscriptionInvoiceDto> {
  const result = await axios.get<IApiResult<SubscriptionInvoiceDto>>(getApiUrl(`/invoices/${id}`));
  return result.data.data;
}

