import { CustomerCreateQuickbooksRequestDto, CustomerQuickbooksDto } from "@blockspaces/shared/dtos/lightning";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { createMock } from "ts-auto-mock";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { SecretService } from "../../../secrets/services/SecretService";
import { UserDataService } from "../../../users/services/UserDataService";
import { QuickbooksClient } from "../../clients/QuickbooksClient";
import { QuickbooksOAuthClientToken } from "../../types/QuickbooksTypes";
import { QuickbooksCustomerService } from "../QuickbooksCustomerService";
import { IUser } from "@blockspaces/shared/models/users";
import { EnvironmentVariables } from "../../../env";

let mockServices: {
  httpService: HttpService;
  qbClient: QuickbooksClient;
  userDataService: UserDataService;
  secretService: SecretService;
};
let mockRequests: {
  customerId: String;
  customerData: CustomerCreateQuickbooksRequestDto;
  user: IUser;
};
let mockResponses: {
  createCustomer: CustomerQuickbooksDto;
  getCustomer: CustomerQuickbooksDto;
  userDetails: ICredentialReference;
  oAuthClientToken: QuickbooksOAuthClientToken;
};

describe("Get data from QuickbooksService.", () => {
  let _quickbooksCustomerService: QuickbooksCustomerService;
  beforeAll(async () => {
    mockRequests = {
      customerId: createMock<String>(),
      customerData: createMock<CustomerCreateQuickbooksRequestDto>(),
      user: createMock<IUser>()
    };
    mockResponses = {
      createCustomer: createMock<CustomerQuickbooksDto>(),
      getCustomer: createMock<CustomerQuickbooksDto>(),
      userDetails: createMock<ICredentialReference>(),
      oAuthClientToken: createMock<QuickbooksOAuthClientToken>()
    };
    mockServices = {
      httpService: createMock<HttpService>(),
      qbClient: createMock<QuickbooksClient>({
        getOAuthClientToken(): Promise<QuickbooksOAuthClientToken> {
          return Promise.resolve(mockResponses.oAuthClientToken);
        }
      }),
      userDataService: createMock<UserDataService>(),
      secretService: createMock<SecretService>({
        getByLabel(): Promise<ICredentialReference> {
          return Promise.resolve(mockResponses.userDetails);
        }
      })
    };

    _quickbooksCustomerService = new QuickbooksCustomerService(
      mockServices.httpService,
      mockServices.qbClient,
      mockServices.userDataService,
      mockServices.secretService,
      createMock<EnvironmentVariables>()
    );
  });

  it(`${QuickbooksCustomerService.name} should be defined`, () => {
    expect(_quickbooksCustomerService).toBeDefined();
  });

  it(`${QuickbooksCustomerService.name} should get Customer`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          QueryResponse: {
            Customer: mockResponses.getCustomer,
            response: {
              fault: null
            }
          }
        }
      };
    const response: CustomerQuickbooksDto = await _quickbooksCustomerService.getCustomer(mockRequests.user, mockRequests.customerId.toString());
    expect(response).toBeDefined();
  }, 10000);

  it(`${QuickbooksCustomerService.name} should Create Customer`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: mockResponses.createCustomer
      };
    const response: CustomerQuickbooksDto = await _quickbooksCustomerService.createCustomer(mockRequests.customerData, mockRequests.user);
    expect(response).toBeDefined();
  }, 10000);
});
