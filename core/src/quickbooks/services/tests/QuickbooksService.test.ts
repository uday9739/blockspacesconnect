import { beforeAll, expect, describe, it } from "@jest/globals";
import { QuickbooksService } from "../QuickbooksService";
import { QuickbooksClient } from "../../clients/QuickbooksClient";
import {
  QuickbooksChargesResult,
  QuickbooksCompanyInfo,
  QuickbooksOAuthClientToken,
  QuickbooksUserInfoResults
} from "../../types/QuickbooksTypes";
import { createMock } from "ts-auto-mock";
import { SecretService } from "../../../secrets/services/SecretService";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";

describe("Get data from QuickbooksService.", () => {
  let _quickbooksService: QuickbooksService;
  let mockServices: {
    qbClient: QuickbooksClient;
    secretService: SecretService;
    db: ConnectDbDataContext;

  };
  // let mockRequests: {
  // };
  let mockResponses: {
    getCharges: QuickbooksChargesResult[];
    getCompanyInfo: QuickbooksCompanyInfo;
    getUserInfo: QuickbooksUserInfoResults;
    authorizeUri: String;
    oAuthClientToken: QuickbooksOAuthClientToken;
  };

  beforeAll(async () => {
    // mockRequests = {
    // };
    mockResponses = {
      getCharges: createMock<QuickbooksChargesResult[]>(),
      getCompanyInfo: createMock<QuickbooksCompanyInfo>(),
      getUserInfo: createMock<QuickbooksUserInfoResults>(),
      authorizeUri: "authorizeUri",
      oAuthClientToken: createMock<QuickbooksOAuthClientToken>(),
    };
    mockServices = {
      qbClient: createMock<QuickbooksClient>({
        getOAuthClientToken(): Promise<QuickbooksOAuthClientToken> {
          return Promise.resolve(mockResponses.oAuthClientToken);
        },
        authorizeUri(): Promise<string> {
          return Promise.resolve(mockResponses.authorizeUri.toString());
        },
      }),
      secretService: createMock<SecretService>(),
      db: createMock<ConnectDbDataContext>(),
    };

    _quickbooksService = new QuickbooksService(mockServices.qbClient, mockServices.secretService, mockServices.db);
  });

  it(`${QuickbooksService.name} should be defined`, () => {
    expect(_quickbooksService).toBeDefined();
  });

  it(`${QuickbooksService.name} should get authorizeUri`, async () => {
    const response: string = await _quickbooksService.authorizeUri("some-tenant-id");
    expect(response).toBe(mockResponses.authorizeUri);
  }, 10000);








  // it(`${QuickbooksService.name} should get User Info`, async () => {
  //   mockServices.httpService.request = async () => <AxiosResponse>{ status: HttpStatus.OK, data: mockResponses.getUserInfo };
  //   const response: quickbooksUserInfoResults = await _quickbooksService.getUserInfo();
  //   expect(response).toBeDefined();
  // }, 10000);

  // it(`${QuickbooksService.name} should get Company Info`, async () => {
  //   mockServices.httpService.request = async () => <AxiosResponse>{ status: HttpStatus.OK, data: mockResponses.getCompanyInfo };
  //   const response: quickbooksCompanyInfo = await _quickbooksService.getCompanyInfo();
  //   expect(response).toBeDefined();
  // }, 10000);

  // it(`${QuickbooksService.name} should get charges`, async () => {
  //   mockServices.httpService.request = async () => <AxiosResponse>{ status: HttpStatus.OK, data: mockResponses.getCharges };
  //   const response: quickbooksChargesResult[] = await _quickbooksService.getCharges();
  //   expect(response).toBeDefined();
  // }, 10000);
});
