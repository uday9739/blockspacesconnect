import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateSecretDto, UpdateSecretDto, ReadSecretDto } from "@blockspaces/shared/dtos/UserSecrets";
import { VaultService } from "../../vault";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { v4 as uuidv4 } from "uuid";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { SecretType, UserSecret } from "../types/secret";

@Injectable()
export class SecretService {
  constructor(private readonly vaultService: VaultService, private readonly db: ConnectDbDataContext) {}

  /**
   * Constructs vault path for the credential
   * @param tenantId "80d9b214-60fd-439d-9e31-8aac00abe3c4"
   * @param userId "3c3d766b-eef8-4e3b-835f-2a0742cb5894"
   * @param credentialId "b2b12ffa-143c-4859-95b7-b5a0db03e81d"
   * @param credentialSubPath optional "node/path/to/credential"
   * @returns path
   */
  private constructVaultPath(tenantId: string, userId: string, secretId: string, secretType: SecretType, subPath?: string): string {
    const vaultSecret = new UserSecret(secretType, tenantId, userId, {
      secretId: secretId,
      subpath: subPath || secretType.toLocaleLowerCase() || ""
    });
    return vaultSecret.path;
  }

  /**
   * Get the Secret from Vault
   *
   * @param accessToken
   * @param secretPath
   * @returns secret as string
   */
  private async getCredential(secretPath: string, accessToken?: string): Promise<{}> {
    const credential = await this.vaultService.getVaultCredential(secretPath, accessToken);
    if (!credential) {
      throw new InternalServerErrorException({}, `${SecretService.name}.getCredential() response was NULL.`);
    }
    return credential;
  }

  /**
   *  CREATE NEW Credential.
   *
   * @param body CreateSecretDto
   * @param tenantId  CoreUser tenant
   * @param userId  CoreUser id
   * @param accessToken  CoreUser accessToken(JWT)
   * @returns ICredentialReference or null.
   */
  async create(body: CreateSecretDto, tenantId: string, userId: string, secretType: SecretType, accessToken?: string): Promise<ICredentialReference> {
    const _clientCredentials: ICredentialReference = {
      credentialId: uuidv4(),
      tenantId: tenantId,
      userId: userId,
      label: body.label || "Credential for " + tenantId,
      description: body.description || "New Credential",
      subPath: body.subPath || ""
    };

    // Secret(Credentials) metadata is only stored in mongo
    let results: ICredentialReference = await this.db.userSecrets.create(_clientCredentials);

    // Secret(Credentials) Secret is only stored in Vault
    if (results) {
      const secretData = { data: body.credential };

      const vaultPath = this.constructVaultPath(_clientCredentials.tenantId, _clientCredentials.userId, _clientCredentials.credentialId, secretType, _clientCredentials.subPath);
      // Get the Vault Client Token
      const postCredential: {} = await this.vaultService.postVaultCredential(vaultPath, secretData, accessToken);

      if (postCredential) {
        results = _clientCredentials;
      } else {
        results = null;
      }
    } else {
      results = null; // ApiResult.failure("An error occurred while creating the Credentials. " + results);
    }
    return results;
  }

  /**
   * Gets metadata for secrets from Client Credentials in mongo.
   *
   * @param credentialId -- Mongo unique Id
   * @param tenantId -- secrets are tenant based
   * @returns ICredentialReference or null.
   *
   */
  async read(credentialId: string, tenantId: string): Promise<ICredentialReference> {
    let response: ICredentialReference = {
      credentialId: "",
      tenantId: "",
      userId: "",
      label: ""
    };
    const data: ICredentialReference[] = await this.db.userSecrets.find({ credentialId: credentialId, tenantId: tenantId });
    if (!data || !Array.isArray(data) || (Array.isArray(data) && data.length !== 1) || data.length > 1) {
      response = null;
    } else {
      const tempCredentials: ICredentialReference = {
        credentialId: data[0].credentialId,
        tenantId: data[0].tenantId,
        userId: data[0].userId,
        label: data[0].label,
        description: data[0].description,
        subPath: data[0].subPath,
        credential: {}
      };
      if (data[0].subPath?.length > 0) tempCredentials.subPath = data[0].subPath;
      if (data[0]._id) tempCredentials._id = data[0]._id;
      if (data[0].__v) tempCredentials._id = data[0].__v;
      if (data[0].createdAt) tempCredentials.createdAt = data[0].createdAt;
      if (data[0].updatedAt) tempCredentials.updatedAt = data[0].updatedAt;
      response = tempCredentials;
    }
    return response;
  }

