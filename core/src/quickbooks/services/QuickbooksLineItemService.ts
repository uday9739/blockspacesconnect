import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { CreateItem, CreateItemResponse, QuickbooksInvoicingLineItem, QuickbooksLineItemResponse, QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";

/** This service handles all the Quickbooks Line Item operations. */
@Injectable()
export class QuickbooksLineItemService {
  private httpTimeout: number = 1000 * 5;
  constructor(private readonly httpService: HttpService, private readonly qbClient: QuickbooksClient) { }

  async getLineItemsBySku(qbLineItemSkus: Array<string>): Promise<QuickbooksLineItemResponse> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
    const formattedQboItemsSkus = `(${qbLineItemSkus.map(v => `'${v}'`).join(',')})`;
    const queryStr = `select * from Item Where Sku in ${formattedQboItemsSkus}`;
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: queryStr, minorversion: 45 },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (!_axiosResponse.data.QueryResponse || !_axiosResponse.data.QueryResponse.maxResults || _axiosResponse.data.QueryResponse.maxResults < 1) {
      throw new NotFoundException(_axiosResponse?.data, `Quickbooks Line Items: No Items found with SKUs ${qbLineItemSkus.toString()}`);
    }
    return <QuickbooksLineItemResponse>_axiosResponse.data.QueryResponse;
  }

  async getLineItemsByName(names: Array<string>): Promise<QuickbooksLineItemResponse> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
    const formattedQboItemsSkus = `(${names.map(v => `'${v}'`).join(',')})`;
    const queryStr = `select * from Item Where Name in ${formattedQboItemsSkus}`;
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: queryStr, minorversion: 45 },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.response?.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickbooksLineItemResponse>_axiosResponse.data.QueryResponse;
  }

  async createLineItem(data: CreateItem): Promise<CreateItem> {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();

    const _axiosResponse: HttpResponse = await this.httpService.request<CreateItemResponse>({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/item`,
      params: { minorversion: 45 },
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
    return <CreateItem>_axiosResponse.data?.Item;
  }



}