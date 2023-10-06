import { CustomerCreateQuickbooksRequestDto, CustomerListQuickbooksDto, CustomerQuickbooksDto } from "@blockspaces/shared/dtos/lightning";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { IUser } from "@blockspaces/shared/models/users";
import { BadRequestException, Inject, Injectable, PreconditionFailedException } from "@nestjs/common";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import { SecretService } from "../../secrets/services/SecretService";
import { UserDataService } from "../../users/services/UserDataService";
import { QuickbooksClient } from "../clients/QuickbooksClient";
import { QuickbooksCustomerUpdateRequest, QuickbooksOAuthClientToken } from "../types/QuickbooksTypes";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";

/** This service handles all the Quickbooks Customer operations. */
@Injectable()
export class QuickbooksCustomerService {
  private httpTimeout: number = 1000 * 5;
  constructor(
    private readonly httpService: HttpService,
    private readonly qbClient: QuickbooksClient,
    private readonly userDataService: UserDataService,
    private readonly secretService: SecretService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
  ) { }

  /**
   * Creates a new billing customer in quickbooks.
   *
   * @param user {@link IUser}
   * @param data {@link CustomerCreateQuickbooksRequestDto}
   * @returns Promise of {@link CustomerQuickbooksDto}
   */
  createCustomer = async (data: CustomerCreateQuickbooksRequestDto, user?: IUser): Promise<CustomerQuickbooksDto> => {
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
        url: `/v3/company/${qboToken.realmId}/customer`,
        timeout: this.httpTimeout,
        method: "POST",
        headers: {
          Authorization: `Bearer ${qboToken.access_token}`
        },
        data: data
      });
    } catch (error) {
      throw new BadRequestException("Customer could not be created.", {cause: error});
    }
    const results: CustomerQuickbooksDto = _axiosResponse.data;
    // SAVE CUSTOMER Id TO USERDETAILS
    if (user) { await this.saveCustomerId(user.id, results.Customer.Id); }

    return results; 
  };

  /**
   * Store a QuickBooks customer id in the user details
   *
   * @param userId The callers user id
   * @param customerId The customer in QuickBooks to store in the user details object.
   * @returns
   */
  saveCustomerId = async (userId: string, customerId: string): Promise<IUser> => {
    const updateCustomerId: BscStatusResponse = await this.userDataService.updateQboCustomerId(userId, customerId);
    if (updateCustomerId.status === ApiResultStatus.Failed) {
      throw new PreconditionFailedException(updateCustomerId.data);
    }
    return updateCustomerId.data;
  };

  /**
   * Get the customer details from Quickbooks.
   *
   * @param user {@link IUser}
   * @param customerId {@link string} Quickbooks Customer
   * @returns Promise of {@link CustomerQuickbooksDto}
   */
  getCustomer = async (user: IUser, customerId: string): Promise<CustomerQuickbooksDto> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Customer Where id = '${customerId}'` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Customer: ${customerId} was NOT found.`);
    }
    return <CustomerQuickbooksDto>_axiosResponse.data.QueryResponse.Customer;
  };


  getCustomerByEmailAddress = async (email: string, user: IUser = null): Promise<Array<CustomerQuickbooksDto>> => {
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
        url: `/v3/company/${qboToken.realmId}/query`,
        params: { query: `select * from Customer Where PrimaryEmailAddr = '${email}'` },
        timeout: this.httpTimeout,
        method: "GET",
        headers: {
          Authorization: `Bearer ${qboToken.access_token}`
        }
      });
    } catch (error) {
      throw new BadRequestException("Error looking for user by email");
    }
    if (_axiosResponse?.data?.QueryResponse?.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Customer:email${email} was NOT found.`);
    }
    return <Array<CustomerQuickbooksDto>>_axiosResponse?.data?.QueryResponse?.Customer?.map(x => ({ Customer: x } as CustomerQuickbooksDto));
  };

  /**
   * Get a list of all customers from Quickbooks
   *
   * @param user {@link IUser}
   * @returns Promise of {@link CustomerListQuickbooksDto} Array
   */
  listCustomer = async (user: IUser): Promise<CustomerListQuickbooksDto[]> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/query`,
      params: { query: `select * from Customer` },
      timeout: this.httpTimeout,
      method: "GET",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      }
    });
    if (_axiosResponse.data.QueryResponse.fault) {
      // Throw custom error to caller to let them know what invoice was not found.
      throw new BadRequestException(_axiosResponse, `Customer: No Customers Found.`);
    }
    const result: Array<CustomerListQuickbooksDto> = [];
    const response = _axiosResponse.data.QueryResponse.Customer;
    response.forEach((element: { Id: any; GivenName: any; }) => {
      result.push({
        id: element.Id,
        givenName: element.GivenName || "Customer"
      });
    });
    return result;
  };


  /**
   * Updates a Quickbooks Customer
   *
   * @param user {@link IUser}
   * @param data {@link quickbooksCustomerUpdateRequest}
   * @returns Promise of {@link CustomerQuickbooksDto}
   */
  updateCustomer = async (user: IUser, data: QuickbooksCustomerUpdateRequest): Promise<CustomerQuickbooksDto> => {
    const userSecret: ICredentialReference = await this.secretService.getByLabel(user.activeTenant?.tenantId, "QuickBooks");
    const qboToken: QuickbooksOAuthClientToken = await this.qbClient.getOAuthClientToken(userSecret.credentialId, user.activeTenant?.tenantId, user.accessToken);
    const _axiosResponse: HttpResponse = await this.httpService.request({
      baseURL: this.qbClient.qboAccountingUrl,
      url: `/v3/company/${qboToken.realmId}/customer`,
      timeout: this.httpTimeout,
      method: "POST",
      headers: {
        Authorization: `Bearer ${qboToken.access_token}`
      },
      data: data
    });
    if (_axiosResponse.data.response.fault) {
      throw new BadRequestException(_axiosResponse);
    }
    return <CustomerQuickbooksDto>_axiosResponse.data.Customer;
  };
};