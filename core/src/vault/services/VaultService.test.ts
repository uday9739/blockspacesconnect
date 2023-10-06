import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { TwoFactorSetupData } from "@blockspaces/shared/models/users";
import { createMock } from "ts-auto-mock";
import { EnvironmentVariables } from "../../env";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { VaultService } from "./VaultService";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { ConnectLogger } from "../../logging/ConnectLogger";


describe(VaultService, () => {
  let vaultService: VaultService;
  let mockServices: {
        httpService: HttpService,
        env: EnvironmentVariables,
        logger: ConnectLogger
    };
  let mockRequests: {
        entityId: String,
        tenantId: String,
        secretPath: String,
        secretData: any,
        accessToken: String,
        code: String,
        keyName: String,
        accountName: String,
        addIdentity: {
            name: string,
            metadata: Object,
            policies?: Array<string>
        },
        updateIdentity: {
            id: string,
            name: string,
            policies?: string[],
            disable?: boolean,
            metadata?: Object
        },
        addIdentityAliasJWT: {
            name: string,
            canonicalId: string,
            metadata?: Object
        },
    };
  let mockResponse: {
        createToTP: TwoFactorSetupData,
        standard: {
            status: string;
            data: any;
        },
        httpResponse: HttpResponse,
    };
  beforeEach(() => {
    mockRequests = {
      entityId: createMock<String>(),
      tenantId: createMock<String>(),
      secretPath: createMock<String>(),
      secretData: createMock<any>(),
      accessToken: createMock<String>(),
      code: createMock<String>(),
      keyName: createMock<String>(),
      accountName: createMock<String>(),
      addIdentity: createMock<{
                name: string,
                metadata: Object,
                policies?: Array<string>
            }>(),
      updateIdentity: createMock<{
                id: string,
                name: string,
                policies?: string[],
                disable?: boolean,
                metadata?: Object
            }>(),
      addIdentityAliasJWT: createMock<{
                name: string,
                canonicalId: string,
                metadata?: Object
            }>(),
    };
    mockResponse = {
      createToTP: createMock<TwoFactorSetupData>(),
      standard: createMock<{
                status: string;
                data: any;
            }>(),
      httpResponse: createMock<HttpResponse>({
        status: HttpStatus.OK,
        data: {data:{id:1, data: {}}},
      }),
    };
    mockServices = {
      httpService: createMock<HttpService>({
        request(): Promise<HttpResponse> {
          return Promise.resolve(mockResponse.httpResponse);
        },
      }),
      env: createMock<EnvironmentVariables>(),
      logger: createMock<ConnectLogger>()
    };
    vaultService = new VaultService(mockServices.httpService, mockServices.env, mockServices.logger);
    jest.spyOn(vaultService as any, 'getVaultAppToken').mockResolvedValueOnce("VaultAppToken");
    jest.spyOn(vaultService as any, 'getVaultClientToken').mockResolvedValueOnce("VaultClientToken");
  });

  it(`${VaultService.name} should be defined`, () => {
    expect(VaultService).toBeDefined();
  });

  it(`${VaultService.name} should implement addIdentity`, async () => {
    const response = await vaultService.createEntity(mockRequests.addIdentity.name, mockRequests.addIdentity.metadata, mockRequests.addIdentity.policies);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement addIdentity w/out policy`, async () => {
    const response = await vaultService.createEntity(mockRequests.addIdentity.name, mockRequests.addIdentity.metadata);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement deleteIdentity`, async () => {
    const response = await vaultService.deleteIdentity(mockRequests.entityId.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement updateIdentity`, async () => {
    const response = await vaultService.updateIdentity(mockRequests.updateIdentity.id, mockRequests.updateIdentity.name);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement updateIdentity w/Policy`, async () => {
    const response = await vaultService.updateIdentity(mockRequests.updateIdentity.id, mockRequests.updateIdentity.name, mockRequests.updateIdentity.policies);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement updateIdentity w/Policy & Disabled`, async () => {
    const response = await vaultService.updateIdentity(mockRequests.updateIdentity.id, mockRequests.updateIdentity.name, mockRequests.updateIdentity.policies, mockRequests.updateIdentity.disable);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement updateIdentity w/Policy, Disabled & Metadata`, async () => {
    const response = await vaultService.updateIdentity(mockRequests.updateIdentity.id, mockRequests.updateIdentity.name, mockRequests.updateIdentity.policies, mockRequests.updateIdentity.disable, mockRequests.updateIdentity.metadata);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement addIdentityAliasJWT`, async () => {
    const response = await vaultService.createEntityAlias(mockRequests.addIdentityAliasJWT.name, mockRequests.addIdentityAliasJWT.canonicalId);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement addIdentityAliasJWT w/Metadata`, async () => {
    const response = await vaultService.createEntityAlias(mockRequests.addIdentityAliasJWT.name, mockRequests.addIdentityAliasJWT.canonicalId, mockRequests.addIdentityAliasJWT.metadata);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement addTenantToVault`, async () => {
    const response = await vaultService.addTenantToVault(mockRequests.tenantId.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement createTOTPKey`, async () => {
    const response = await vaultService.createTOTPKey(mockRequests.accountName.toString(), mockRequests.keyName.toString());
    expect(response.status).toBe(ApiResultStatus.Success);
  });

  it(`${VaultService.name} should implement validateTOTPCode`, async () => {
    const response = await vaultService.validateTOTPCode(mockRequests.code.toString(), mockRequests.keyName.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement getVaultCredential`, async () => {
    const response = await vaultService.getVaultCredential(mockRequests.secretPath.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement getVaultCredential w/accessToken`, async () => {
    const response = await vaultService.getVaultCredential(mockRequests.secretPath.toString(), mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement postVaultCredential`, async () => {
    const response = await vaultService.postVaultCredential( mockRequests.secretPath.toString(), mockRequests.secretData);
    expect(response).toBeDefined();
  });
  
  it(`${VaultService.name} should implement postVaultCredential w/accessToken`, async () => {
    const response = await vaultService.postVaultCredential(mockRequests.secretPath.toString(), mockRequests.secretData, mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement putVaultCredential`, async () => {
    const response = await vaultService.putVaultCredential(mockRequests.secretPath.toString(), mockRequests.secretData);
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement putVaultCredential w/accessToken`, async () => {
    const response = await vaultService.putVaultCredential(mockRequests.secretPath.toString(), mockRequests.secretData, mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement deleteVaultCredential`, async () => {
    const response = await vaultService.deleteVaultCredential(mockRequests.secretPath.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement deleteVaultCredential w/accessToken`, async () => {
    const response = await vaultService.deleteVaultCredential(mockRequests.secretPath.toString(), mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

  it(`${VaultService.name} should implement getVaultStatus`, async () => {
    const response = await vaultService.getVaultStatus();
    expect(response).toBeDefined();
  });
});