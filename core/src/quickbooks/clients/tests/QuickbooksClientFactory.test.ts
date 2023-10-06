import { EnvironmentVariables } from "../../../env";
import { QuickbooksClientFactory } from "../QuickbooksClientFactory";
import { createMock } from "ts-auto-mock";
import OAuthClient from "intuit-oauth";
import { QuickbooksOAuthClientToken } from "../../types/QuickbooksTypes";

describe(`${QuickbooksClientFactory.name}  Get token and URLs from QuickbooksClient.`, () => {
  let qboClientFactory: QuickbooksClientFactory;
  let mockServices: {
    env: EnvironmentVariables;
  };
  let mockRequests: {
    token: QuickbooksOAuthClientToken
  };

  beforeAll(async () => {
    mockServices = {
      env: createMock<EnvironmentVariables>({
        quickbooks: {
          environment: "sandbox",
          blockspace: {
            clientId: "clientId",
            clientSecret: "clientSecret",
          },
          callbackUrl: "callbackUrl",
        }
      })
    };
    mockRequests = {
      token: createMock<QuickbooksOAuthClientToken>(),
    };
    qboClientFactory = new QuickbooksClientFactory(mockServices.env);
  });

  it(`${QuickbooksClientFactory.name} should be defined`, () => {
    expect(qboClientFactory).toBeDefined();
  });

  it(`${QuickbooksClientFactory.name} should create a quick books client`, () => {
    const client: OAuthClient = qboClientFactory.getClient(false,mockRequests.token);
    expect(client).toBeInstanceOf(OAuthClient);
  });
  it(`${QuickbooksClientFactory.name} should create a quick books client without vault token`, () => {
    const client: OAuthClient = qboClientFactory.getClient();
    expect(client).toBeInstanceOf(OAuthClient);
  });
});