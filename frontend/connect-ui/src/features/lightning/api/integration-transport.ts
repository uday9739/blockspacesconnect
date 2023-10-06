import axios from "axios"
import ApiResult, { IApiResult } from '@blockspaces/shared/models/ApiResult'
import { RevokeTokenDto } from "@blockspaces/shared/dtos/quickbooks"
import { getApiUrl } from "src/platform/utils";
import {
  CustomerCreateQuickbooksRequestDto,
  CustomerQuickbooksDto,
  CustomerListQuickbooksDto,
  CreateQuickBooksInvoice,
  CreateQuickBooksInvoiceResponseDto,
  PaymentQuickBooksDto,
  AccountCreateQuickbooksRequestDto,
  AccountQuickbooksDto,
  AccountListQuickbooksDto,
  PurchaseQuickbooksDto
} from "@blockspaces/shared/dtos/lightning"
import { SaveCustomerRequestDto } from "@blockspaces/shared/dtos/lightning/quickbooks-customer";
import { IUser } from "@blockspaces/shared/models/users";
import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { CreatePurchaseDto } from "@blockspaces/shared/dtos/lightning/quickbooks-account";
import { Any } from "@react-spring/types";
import { ErpObject } from "../../../../../../shared/models/erp-integration/ErpObjects";

export async function listQuickbooksAccounts(accountType: string): Promise<AccountListQuickbooksDto[]> {
  const result = await axios.get<IApiResult<Any>>(getApiUrl(`/quickbooks/accounts/${accountType}`))
  return result.data.data as any
}

export async function createPurchase(body: CreatePurchaseDto): Promise<PurchaseQuickbooksDto> {
  const result = await axios.post<CreatePurchaseDto, IApiResult<PurchaseQuickbooksDto>>(getApiUrl("/quickbooks/purchase"), body)
  return result.data as any
}

export async function checkQuickBooksIntegration(tenantId: string): Promise<boolean> {
  const result = await axios.get<IApiResult<boolean>>(getApiUrl("quickbooks/status"), { params: { tenantId: tenantId } })
  return result.data.data
}

export async function storeQuickBooksCredentials(url: string, realmId: string, state: string): Promise<any> {
  const body = { url, realmId, state }
  const { data: result } = await axios.post<ApiResult>(
    getApiUrl("quickbooks/store-credentials"),
    body
  )
  return result.data.data
}

export async function createQuickBooksBillingAccount(body: AccountCreateQuickbooksRequestDto): Promise<AccountQuickbooksDto> {
  const result = await axios.post<IApiResult<AccountQuickbooksDto>>(getApiUrl("/quickbooks/account"), body)
  return result.data.data
}

export async function listQuickbooksCustomers(): Promise<CustomerListQuickbooksDto[]> {
  const result = await axios.get<IApiResult<CustomerListQuickbooksDto[]>>(getApiUrl(`/quickbooks/customers`))
  return result.data.data
}

export async function saveCustomerId(body: SaveCustomerRequestDto): Promise<IUser> {
  const result = await axios.post<IApiResult<IUser>>(getApiUrl("/quickbooks/save-customer"), body)
  return result.data.data
}

export async function createQuickbooksCustomer(body: CustomerCreateQuickbooksRequestDto): Promise<CustomerQuickbooksDto> {
  const result = await axios.post<IApiResult<any>>(getApiUrl("/quickbooks/create-customer"), body)
  return result.data.data
}

export async function createQuickBooksInvoice(body: CreateQuickBooksInvoice): Promise<CreateQuickBooksInvoiceResponseDto> {
  // gets qbo metadata
  // creates Bip invoice with metadata
  // grabs QBO invoice (line items, invoice object)
  const result = await axios.post<IApiResult<CreateQuickBooksInvoiceResponseDto>>(getApiUrl("/quickbooks/invoice"), body)
  return result.data.data
}

export async function makeQuickBooksUnappliedPayment(body: PaymentQuickBooksDto): Promise<any> {
  const result = await axios.post<IApiResult<any>>(getApiUrl("/quickbooks/payment"), body)
  return result.data.data
}

export async function makeQuickBooksPayment(body: PaymentQuickBooksDto): Promise<any> {
  const result = await axios.post<IApiResult<any>>(getApiUrl("/quickbooks/invoice/payment"), body)
  return result.data.data
}

export async function getQuickBooksInvoice(tenantId: string, invoiceId: string): Promise<QuickBooksInvoiceSummary> {
  const result = await axios.get<IApiResult<QuickBooksInvoiceSummary>>(getApiUrl("/quickbooks/invoice"), { params: { tenantId: tenantId, invoiceId: invoiceId } })
  return result.data.data
}

export async function getQuickbooksCustomer(customerId: string): Promise<CustomerQuickbooksDto> {
  const result = await axios.post<IApiResult<any>>(getApiUrl(`/quickbooks/customer/${customerId}`))
  return result.data.data
}

export async function createQuickbooksAccount(body: AccountCreateQuickbooksRequestDto): Promise<AccountQuickbooksDto> {
  const result = await axios.post<IApiResult<AccountQuickbooksDto>>(getApiUrl("/quickbooks/account"), body)
  return result.data.data
}

export async function getQuickBooksBillingAccountList(type: string): Promise<AccountListQuickbooksDto[]> {
  const result = await axios.get<IApiResult<AccountListQuickbooksDto[]>>(getApiUrl(`/quickbooks/accounts/${type}`))
  return result.data.data
}

export async function refreshToken(): Promise<any> {
  const result = await axios.get<IApiResult<any>>(getApiUrl("quickbooks/refresh"))
  return result.data.data
}

export async function revokeToken(body: RevokeTokenDto): Promise<ApiResult<any>> {
  const result = await axios.post<IApiResult<any>>(getApiUrl("/quickbooks/revoke"), body)
  return result.data.data
}

export async function getErpInvoice(tenantId: string, invoiceId: string, domain: string): Promise<any> {
  const result = await axios.get<IApiResult<ErpObject>>(getApiUrl(`/erp/invoice/${tenantId}/${domain}/${invoiceId}`))
  return result.data.data
}

export async function cyclrEnabledForUser(tenantId: string): Promise<boolean> {
  const result = await axios.get<IApiResult<boolean>>(getApiUrl(`/cyclr/enabled`), { params: { tenantId: tenantId }})
  return result.data.data
}

