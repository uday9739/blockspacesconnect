import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import {
  QuickbooksCreateInvoice,
  QuickbooksInvoice,
  QuickbooksOAuthClientToken,
  QuickbooksInvoiceStatus,
  QuickbooksStatus,
  QuickBooksPayment,
  QuickBooksPaymentSummary
} from "../types/QuickbooksTypes";

/** This service handles all the Quickbooks Invoicing operations. */
@Injectable()
export class QuickbooksInvoiceService {
  private httpTimeout: number = 1000 * 5;
  constructor(private readonly httpService: HttpService, private readonly qbClient: QuickbooksClient) { }

  /**
   * https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice#create-an-invoice
   *
   * Create a new invoice
   *
   * @param data {@link quickbooksCreateInvoice}
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns New {@link quickbooksInvoice}
   */
  async createInvoice(data: QuickbooksCreateInvoice, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickbooksInvoice> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/invoice`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      },
      data: data
    });
    if (!_axiosResponse.data.Invoice) {
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickbooksInvoice>_axiosResponse.data.Invoice;
  }

  /**
   * https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice#query-an-invoice
   *
   * Get a list of invoiced for the given customer Id.
   *
   * @param customerId - {@link string} QBO ID for customer in question.
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns Array of {@link QuickBooksInvoiceSummary}
   */
  async getCustomersInvoices(customerId: string, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickBooksInvoiceSummary[]> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request<QuickBooksInvoiceSummary[]>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Invoice Where CustomerRef = '${customerId}'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (!_axiosResponse.data.QueryResponse) {
      throw new NotFoundException(_axiosResponse, `Invoice: Customer ${customerId} invoices were not found.`);
    } else if (_axiosResponse.data.response.Fault) {
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickBooksInvoiceSummary[]>_axiosResponse.data.QueryResponse.Invoice;
  }

  /**
   * https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice#query-an-invoice
   *
   * gets a requested Quickbooks Invoice based on a provided Invoice Id
   *
   * @param  invoiceId {@link string} the Invoice ID
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns Promise of an {@link quickbooksInvoice}
   */
  async getInvoice(invoiceId: string, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickBooksInvoiceSummary> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request<QuickBooksInvoiceSummary[]>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      timeout: this.httpTimeout,
      params: { query: `select * from Invoice where docnumber = '${invoiceId}'` },
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (!_axiosResponse.data.QueryResponse) {
      throw new NotFoundException(_axiosResponse, `Invoice: ${invoiceId} was not found.`);
    } else if (_axiosResponse.data.QueryResponse.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    const invoices: QuickBooksInvoiceSummary[] = _axiosResponse.data.QueryResponse.Invoice
    const correspondingInvoiceWithId = invoices.find(invoice => invoice.DocNumber === invoiceId)
    return <QuickBooksInvoiceSummary>correspondingInvoiceWithId;
  }

  /**
   * https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice#read-an-invoice
   *
   * The current status of an invoice.
   *
   * @param  invoiceId {@link string} the Invoice ID
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns Invoice status {@link quickbooksInvoiceStatus}
   */
  async getInvoiceStatus(invoiceId: string, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickbooksInvoiceStatus> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/invoice/${invoiceId}`,
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (!_axiosResponse.data.QueryResponse) {
      throw new NotFoundException(_axiosResponse, `Invoice: ${invoiceId} was not found.`);
    } else if (_axiosResponse.data.QueryResponse.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    const response: QuickbooksInvoiceStatus = {
      balance: _axiosResponse.data.QueryResponse.Invoice.Balance,
      dueDate: new Date(_axiosResponse.data.QueryResponse.Invoice.DueDate),
      status: QuickbooksStatus.OPEN
    };
    const date = new Date();
    if (response.balance > 0 && response.dueDate < date) {
      response.status = QuickbooksStatus.PASTDUE;
    } else if (response.balance === 0) {
      response.status = QuickbooksStatus.PAID;
    }
    return <QuickbooksInvoiceStatus>response;
  }

  /**
   *
   * Pay an Invoice
   *
   * @param data {@link quickBooksPayment}
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns Promise of {@link quickBooksPaymentSummary}
   */
  async payInvoice(data: QuickBooksPayment, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickBooksPaymentSummary> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request<QuickBooksPaymentSummary>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/payment`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      },
      data: data
    });
    if (_axiosResponse.data.response?.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickBooksPaymentSummary>_axiosResponse.data.Payment;
  }

  /**
   *
   * Unapplied Invoice Payment
   *
   * @param data {@link Object}
   * @param secretId {@link string} if not supplied then assume Blockspace internal
   * @param tenantId {@link string} if not supplied then assume Blockspace internal
   * @param accessToken {@link string} if not supplied then assume Blockspace internal
   * @returns Promise of {@link quickBooksPaymentSummary}
   */
  async makeUnappliedPayment(data: { Description: string; Line: any[]; CustomerRef: { value: string; }; TotalAmt: number; DepositToAccountRef: { value: string } }, secretId?: string, tenantId?: string, accessToken?: string): Promise<QuickBooksPaymentSummary> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(secretId, tenantId, accessToken);
    let _axiosResponse: HttpResponse = await this.httpService.request<QuickBooksPaymentSummary>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/salesreceipt`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      },
      data: {
        Line: [{
          Description: data.Description,
          Amount: data.TotalAmt,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            Qty: 1,
            UnitPrice: data.TotalAmt
          }
        }
        ]
      }
    });
    if (_axiosResponse.data.response?.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    _axiosResponse = await this.httpService.request<QuickBooksPaymentSummary>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/salesreceipt`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      },
      data: {
        sparse: true,
        Id: _axiosResponse?.data?.SalesReceipt?.Id,
        SyncToken: _axiosResponse?.data?.SalesReceipt?.SyncToken,
        DepositToAccountRef: data.DepositToAccountRef,
        CustomerRef: data.CustomerRef
      }
    });
    if (_axiosResponse.data.response?.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickBooksPaymentSummary>_axiosResponse.data.SalesReceipt;
  }
}
