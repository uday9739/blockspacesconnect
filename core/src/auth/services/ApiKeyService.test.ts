import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { ApiKey } from "@blockspaces/shared/models/platform";
import { createMock } from "ts-auto-mock";
import { ApiKeyDocument } from "../../connect-db/schemas";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ValidationException, BadRequestException } from "../../exceptions/common";
import { ApiKeyService } from "./ApiKeyService";

describe(ApiKeyService, () => {
  let apiKeyService: ApiKeyService;
  let mocks: {
    db: ConnectDbDataContext;
  };
  mocks = {
    db: createMock<ConnectDbDataContext>()
  }

  beforeEach(() => {
    apiKeyService = new ApiKeyService(mocks.db);
  })

  it('Should generate an API Key', async () => {
    const tenant_id = "1234_5678";
    const result = await apiKeyService.generate('Cyclr_BMP', tenant_id, 'BMP Cyclr Connector', 'API Key for Cyclr access to BlockSpaces Multiweb Platform', 'Cyclr');
    mocks.db.apikeys.create = jest.fn().mockResolvedValue(
      <ApiKey>{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'ycksw5ebzxfZ0l5GyJ6sSKXLZSnmwa2h/RKbYIp7ASE=',
        active: true,
        createdAt: new Date()
      }
    );
    expect(result).toBeTruthy();
  });

  it('Should verify an API Key', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.find = jest.fn().mockResolvedValue(
      <Array<ApiKeyDocument>>[{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: true,
        createdAt: new Date().toLocaleDateString()
      }]
    );
    const result = await apiKeyService.verify('6fGL2CSuQe8JoQCtvaEObA');
    expect(result.status).toBe(ApiResultStatus.Success);
  });

  it('Should fail verifying an API Key that does not match', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.find = jest.fn().mockResolvedValue(
      <Array<ApiKeyDocument>>[]
    );
    const result = await apiKeyService.verify('6fGL2CSuQe8JoQCtvaEObB');
    expect(result.status).toBe(ApiResultStatus.Failed);
  });

  it('Should fail for inactive key', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.find = jest.fn().mockResolvedValue(
      <Array<ApiKeyDocument>>[{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: false,
        createdAt: new Date().toLocaleDateString()
      }]
    );
    const result = await apiKeyService.verify('6fGL2CSuQe8JoQCtvaEObA');
    expect(result.status).toBe(ApiResultStatus.Failed);
  });

  it('Should fail for expired key', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.find = jest.fn().mockResolvedValue(
      <Array<ApiKeyDocument>>[{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: false,
        createdAt: new Date('2021-01-01').toLocaleDateString()
      }]
    );
    const result = await apiKeyService.verify('6fGL2CSuQe8JoQCtvaEObA');
    expect(result.status).toBe(ApiResultStatus.Failed);
  });

  it('Should inactivate an API Key', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.findOneAndUpdate = jest.fn().mockResolvedValue(
      <ApiKeyDocument>{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: false,
        createdAt: new Date().toLocaleDateString()
      }
    );
    const result = apiKeyService.inactivate('Cyclr_BMP', tenant_id);
    await expect(result).resolves.not.toThrowError();
  });

  it('Should fail to inactivate an API Key because the id and tenant_id are not found', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.findOneAndUpdate = jest.fn().mockResolvedValue(
      null
    );
    const result = apiKeyService.inactivate('Cyclr_BMP', tenant_id);
    await expect(result).rejects.toThrowError(BadRequestException);
  });

  it('Should retrieve a list of 2 API Keys for a tenant', async () => {
    const tenant_id = "1234_5678";
    mocks.db.apikeys.find = jest.fn().mockResolvedValue(
      <Array<ApiKeyDocument>>[{
        id: 'Cyclr_BPM',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: false,
        createdAt: new Date().toLocaleDateString()
      }, {
        id: 'Cyclr_BPM2',
        tenant_id: tenant_id,
        name: 'BMP Cyclr Connector2',
        description: 'API Key for Cyclr access to BlockSpaces Multiweb Platform',
        application: 'Cyclr',
        hash: 'BBIjg2fZhQnWiv/8231p8+vObabimvplfLGBlJEQTZ4=',
        active: false,
        createdAt: new Date().toLocaleDateString()
      }]
    );
    const result = await apiKeyService.list(tenant_id);
    expect(result.data).toHaveLength(2);
  });

})