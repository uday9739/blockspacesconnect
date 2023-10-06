// import axios from "axios"
// import ApiResult, { IApiResult } from '@blockspaces/shared/models/ApiResult'
// import { RevokeTokenDto } from "@blockspaces/shared/dtos/quickbooks"
// import { getApiUrl } from "src/platform/utils"
// import { BaseHttpTransport } from "src/platform/api";
// import {
//   CustomerCreateQuickbooksRequestDto,
//   CustomerQuickbooksDto,
//   CustomerListQuickbooksDto,
//   CreateQuickBooksInvoice,
//   CreateQuickBooksInvoiceResponseDto,
//   PaymentQuickBooksDto,
//   AccountCreateQuickbooksRequestDto,
//   AccountQuickbooksDto,
//   AccountListQuickbooksDto,
//   PurchaseQuickbooksDto
// } from "@blockspaces/shared/dtos/lightning"
// import { HttpStatus } from "@blockspaces/shared/types/http";
// import { SaveCustomerRequestDto } from "@blockspaces/shared/dtos/lightning/quickbooks-customer";
// import { IUser } from "@blockspaces/shared/models/users";
// import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
// import { isErrorStatus } from "@blockspaces/shared/helpers/http";
// import { CreatePurchaseDto } from "@blockspaces/shared/dtos/lightning/quickbooks-account";

// export class IntegrationTransport extends BaseHttpTransport {
//   static readonly instance: IntegrationTransport = new IntegrationTransport();

//   getAuthUrl(): string {
//     return getApiUrl("quickbooks/auth-uri")
//   }

//   async refreshToken(): Promise<ApiResult<any>> {
//     const result = await this.httpService.get<IApiResult<any>>(getApiUrl("quickbooks/refresh"))
//     return ApiResult.fromJson(result.data)
//   }

//   async revokeToken(body: RevokeTokenDto): Promise<ApiResult<any>> {
//     const result = await this.httpService.post<IApiResult<any>>(getApiUrl("/quickbooks/revoke"), body)
//     return ApiResult.fromJson(result.data)
//   }

//   storeQuickBooksCredentials = async (url: string, realmId: string, state: string) => {
//     const body = { url, realmId, state }
//     const { data: result } = await axios.post<ApiResult>(
//       getApiUrl("quickbooks/store-credentials"),
//       body
//     )
//     return result.data
//   }

//   async createQuickBooksInvoice(body: CreateQuickBooksInvoice): Promise<ApiResult<CreateQuickBooksInvoiceResponseDto>> {
//     const result = await this.httpService.post<IApiResult<CreateQuickBooksInvoiceResponseDto>>(getApiUrl("/quickbooks/invoice"), body)
//     return ApiResult.fromJson(result.data)
//   }

//   async getQuickBooksInvoice(tenantId:string, invoiceId:string): Promise<ApiResult<QuickBooksInvoiceSummary>> {
//     console.log("tenant", tenantId)
//     const result = await this.httpService.get<IApiResult<QuickBooksInvoiceSummary>>(getApiUrl("/quickbooks/invoice"), {params: {tenantId: tenantId, invoiceId: invoiceId}})
//     return ApiResult.fromJson(result.data)
//   }

//   async makeQuickBooksPayment(body: PaymentQuickBooksDto): Promise<ApiResult<any>> {
//     const result = await this.httpService.post<IApiResult<any>>(getApiUrl("/quickbooks/invoice/payment"), body)
//     return ApiResult.fromJson(result.data)
//   }

//   async makeQuickBooksUnappliedPayment(body: PaymentQuickBooksDto): Promise<ApiResult<any>> {
//     const result = await this.httpService.post<IApiResult<any>>(getApiUrl("/quickbooks/payment"), body)
//     return ApiResult.fromJson(result.data)
//   }

//   async createQuickbooksCustomer(body: CustomerCreateQuickbooksRequestDto): Promise<ApiResult<CustomerQuickbooksDto>> {
//     const result = await this.httpService.post<IApiResult<any>>(getApiUrl("/quickbooks/create-customer"), body, { validErrorStatuses: [HttpStatus.BAD_REQUEST] })
//     return ApiResult.fromJson(result.data)
//   }

//   async saveCustomerId(body: SaveCustomerRequestDto): Promise<ApiResult<IUser>> {
//     const result = await this.httpService.post<IApiResult<IUser>>(getApiUrl("/quickbooks/save-customer"), body)
//     return ApiResult.fromJson(result.data)
//   }

//   async getQuickbooksCustomer(customerId: string): Promise<ApiResult<CustomerQuickbooksDto>> {
//     const result = await this.httpService.post<IApiResult<any>>(getApiUrl(`/quickbooks/customer/${customerId}`))
//     return ApiResult.fromJson(result.data)
//   }

//   async listQuickbooksCustomers(): Promise<ApiResult<CustomerListQuickbooksDto[]>> {
//     const result = await this.httpService.get<IApiResult<CustomerListQuickbooksDto[]>>(getApiUrl(`/quickbooks/customers`))
//     return ApiResult.fromJson(result.data)
//   }
//   async createQuickbooksAccount(body: AccountCreateQuickbooksRequestDto): Promise<ApiResult<AccountQuickbooksDto>> {
//     const result = await this.httpService.post<IApiResult<AccountQuickbooksDto>>(getApiUrl("/quickbooks/account"), body, { validErrorStatuses: [HttpStatus.BAD_REQUEST] })
//     return ApiResult.fromJson(result.data)
//   }
//   async createPurchase(body: CreatePurchaseDto): Promise<ApiResult<PurchaseQuickbooksDto>> {
//     const result = await this.httpService.post<IApiResult<PurchaseQuickbooksDto>>(getApiUrl("/quickbooks/purchase"), body)
//     return ApiResult.fromJson(result.data)
//   }
//   async listQuickbooksAccounts(accountType: string): Promise<ApiResult<AccountListQuickbooksDto[]>> {
//     const result = await this.httpService.get<IApiResult<any>>(getApiUrl(`/quickbooks/accounts/${accountType}`))
//     return ApiResult.fromJson(result.data)
//   }

//   async checkQuickBooksIntegration(tenantId:string): Promise<ApiResult<boolean>> {
//     const result = await this.httpService.get<IApiResult<boolean>>(getApiUrl("quickbooks/status"), {params: {tenantId: tenantId}})
//     return ApiResult.fromJson(result.data)
//   }

//   async createQuickBooksBillingAccount(body: AccountCreateQuickbooksRequestDto): Promise<ApiResult<AccountQuickbooksDto>> {
//     const result = await this.httpService.post<IApiResult<AccountQuickbooksDto>>(getApiUrl("/quickbooks/account"), body, {validErrorStatuses: [HttpStatus.BAD_REQUEST]})
//     if (isErrorStatus(result.status)) return null
//     return ApiResult.fromJson(result.data)
//   }

//   async getQuickBooksBillingAccountList(type: string): Promise<ApiResult<AccountListQuickbooksDto[]>> {
//     const result = await this.httpService.get<IApiResult<AccountListQuickbooksDto[]>>(getApiUrl(`/quickbooks/accounts/${type}`))
//     return ApiResult.fromJson(result.data)
//   }
// }
