import { PurchaseQuickbooksDto } from "@blockspaces/shared/dtos/lightning";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { QuickbooksOAuthClientToken, QuickbooksCreatePurchase } from "../types/QuickbooksTypes";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { SecretService } from "../../secrets/services/SecretService";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

/** This service handles all the Quickbooks Invoicing operations. */
@Injectable()
export class QuickbooksPurchaseService {
  private httpTimeout: number = 1000 * 5;
  constructor(private readonly httpService: HttpService, private readonly qbClient: QuickbooksClient, private readonly secretService: SecretService, private readonly db: ConnectDbDataContext) {}

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
  async createPurchase(data: QuickbooksCreatePurchase, secretId?: string, tenantId?: string, accessToken?: string): Promise<PurchaseQuickbooksDto> {
    try {
      const userSecret: ICredentialReference = await this.secretService.getByLabel(tenantId, "QuickBooks");
      const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, tenantId, accessToken);
      const _axiosResponse: HttpResponse = await this.httpService.request({
        baseURL: this.qbClient.qboAccountingUrl,
        url: `/v3/company/${qboToken.realmId}/purchase`,
        timeout: this.httpTimeout,
        method: "POST",
        headers: {
          Authorization: `Bearer ${qboToken.access_token}`
        },
        data: data
      });
      if (!_axiosResponse.data.Purchase) {
        throw new BadRequestException(_axiosResponse);
      }
      const purchase: PurchaseQuickbooksDto = _axiosResponse.data;
      return purchase;
    } catch (error) {
      throw error;
    }
  }
}
