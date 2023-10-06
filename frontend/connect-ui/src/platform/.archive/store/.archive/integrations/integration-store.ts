// import { AccountCreateQuickbooksRequestDto, AccountQuickbooksDto, CreateQuickBooksInvoiceResponseDto, CustomerCreateQuickbooksRequestDto } from "@blockspaces/shared/dtos/lightning";
// import { CreatePurchaseDto } from "@blockspaces/shared/dtos/lightning/quickbooks-account";
// import { IntuitOauth2Token } from "@blockspaces/shared/dtos/quickbooks";
// import { isErrorStatus } from "@blockspaces/shared/helpers/http";
// import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
// import { makeAutoObservable, runInAction } from "mobx";
// import { DataStore, IDataStore } from "src/platform/api";
// import { IntegrationTransport } from './integration-transport';


// /**
//  * Contains information about which third-party services a user has connected to
//  * Should probably be refactored to be part of the user store - This is a temporary solution.
//  */
// export class IntegrationStore implements IDataStore {
//   dataStore:DataStore
//   quickBooks:boolean = false

//   constructor(dataStore, private readonly transport: IntegrationTransport = IntegrationTransport.instance) {
//     makeAutoObservable(this);
//     this.dataStore = dataStore;
//   }

//   reset(){
//     this.quickBooks = false;
//   }

//   getAuthUrl(): string {
//     return this.transport.getAuthUrl()
//   }

//   async refreshToken(): Promise<any> {
//     const result = await this.transport.refreshToken()
//     return result.data
//   }

//   async revokeToken(token: IntuitOauth2Token): Promise<any> {
//     const body = {token}
//     const result = await this.transport.revokeToken(body)
//     return result.data
//   }

//   async storeQuickBooksCredentials(url: string, realmId: string, state: string){
//     await this.transport.storeQuickBooksCredentials(url, realmId, state)

//     // Simple boolean flag for UI purposes right now
//     runInAction(() => this.quickBooks = true)
//   }

//   async createQuickBooksInvoice(tenantId:string, invoiceId:string): Promise<CreateQuickBooksInvoiceResponseDto> {
//     const body = {tenantId, invoiceId}
//     const result = await this.transport.createQuickBooksInvoice(body)
//     return result.data
//   }

//   async getQuickBooksInvoice(tenantId:string, invoiceId:string): Promise<QuickBooksInvoiceSummary> {
//     const result = await this.transport.getQuickBooksInvoice(tenantId, invoiceId)
//     return result.data
//   }

//   async makeQuickBooksPayment(tenantId:string, invoiceId:string): Promise<any> {
//     const body = {tenantId, invoiceId}
//     const result = await this.transport.makeQuickBooksPayment(body)
//     return result.data
//   }

//   async makeQuickBooksUnappliedPayment(tenantId: string, invoiceId: string) {
//     const body = {tenantId, invoiceId}
//     const result = await this.transport.makeQuickBooksUnappliedPayment(body)
//     return result.data
//   }

//   async createQuickbooksCustomer(body: CustomerCreateQuickbooksRequestDto) {
//     const result = await this.transport.createQuickbooksCustomer(body)
//     if (isErrorStatus(Number(result.status))) return null
//     runInAction(() => this.quickBooks = true) 
//     return result.data
//   }

//   async saveCustomerId(id:string) {
//     const result = await this.transport.saveCustomerId({id: id})
//     return result.data
//   }

//   async getQuickbooksCustomers(customerId: string) {
//     const result = await this.transport.getQuickbooksCustomer(customerId)
//     return result.data
//   }

//   async listQuickbooksCustomers() {
//     const result = await this.transport.listQuickbooksCustomers()
//     return result.data
//   }

//   async createQuickbooksAccount(body: AccountCreateQuickbooksRequestDto) {
//     const result = await this.transport.createQuickbooksAccount(body);
//     return result.data
//   }

//   async createPurchase(body: CreatePurchaseDto) {
//     const result = await this.transport.createPurchase(body);
//     return result.data
//   }

//   async listQuickbooksAccounts(accountType: string) {
//     const result = await this.transport.listQuickbooksAccounts(accountType);
//     return result.data
//   }

//   async checkQuickBooksIntegration(tenantId:string): Promise<boolean> {
//     const result = await this.transport.checkQuickBooksIntegration(tenantId)
//     runInAction(() => this.quickBooks = result.data)
//     return result.data
//   }

//   async createQuickBooksBillingAccount(Name:string, AccountType:string, Classification:string, AccountSubType:string, FullyQualifiedName?:string): Promise<AccountQuickbooksDto> {
//     const body: AccountCreateQuickbooksRequestDto = {
//       FullyQualifiedName,
//       Name,
//       AccountType,
//       Classification,
//       AccountSubType
//     }
//     const result = await this.transport.createQuickBooksBillingAccount(body)
//     if (!result) return null
//     return result.data
//   }
  
// }
