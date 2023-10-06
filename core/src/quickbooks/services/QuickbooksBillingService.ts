import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { QuickbooksBill, QuickbooksBillCreate, QuickbooksBillUpdate, QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";

/** This service handles all the Quickbooks Billing operations. */
@Injectable()
export class QuickbooksBillingService {
  private httpTimeout: number = 1000 * 5;
  constructor(private readonly httpService: HttpService, private readonly qbClient: QuickbooksClient) {} 

  /**
   * Create a new Quickbooks bill.
   *
   * @param data {@link quickbooksBillCreate}
   * @returns Promise of {@link quickbooksBill}
   */
  create = async (data: QuickbooksBillCreate): Promise<QuickbooksBill> => {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/bill`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`,
      },
      data: data
    });
    if (_axiosResponse.data.response.Fault){
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickbooksBill>_axiosResponse.data.Bill;
  };

  /**
   * Get a Bill from Quickbooks
   *
   * @param billId {@link string} 
   * @returns Promise of {@link quickbooksBill}
   */
  get = async (billId: string): Promise<QuickbooksBill> => {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/bill/${billId}`,
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if(!_axiosResponse.data.QueryResponse){
      throw new  NotFoundException(_axiosResponse, `Bill: ${billId} was not found.`);
    } else if (_axiosResponse.data.QueryResponse.fault){
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickbooksBill>_axiosResponse.data.Bill;
  };

  /**
   * Updated an existing Quickbooks Bill.
   *
   * @param data {@link quickbooksBillUpdate}
   * @returns Promise of an updated {@link quickbooksBill}
   */
  update = async (data: QuickbooksBillUpdate): Promise<QuickbooksBill> => {
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken();
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/bill`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`,
      },
      data: data
    });
    if (_axiosResponse.data.response.Fault){
      throw new BadRequestException(_axiosResponse);
    }
    return <QuickbooksBill>_axiosResponse.data.Bill;
  };
};