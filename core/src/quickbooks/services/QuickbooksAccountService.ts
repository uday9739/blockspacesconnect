import { AccountCreateQuickbooksRequestDto, AccountListQuickbooksDto, AccountQuickbooksDto } from "@blockspaces/shared/dtos/lightning";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { IUser } from "@blockspaces/shared/models/users";
import { BadRequestException, Inject, Injectable, PreconditionFailedException } from "@nestjs/common";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import { SecretService } from "../../secrets/services/SecretService";
import { UserDataService } from "../../users/services/UserDataService";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";

/** This service handles all the Quickbooks Customer operations. */
@Injectable()
export class QuickbooksAccountService {
  private httpTimeout: number = 1000 * 5;
  constructor(
    private readonly httpService: HttpService,
    private readonly qbClient: QuickbooksClient,
    private readonly userDataService: UserDataService,
    private readonly secretService: SecretService
  ) {}

  /**
   * Creates a new billing customer in quickbooks.
   *
   * @param user {@link IUser}
   * @param data {@link AcccountCreateQuickbooksRequestDto}
   * @returns Promise of {@link AccountQuickbooksDto}
   */
  createAccount = async (data: AccountCreateQuickbooksRequestDto, user?: IUser): Promise<AccountQuickbooksDto> => {
    let qboToken: QuickbooksOAuthClientToken;
    if (user) {
      const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
      qboToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    } else {
      qboToken = await this.qbClient.getOAuthClientToken();
    }
    let _axiosResponse: HttpResponse;
    try {
      _axiosResponse = await this.httpService.request({
        baseURL: this.qbClient.qboAccountingUrl,
        url: `/v3/company/${qboToken.realmId}/account`,
        timeout: this.httpTimeout,
        method: "POST",
        headers: {
          Authorization: `Bearer ${qboToken.access_token}`
        },
        data: data
      });

      const results = _axiosResponse.data;
      // SAVE Account Id TO USERDETAILS
      if (user) {
        await this.saveAccountId(user.id, results.Account.Id);
      }
      return results;
    } catch (error) {
      const existingAccounts = await this.listAssetAccounts(user);
      const account = existingAccounts.filter((account) => account.name === "Bitcoin Invoicing & Payments");
      await this.saveAccountId(user.id, account[0].id);
      const fullAccount = await this.getAccount(user, account[0].id);
      if (!fullAccount) throw new BadRequestException("Could not create or find a Bitcoin Invoicing & Payments account.");
      return fullAccount;
    }
  };

  /**
   * Store a QuickBooks customer id in the user details
   *
   * @param userId The callers user id
   * @param customerId The customer in QuickBooks to store in the user details object.
   * @returns
   */
  saveAccountId = async (userId: string, accountId: string): Promise<IUser> => {
    const updateAccountId: BscStatusResponse = await this.userDataService.updateQboAccountId(userId, accountId);
    if (updateAccountId.status === ApiResultStatus.Failed) {
      throw new PreconditionFailedException(updateAccountId.data);
    }
    return updateAccountId.data;
  };

  /**
   * Get the customer details from Quickbooks.
   *
   * @param user {@link IUser}
   * @param accountId {@link string} Quickbooks Customer
   * @returns Promise of {@link AccountQuickbooksDto}
   */
  getAccount = async (user: IUser, accountId: string): Promise<AccountQuickbooksDto> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Account Where Id = '${accountId}'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Account: ${accountId} was NOT found.`);
    }
    return <AccountQuickbooksDto>_axiosResponse.data.QueryResponse.Account[0];
  };

  /**
   * Get the list of expense accounts for the user's QuickBooks
   *
   * @param user {@link IUser}
   * @returns Promise of {@link AccountListQuickbooksDto}
   */
  listAssetAccounts = async (user: IUser): Promise<AccountListQuickbooksDto[]> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    try {
      const _axiosResponse: HttpResponse = await this.httpService.request({
        baseURL: this.qbClient.qboAccountingUrl,
        url: `/v3/company/${qboToken.realmId}/query`,
        params: { query: `select * from Account where Classification='Asset'` },
        timeout: this.httpTimeout,
        method: "GET",
        headers: {
          Authorization: `Bearer ${qboToken.access_token}`
        }
      });
      if (_axiosResponse.data.QueryResponse.fault) {
        // Throw custom error to caller to let them know what invoice was not found.
        throw new BadRequestException(_axiosResponse, `Account: No Accounts Found.`);
      }
      const result: Array<AccountListQuickbooksDto> = [];
      const response = _axiosResponse.data.QueryResponse.Account;
      response.forEach((element: { Id: string; FullyQualifiedName: string }) => {
        result.push({
          id: element.Id,
          name: element.FullyQualifiedName || `Account ${element.Id}`
        });
      });
      return result;
    } catch (e) {
      console.log("Error getting asset accounts", e.response.data.Fault);
    }
  };
  /**
   * Get a list of all Bank Accounts from Quickbooks
   *
   * @param user {@link IUser}
   * @returns Promise of {@link AccountListQuickbooksDto} Array
   */
  listBankAccounts = async (user: IUser): Promise<AccountListQuickbooksDto[]> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Account where Classification='Bank'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Account: No Accounts Found.`);
    }
    const result: Array<AccountListQuickbooksDto> = [];
    const response = _axiosResponse.data.QueryResponse.Account;
    response.forEach((element: { Id: string; FullyQualifiedName: string }) => {
      result.push({
        id: element.Id,
        name: element.FullyQualifiedName || `Account ${element.Id}`
      });
    });
    return result;
  };

  /**
   * Get a list of all Expense Accounts from Quickbooks
   *
   * @param user {@link IUser}
   * @returns Promise of {@link AccountListQuickbooksDto} Array
   */
  listExpenseAccounts = async (user: IUser): Promise<AccountListQuickbooksDto[]> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Account where AccountType='Expense'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Account: No Accounts Found.`);
    }
    const result: Array<AccountListQuickbooksDto> = [];
    const response = _axiosResponse.data.QueryResponse.Account;
    response.forEach((element: { Id: string; FullyQualifiedName: string }) => {
      result.push({
        id: element.Id,
        name: element.FullyQualifiedName || `Account ${element.Id}`
      });
    });
    return result;
  };

  /**
   * Get a list of all Expense Accounts from Quickbooks
   *
   * @param user {@link IUser}
   * @returns Promise of {@link AccountListQuickbooksDto} Array
   */
  listRevenueAccounts = async (user: IUser): Promise<AccountListQuickbooksDto[]> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Account where AccountType='Revenue'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Account: No Accounts Found.`);
    }
    const result: Array<AccountListQuickbooksDto> = [];
    const response = _axiosResponse.data.QueryResponse.Account;
    response.forEach((element: { Id: string; FullyQualifiedName: string }) => {
      result.push({
        id: element.Id,
        name: element.FullyQualifiedName || `Account ${element.Id}`
      });
    });
    return result;
  };
};