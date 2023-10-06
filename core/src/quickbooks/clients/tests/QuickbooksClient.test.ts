import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { createMock } from "ts-auto-mock";
import { EnvironmentVariables } from "../../../env";
import { SecretService } from "../../../secrets/services/SecretService";
import { QuickbooksOauthClient, QuickbooksOAuthClientToken } from "../../types/QuickbooksTypes";
import { QuickbooksClient } from "../QuickbooksClient";
import { QuickbooksClientFactory } from "../QuickbooksClientFactory";
import { ConnectLogger } from "../../../logging/ConnectLogger";


describe("Get token and URLs from QuickbooksClient.", () => {
  let qboClient: QuickbooksClient;
  let mockServices: {
    env: EnvironmentVariables;
    secretService: SecretService;
    clientFactory: QuickbooksClientFactory;
    logger: ConnectLogger;
  };
  let mockResponse: {
    iCredentialReference: ICredentialReference;
    qboOauthClient: QuickbooksOauthClient;
    qboOAuthClientToken: QuickbooksOAuthClientToken;
  };

  beforeAll(async () => {
    mockResponse = {
      iCredentialReference: createMock<ICredentialReference>(),
      qboOAuthClientToken: createMock<QuickbooksOAuthClientToken>(),
      qboOauthClient: createMock<QuickbooksOauthClient>({
        clientId: "",
        clientSecret: "",
        environment: "",
        redirectUri: "",
        token: {
          x_refresh_token_expires_in: 0,
          refresh_token: "",
          access_token: "",
          token_type: "",
          expires_in: 0,
          realmId: "",
        }
      }),
    };
    mockServices = {
      logger: createMock<ConnectLogger>(),
      env: createMock<EnvironmentVariables>({
        quickbooks: {
          environment: "sandbox",
          blockspace: {
            clientId: "Some-QB-ClientId",
            clientSecret: "Some-QB-Secret"
          },
          callbackUrl: "https://some/callback/url"
        }
      }),
      secretService: createMock<SecretService>({
        use(): Promise<ICredentialReference> {
          return Promise.resolve(mockResponse.iCredentialReference);
        },
        update(): Promise<ICredentialReference> {
          return Promise.resolve(mockResponse.iCredentialReference);
        }
      }),
      clientFactory: createMock<QuickbooksClientFactory>({
        getClient: () => ({
          isAccessTokenValid(): Promise<any> {
            return Promise.resolve(true);
          },
          refreshUsingToken(): Promise<QuickbooksOAuthClientToken> {
            return Promise.resolve(mockResponse.qboOAuthClientToken);
          },
          refresh(): Promise<QuickbooksOauthClient> {
            return Promise.resolve(mockResponse.qboOauthClient);
          },
          authorizeUri(): string {
            return "AuthorizeUri";
          },
          createToken(): Promise<QuickbooksOauthClient> {
            return Promise.resolve(mockResponse.qboOauthClient);
          },
          revoke(): Promise<QuickbooksOauthClient> {
            return Promise.resolve(mockResponse.qboOauthClient);
          },
        })
      })
    };

    qboClient = new QuickbooksClient(mockServices.logger, mockServices.env, mockServices.secretService, mockServices.clientFactory);
    jest.spyOn(qboClient as any, 'validateOAuthToken').mockResolvedValueOnce(mockResponse.qboOAuthClientToken);
  });

  it(`${QuickbooksClient.name} should be defined`, () => {
    expect(qboClient).toBeDefined();
  });

  it(`${QuickbooksClient.name} should get QuickBooks OAuth Client Token`, async () => {
    const token: QuickbooksOAuthClientToken = await qboClient.getOAuthClientToken();
    expect(token).toBeDefined();
  }, 10000);

  it(`${QuickbooksClient.name} should get QuickBooks URLS`, async () => {
    expect(qboClient.qboAccountingUrl).toBe("https://sandbox-quickbooks.api.intuit.com");
    expect(qboClient.qboAccountsUrl).toBe("https://sandbox-accounts.platform.intuit.com");
    expect(qboClient.qboPaymentsUrl).toBe("https://sandbox.api.intuit.com");
  }, 10000);

  it(`${QuickbooksClient.name} should get QuickBooks Authorize Uri`, async () => {
    const token: string = await qboClient.authorizeUri("some-tenant-id");
    expect(token).toBe("AuthorizeUri");
  }, 10000);

  it(`${QuickbooksClient.name} should get Create QuickBooks Token`, async () => {
    const token: QuickbooksOAuthClientToken = await qboClient.createToken("AuthorizeUri");
    expect(token).toBeDefined();
  }, 10000);

  it(`${QuickbooksClient.name} should get Refresh Using QuickBooks Token`, async () => {
    const token: QuickbooksOAuthClientToken = await qboClient.refreshUsingToken(mockResponse.qboOAuthClientToken);
    expect(token).toBeDefined();
  }, 10000);

  it(`${QuickbooksClient.name} should get Revoke a QuickBooks Token`, async () => {
    const token: QuickbooksOAuthClientToken = await qboClient.revoke(mockResponse.qboOAuthClientToken);
    // expect(token).toBe(mockResponse.qboOAuthClientToken);
    expect(token).toBeDefined();
  }, 10000);
});
