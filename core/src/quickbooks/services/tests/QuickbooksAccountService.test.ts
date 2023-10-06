import { AccountCreateQuickbooksRequestDto, AccountListQuickbooksDto, AccountQuickbooksDto } from "@blockspaces/shared/dtos/lightning";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { createMock } from "ts-auto-mock";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { SecretService } from "../../../secrets/services/SecretService";
import { UserDataService } from "../../../users/services/UserDataService";
import { QuickbooksClient } from "../../clients/QuickbooksClient";
import { QuickbooksOAuthClientToken } from "../../types/QuickbooksTypes";
import { QuickbooksAccountService } from "../QuickbooksAccountService";
import { IUser } from "@blockspaces/shared/models/users";
import { PreconditionFailedException } from "@nestjs/common";

let mockServices: {
  httpService: HttpService;
  qbClient: QuickbooksClient;
  userDataService: UserDataService;
  secretService: SecretService;
};
let mockRequests: {
  accountId: String;
  accountdata: AccountCreateQuickbooksRequestDto;
  user: IUser;
};
let mockResponses: {
  createAccount: AccountQuickbooksDto;
  getAccount: AccountQuickbooksDto;
  listAccount: AccountListQuickbooksDto[];
  userDetails: ICredentialReference;
  oAuthClientToken: QuickbooksOAuthClientToken;
};

describe(QuickbooksAccountService.name, () => {
  let _quickbooksAccountService: QuickbooksAccountService;
  beforeAll(async () => {
    mockRequests = {
      accountId: createMock<String>(),
      accountdata: createMock<AccountCreateQuickbooksRequestDto>(),
      user: createMock<IUser>()
    };
    mockResponses = {
      createAccount: createMock<AccountQuickbooksDto>(),
      getAccount: createMock<AccountQuickbooksDto>(),
      listAccount: createMock<AccountListQuickbooksDto[]>([{id: undefined, name: "Account undefined"}]),
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

    _quickbooksAccountService = new QuickbooksAccountService(
      mockServices.httpService,
      mockServices.qbClient,
      mockServices.userDataService,
      mockServices.secretService,
    );
  });

  it(`${QuickbooksAccountService.name} should get Account`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          QueryResponse: {
            Account: [mockResponses.getAccount],
            startPosition: 1,
            maxResults: 1
          }
        }
      };
    const response: AccountQuickbooksDto = await _quickbooksAccountService.getAccount(mockRequests.user, "1");
    expect(response).toMatchObject(mockResponses.getAccount);
  }, 10000);

  it(`${QuickbooksAccountService.name} should get asset accounts`, async() => {
    mockResponses.getAccount = createMock<AccountQuickbooksDto>()
    mockServices.httpService.request = async () => <HttpResponse>{
      status: HttpStatus.OK,
      data: { QueryResponse: {Account: [mockResponses.getAccount]}}
    }
    const response = await _quickbooksAccountService.listAssetAccounts(mockRequests.user)
    expect(response).toMatchObject(mockResponses.listAccount)
  })

  describe("Creating an account", () => {
    it(`${QuickbooksAccountService.name} should create account`, async () => {
      mockServices.httpService.request = async () =>
        <HttpResponse>{
          status: HttpStatus.OK,
          data: mockResponses.createAccount
        };
      const response: AccountQuickbooksDto = await _quickbooksAccountService.createAccount(mockRequests.accountdata, mockRequests.user);
      expect(response).toBeDefined();
    }, 10000);

    it("Saves account id", async () => {
      mockServices.userDataService.updateQboAccountId = jest.fn().mockResolvedValue({status: "success", data: {}})
      const result = await _quickbooksAccountService.saveAccountId("id", "qbId")
      expect(result).toMatchObject({})
    })

    it("Failes save account id gracefully", async () => {
      mockServices.userDataService.updateQboAccountId = async () => {return await {status: "failed", data: {}}}
      let result
      try {
        await _quickbooksAccountService.saveAccountId("id", "qbId")
      } catch (err) {
        expect(err).toBeInstanceOf(PreconditionFailedException)
        expect(err.getStatus()).toBe(HttpStatus.PRECONDITION_FAILED)
      }
    })
  })
});
