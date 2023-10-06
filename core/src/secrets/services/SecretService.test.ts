import { CreateSecretDto, ReadSecretDto, UpdateSecretDto } from "@blockspaces/shared/dtos/UserSecrets";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { VaultService } from "../../vault";
import { SecretType } from "../types/secret";
import { SecretService } from "./SecretService";

describe(SecretService, () => {
  let secretService: SecretService;
  let mockServices: {
    vaultService: VaultService;
    db: ConnectDbDataContext;
    logger: ConnectLogger;
  };
  let mockRequests: {
    createBody: CreateSecretDto;
    accessToken: String;
    tenantId: String;
    userId: String;
    credentialId: String;
    subPath: String;
    updateBody: UpdateSecretDto;
    deleteBody: ReadSecretDto;
  };
  let mockResponse: {
    results: ICredentialReference;
    delete: { success: boolean; failureReason?: string };
    vaultPath: String;
  };

  beforeEach(() => {
    mockServices = {
      vaultService: createMock<VaultService>({
        postVaultCredential(): Promise<{}> {
          return Promise.resolve({});
        },
        getVaultCredential(): Promise<{}> {
          return Promise.resolve({});
        },
        putVaultCredential(): Promise<{}> {
          return Promise.resolve({});
        },
        deleteVaultCredential(): Promise<boolean> {
          return Promise.resolve(true);
        },
      }),
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    };
    mockRequests = {
      createBody: createMock<CreateSecretDto>(),
      accessToken: createMock<String>(),
      tenantId: createMock<String>(),
      userId: createMock<String>(),
      credentialId: createMock<String>(),
      subPath: createMock<String>(),
      updateBody: createMock<UpdateSecretDto>(),
      deleteBody: createMock<ReadSecretDto>()
    };
    mockResponse = {
      results: createMock<ICredentialReference>(),
      delete: createMock<{ success: boolean; failureReason?: string }>(),
      vaultPath: createMock<String>(),
    };
    secretService = new SecretService(mockServices.vaultService, mockServices.db);
    jest.spyOn(secretService as any, 'constructVaultPath').mockResolvedValueOnce(mockResponse.vaultPath);
  });

  it(`${SecretService.name} should implement create secret`, async () => {
    mockServices.db.userSecrets.create = jest.fn().mockReturnValue(mockResponse.results);
    const response: ICredentialReference = await secretService.create(
      mockRequests.createBody,
      mockRequests.tenantId.toString(),
      mockRequests.userId.toString(),
      SecretType.QUICKBOOKS,
      mockRequests.accessToken.toString()
    );
    expect(response).toBeDefined();
  });

  it(`${SecretService.name} should implement read secret`, async () => {
    mockServices.db.userSecrets.find = jest.fn().mockReturnValue([mockResponse.results]);
    const response: ICredentialReference = await secretService.read(mockRequests.credentialId.toString(), mockRequests.tenantId.toString());
    expect(response).toBeDefined();
  });

  it(`${SecretService.name} should implement use secret`, async () => {
    mockServices.db.userSecrets.find = jest.fn().mockReturnValue([mockResponse.results]);
    const response: ICredentialReference = await secretService.use(mockRequests.credentialId.toString(), mockRequests.tenantId.toString(), SecretType.QUICKBOOKS, mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });


  it(`${SecretService.name} should implement list secrets`, async () => {
    mockServices.db.userSecrets.find = jest.fn().mockReturnValue([mockResponse.results]);
    const response: ICredentialReference[] = await secretService.list(mockRequests.tenantId.toString());
    expect(response).toBeDefined();
  });

  it(`${SecretService.name} should implement update secret`, async () => {
    mockServices.db.userSecrets.find = jest.fn().mockReturnValue([mockResponse.results]);
    const response: ICredentialReference = await secretService.update(mockRequests.updateBody, SecretType.QUICKBOOKS, mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

  it(`${SecretService.name} should implement delete secret`, async () => {
    mockServices.db.userSecrets.find = jest.fn().mockReturnValue([mockResponse.results]);
    mockServices.db.userSecrets.findOneAndDelete = jest.fn().mockReturnValue([mockResponse.results]);
    const response = await secretService.delete(mockRequests.deleteBody, SecretType.QUICKBOOKS, mockRequests.accessToken.toString());
    expect(response).toBeDefined();
  });

});
