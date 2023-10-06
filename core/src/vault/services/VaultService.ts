import ApiResult from "@blockspaces/shared/models/ApiResult";
import { TwoFactorSetupData } from "@blockspaces/shared/models/users";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { HttpService, HttpRequestConfig } from "@blockspaces/shared/services/http";
import { isSuccessStatus } from "@blockspaces/shared/helpers/http";
import { CreateGroupParams, Entity, EntityAlias, Group, GroupAlias, VaultResult } from "../types";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";


/** Provides operations for interacting with the Hashicorp Vault system */
@Injectable()
export class VaultService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) { }

  /**
   * Adds a new entity to Vault
   *
   * @param name the name of the entity
   * @param metadata optional key/value pairs to include with the entity
   * @param policies optional policies to apply to the entity
   *
   * @returns the entity that was added (`data` property from Vault response), or null if an entity with the same name already exists
   *
   * @see https://www.vaultproject.io/api-docs/secret/identity/entity#create-an-entity for details on the associated API call
   */
  createEntity = async (name: string, metadata?: Record<string, any>, policies?: Array<string>): Promise<Entity> => {
    // TODO: TYPE THE RESPONSE/RETURN DATA

    const vaultAppToken = await this.getVaultAppToken();
    const payload = {
      name: name,
      metadata: metadata,
      policies: policies || [],
    };
    const requestOptions: HttpRequestConfig = {
      baseURL: this.vaultApiUrl,
      url: `/identity/entity`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: payload,
    };
    const response = await this.httpService.request<VaultResult<Entity>>(requestOptions);

    return response.data ? response.data.data : null;
  };

  /**
   * Creates a new entity alias
   *
   * @param name name for the alias (should use a unique ID from the associated system)
   * @param entityId the ID of the entity that this alias is tied to
   * @param metadata optional metadata to store
   * @returns the new entity alias, or null if an alias with the given name already exists for the given entity id
   *
   * @see https://developer.hashicorp.com/vault/api-docs/secret/identity/entity-alias#create-an-entity-alias
   */
  createEntityAlias = async (name: string, entityId: string, metadata?: Record<string, any>): Promise<EntityAlias> => {
    const vaultAppToken = await this.getVaultAppToken();
    const payload = {
      name: name,
      canonical_id: entityId,
      mount_accessor: this.env.vault.vaultAccessorID,
      metadata
    };

    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/identity/entity-alias`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: payload,
    };

    const response = await this.httpService.request<VaultResult<EntityAlias>>(requestOptions);
    return response.data ? response.data.data : null;
  };

  /**
   * Create a Vault group
   *
   * @returns the new group, or null if a group with the given name already exists
   * @see https://developer.hashicorp.com/vault/api-docs/secret/identity/group#create-a-group for details on API call
   */
  createGroup = async (params: CreateGroupParams): Promise<Group> => {
    const vaultAppToken = await this.getVaultAppToken();

    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/identity/group`,
      timeout: 1000 * 5,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: params,
    };

    const response = await this.httpService.request<VaultResult<Group>>(requestOptions);

    return response.data?.data || null;
  };

  /**
   * Creates or updates a group alias.
   *
   * If the corresponding group already has an alias, but with a different name,
   * then the existing alias name will be updated
   *
   * @param aliasName name of the alias
   * @param groupId ID of the group this alias is tied to
   * @returns the alias that was created or updated, or null if the alias already exists
   *
   * @see https://developer.hashicorp.com/vault/api-docs/secret/identity/group-alias#create-a-group-alias
   */
  createGroupAlias = async (aliasName: any, groupId: any): Promise<GroupAlias> => {
    const vaultAppToken = await this.getVaultAppToken();

    const payload = {
      canonical_id: groupId,
      mount_accessor: this.env.vault.vaultAccessorID,
      name: aliasName,
    };

    const response = await this.httpService.request<VaultResult<GroupAlias>>({
      baseURL: `${this.vaultApiUrl}`,
      url: `/identity/group-alias`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      validErrorStatuses: [
        HttpStatus.BAD_REQUEST    // returned if alias already exists with same name
      ],
    });

    if (this.httpService.isErrorStatus(response.status)) {
      return null;
    }

    return response.data?.data || null;
  };

  /**
   * Find an entity with a given name
   *
   * @param name the name of the entity to find
   * @returns the entity matching the given name, or null if no match is found
   *
   * @see https://www.vaultproject.io/api-docs/secret/identity/entity#read-entity-by-name for details on associated API call
   */
  async getEntityByName(name: string) {
    if (!name) {
      return null;
    }

    const response = await this.httpService.request({
      baseURL: this.vaultApiUrl,
      url: `/identity/entity/name/${name}`,
      method: "GET",
      validErrorStatuses: [HttpStatus.NOT_FOUND],
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": await this.getVaultAppToken(),
      }
    });

    return this.httpService.isSuccessStatus(response.status) ? response.data.data : null;
  }

  /**
   * Find an entity with a given name
   *
   * @param name the name of the entity to find
   * @returns the entity matching the given name, or null if no match is found
   *
   * @see https://developer.hashicorp.com/vault/api-docs/secret/identity/group#read-group-by-name for details on associated API call
   */
  async getGroupByName(name: string): Promise<Group> {
    if (!name) {
      return null;
    }

    const response = await this.httpService.request({
      baseURL: this.vaultApiUrl,
      url: `/identity/group/name/${name}`,
      method: "GET",
      validErrorStatuses: [HttpStatus.NOT_FOUND],
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": await this.getVaultAppToken(),
      }
    });

    return this.httpService.isSuccessStatus(response.status) ? response.data.data : null;
  }

  deleteIdentity = async (entityId: string): Promise<boolean> => {
    const vaultAppToken = await this.getVaultAppToken();
    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/identity/entity/id/${entityId}`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
    };

    const response = await this.httpService.request(requestOptions);
    if (isSuccessStatus(response.status)) {
      return true;
    } else {
      // IF THE CODE GETS HERE.
      return false;
    }
  };

  updateIdentity = async (id: string, name: string, policies?: Array<string>, disable?: boolean, metadata?: Object): Promise<boolean> => {
    const vaultAppToken = await this.getVaultAppToken();
    const payload = {
      id: id,
      name: name || null,
      policies: policies || [],
      disable: disable || false,
    };
    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/identity/entity/id/${id}`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: payload,
    };
    await this.httpService.request(requestOptions);
    // if (response.status === 200 || response.status === 204) {
    // this.logger.debug("updateIdentity() successfully updated entity in vault", { module: VaultService.name }, { response: response.data });
    // return { status: "success", data: {} };
    return true;
    // } else {
    //   return { status: "failed", data: response.data };
    // }
  };

  createTOTPKey = async (accountName: string, keyName: string): Promise<ApiResult<TwoFactorSetupData>> => {
    const vaultAppToken = await this.getVaultAppToken();
    const payload = {
      generate: true,
      issuer: "BlockSpaces Platform",
      account_name: accountName,
    };
    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/totp/keys/${keyName}`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: payload,
    };

    const response = await this.httpService.request<CreateTotpKeyResult>(requestOptions);
    return ApiResult.success(response.data.data);

  };
  validateTOTPCode = async (code: string, keyName: string) => {
    const vaultAppToken = await this.getVaultAppToken();
    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/totp/code/${keyName}`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      validErrorStatuses: [400,401,403,404,429],
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: { code: code },
    };

    const response = await this.httpService.request(requestOptions);
    if (response.status >= 200 && response.status < 300) {
      return { status: "success", data: response.data.data };
    } else {
      return { status: "failed", data: response.data.errors[0] };
    }
  };


  /**
   * Get the Credential from Vault for runtime use.
   *
   * @param secretPath
   * @param accessToken vault Client Token
   * @returns VaultStatusResponse
   */
  getVaultCredential = async (secretPath: string, accessToken?: string): Promise<{}> => {
    let vaultToken: string = "";
    if (accessToken === undefined) {
      // if no token, its because we are getting the APP token
      vaultToken = await this.getVaultAppToken();
    } else {
      // we have User/Client JWT, send it
      vaultToken = await this.getVaultClientToken(accessToken);
    }
    const response: HttpRequestConfig = await this.httpService.request({
      baseURL: this.vaultApiUrl,
      url: "/" + secretPath,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Vault-Token": vaultToken,
      },
    });
    return response.data.data.data;
  };
  /**
   * Add a New Credential to Vault.
   *
   * @param secretPath Add a New Credential to Vault.
   * @param accessToken vault Client Token
   * @param secretData
   * @returns VaultStatusResponse
   */
  postVaultCredential = async (secretPath: string, secretData: any, accessToken?: string): Promise<{}> => {
    let vaultToken: string = "";
    let _result = {}; // ApiResult.failure("postVaultCredential: Something unexpected happened. Check vault, viscosity, your network. ln:186");

    try {
      if (accessToken === undefined) {
        // if no token, its because we are getting the APP token
        vaultToken = await this.getVaultAppToken();
      } else {
        // we have User/Client JWT, send it
        vaultToken = await this.getVaultClientToken(accessToken);
      }
      const response: HttpRequestConfig = await this.httpService.request({
        baseURL: this.vaultApiUrl,
        url: secretPath,
        timeout: 1000 * 5, // Wait for 5 seconds
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Vault-Token": vaultToken,
        },
        data: secretData,
      });
      _result = response.data;
    }
    catch (err) {
      throw new Error(err.message || "Something unexpected happened. Check vault, viscosity, your network.");
    };
    return _result;
  };
  /**
   * Update an existing Credential Version
   *
   * @param secretPath
   * @param accessToken vault Client Token
   * @param secretData
   * @returns VaultStatusResponse
   */
  putVaultCredential = async (secretPath: string, secretData: any, accessToken?: string): Promise<{}> => {
    let vaultToken: string = "";
    let _result: {};
    try {
      if (accessToken === undefined || accessToken === "") {
        vaultToken = await this.getVaultAppToken();
      } else {
        vaultToken = await this.getVaultClientToken(accessToken);
      }
      const response: HttpRequestConfig = await this.httpService.request({
        baseURL: this.vaultApiUrl,
        url: secretPath,
        timeout: 1000 * 5, // Wait for 5 seconds
        method: "put",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Vault-Token": vaultToken,
        },
        data: secretData,
      });
      _result = response.data;
    }
    catch (err) {
      throw new Error(`putVaultCredential() error ${err.message}`);
    };
    return _result;
  };

  /**
   * Remove a Credential from Vault
   *
   * @param secretPath
   * @param accessToken
   * @returns boolean
   */
  deleteVaultCredential = async (secretPath: string, accessToken?: string): Promise<boolean> => {
    let vaultToken: string = "";
    try {
      if (accessToken === undefined) {
        // if no token, its because we are getting the APP token
        vaultToken = await this.getVaultAppToken();
      } else {
        // we have User/Client JWT, send it
        vaultToken = await this.getVaultClientToken(accessToken);
      }
      await this.httpService.request({
        baseURL: this.vaultApiUrl,
        url: secretPath,
        timeout: 1000 * 5, // Wait for 5 seconds
        method: "delete",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Vault-Token": vaultToken,
        },
      });
      return true;
    }
    catch (err) {
      throw new Error(`deleteVaultCredential() error ${err.message}`);
    };
  };
  getVaultStatus = async (): Promise<ApiResult<string>> => {
    const authPath = "auth/approle/login";
    let vaultAppToken = null;
    const data = {
      role_id: this.env.vault.vaultAppRoleId,
      secret_id: this.env.vault.vaultAppSecreteId,
    };
    const requestOptions: HttpRequestConfig = {
      baseURL: this.env.vault.vaultApiUrl,
      url: authPath,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: data,
    };
    const response = await this.httpService.request(requestOptions);
    if (response.data && response.data.auth) {
      vaultAppToken = response.data.auth.client_token;
    } else {
      return ApiResult.failure("failed to connect to vault");
    }
    return ApiResult.success(vaultAppToken);
  };

  /**
   * Adds a tenant to vault as a group and group alias
   *
   * @param tenantId the unique ID of the tenant to create a group for in vault
   */
  addTenantToVault = async (tenantId: string) => {
    const vault: any = {};

    const groupName = tenantId;
    const policyName = tenantId;

    let group = await this.createGroup({
      name: groupName,
      type: "external",
      policies: [policyName]
    });

    // try to find group by name if creation returned a null result
    group = group || await this.getGroupByName(groupName);

    if (!group?.id) {
      return ApiResult.failure("failed when adding group to Vault");
    }

    vault.group = group;
    vault.alias = group.alias?.id ? group.alias : await this.createGroupAlias(groupName, group.id);

    if (!vault.alias?.id) {
      return ApiResult.failure("failed when adding group alias to Vault");
    }

    const policyObject = {
      policy: `path \"${this.env.vault.vaultConnectPath}/metadata/orgs/${tenantId}*\" {\n  capabilities = [\"read\",\"list\"]\n}\n\npath \"${this.env.vault.vaultConnectPath}/data/orgs/${tenantId}*\" {\n  capabilities = [ \"create\",\"read\",\"update\",\"delete\",\"list\" ]\n}\n\npath \"${this.env.vault.vaultConnectPath}/data/orgs/${tenantId}/{{identity.entity.aliases.${this.env.vault.vaultAccessorID}.metadata.sub}}*\" {\n  capabilities = [ \"create\",\"read\",\"update\",\"delete\",\"list\" ]\n}\n`,
    };

    vault.policy = { name: policyName, policy: policyObject };
    await this.addGroupPolicy(`${tenantId}`, policyObject);

    return ApiResult.success(vault);
  };

  // PRIVATE
  /** Gets the base URL for the Vault API */
  private get vaultApiUrl(): string {
    return this.env.vault.vaultApiUrl;
  };

  private addGroupPolicy = async (policyName: string, policyObject: { policy: string }) => {
    const vaultAppToken = await this.getVaultAppToken();
    const payload = policyObject;

    const requestOptions: HttpRequestConfig = {
      baseURL: `${this.vaultApiUrl}`,
      url: `/sys/policy/${policyName}`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Token": vaultAppToken,
      },
      data: payload,
    };

    await this.httpService.request(requestOptions);
  };
  /**
   * Return the Application token for subsequent Vault Calls.
   * 
   * @returns token as string
   */
  private getVaultAppToken = async (): Promise<string> => {
    const vaultResponse: HttpRequestConfig = await this.httpService.request({
      baseURL: this.env.vault.vaultApiUrl,
      url: "auth/approle/login",
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        role_id: this.env.vault.vaultAppRoleId,
        secret_id: this.env.vault.vaultAppSecreteId,
      },
    });

    if (vaultResponse.data && vaultResponse.data.auth) {
      return vaultResponse.data.auth.client_token;
    } else {
      return "";
    }
  };

  /**
 * Return the client token for subsequent Vault Calls.
 *
 * @param accessToken
 * @returns token as string
 */
  private getVaultClientToken = async (accessToken: string): Promise<string> => {
    const vaultClientResponse: HttpRequestConfig = await this.httpService.request({
      baseURL: this.vaultApiUrl,
      url: `auth/${this.env.vault.vaultJWTPath}/login`,
      timeout: 1000 * 5, // Wait for 5 seconds
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        jwt: accessToken,
      },
    });

    if (vaultClientResponse.data && vaultClientResponse.data.auth) {
      return vaultClientResponse.data.auth.client_token;
    } else {
      return "";
    }
  };
}

export type CreateTotpKeyResult = {
  data: TwoFactorSetupData;
};