  /**
   * USE is used in the Engine for execution
   *
   * @param credentialId credentialId
   * @param tenantId tenantId
   * @param accessToken
   * @returns ICredentialReference or null.
   */
  async use(credentialId: string, tenantId: string, secretType: SecretType, accessToken?: string): Promise<ICredentialReference> {
    // First we contact MongoDB to get the credentials from the database.
    let mongoData: ICredentialReference = await this.read(credentialId, tenantId);

    if (mongoData) {
      const secretPath: string = this.constructVaultPath(mongoData.tenantId, mongoData.userId, mongoData.credentialId, secretType, mongoData.subPath);
      const response = await this.getCredential(secretPath, accessToken);
      if (response) {
        mongoData.credential = response;
      } else {
        mongoData = null; // Credential was not found in vault.
      }
    } else {
      mongoData = null; // Credential was not found in Mongo
    }
    return mongoData;
  }

  /**
   * Lists metadata for all secrets associated with a given TenantId.
   *
   * @param tenantId ConnectorId, TenantId
   * @returns ICredentialReference[] or null.
   */
  async list(tenantId: string): Promise<ICredentialReference[]> {
    let results: ICredentialReference[];
    const doc: ICredentialReference[] = await this.db.userSecrets.find({ tenantId: tenantId });
    if (!doc || (Array.isArray(doc) && doc.length < 1)) {
      results = null;
    } else {
      const arrClientCredentials: Array<ICredentialReference> = [];
      doc.map((item: ICredentialReference) => {
        arrClientCredentials.push(item);
      });
      results = arrClientCredentials;
    }
    return results;
  }

  /**
   * Updates a credential in Vault.
   * @param body UpdateSecretDto
   * @param accessToken CoreUser accessToken(JWT)
   * @returns ICredentialReference or null
   */
  async update(body: UpdateSecretDto, secretType: SecretType, accessToken?: string): Promise<ICredentialReference> {
    let results: ICredentialReference;
    const metadata: ICredentialReference = await this.read(body.credentialId, body.tenantId);
    if (metadata) {
      // const secretData = { data: body.newCredential };
      const secretData = { data: body.newCredential };
      const vaultPath = this.constructVaultPath(metadata.tenantId, metadata.userId, metadata.credentialId, secretType, metadata.subPath);
      const updateCredential: {} = await this.vaultService.putVaultCredential(vaultPath, secretData, accessToken);
      if (updateCredential) {
        results = metadata;
      } else {
        results = null;
      }
    } else {
      results = null;
    }
    return results;
  }

  /**
   * Deletes secret from mongo and vault
   * @param body ReadSecretDto
   * @param accessToken jwt
   * @returns { success: boolean, failureReason?: string }
   */
  async delete(body: ReadSecretDto, secretType: SecretType, accessToken?: string): Promise<{ success: boolean; failureReason?: string }> {
    const results: { success: boolean; failureReason?: string } = {
      success: false
    };
    const metadata: ICredentialReference = await this.read(body.credentialId, body.tenantId);
    if (metadata) {
      const vaultPath = this.constructVaultPath(body.tenantId, metadata.userId, body.credentialId, secretType, metadata.subPath);
      const wasDeleted: boolean = await this.vaultService.deleteVaultCredential(vaultPath, accessToken);

      if (wasDeleted) {
        const doc = await this.db.userSecrets.findOneAndDelete({ credentialId: body.credentialId, tenantId: body.tenantId });
        if (!doc._id) {
          results.success = false;
          results.failureReason = "Secret was not deleted from Mongo";
        } else {
          results.success = true;
        }
      } else {
        results.success = false;
        results.failureReason = "Secret was not deleted from Vault";
      }
    } else {
      results.success = false;
      results.failureReason = "Secret was not found.";
    }
    return results;
  }

  async getByLabel(tenantId: string, label: string): Promise<ICredentialReference> {
    let response: ICredentialReference = {
      credentialId: "",
      tenantId: "",
      userId: "",
      label: ""
    };
    const data: ICredentialReference = await this.db.userSecrets.findOne({tenantId: tenantId, label: label});
    
    const tempCredentials: ICredentialReference = {
      credentialId: data.credentialId,
      tenantId: data.tenantId,
      userId: data.userId,
      label: data.label,
      description: data.description,
      subPath: data.subPath,
      credential: {}
    };
    if (data.subPath?.length > 0) tempCredentials.subPath = data.subPath;
    if (data._id) tempCredentials._id = data._id;
    if (data.__v) tempCredentials._id = data.__v;
    if (data.createdAt) tempCredentials.createdAt = data.createdAt;
    if (data.updatedAt) tempCredentials.updatedAt = data.updatedAt;
    response = tempCredentials;
    return response;
  }
}
