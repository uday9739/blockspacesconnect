import { Injectable } from "@nestjs/common";
import { generateApiKey, ApiKeyResults } from 'generate-api-key';
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import * as Crypto from 'crypto';
import { ValidationException, BadRequestException } from "../../exceptions/common";
import { ApiKeyDocument } from "../../connect-db/schemas";
import { ApiKey } from "@blockspaces/shared/models/platform";
import ApiResult, { ApiResultStatus, AsyncApiResult } from "@blockspaces/shared/models/ApiResult";

/**
 * Provides functionality for working with API Keys within the BlockSpaces platform
 */
@Injectable()
export class ApiKeyService {
  constructor(
    private readonly db: ConnectDbDataContext
  ) {
  }


  private hashApiKey(api_key): string {
    return Crypto.createHash('sha256').update(api_key).digest("base64");
  }

  private isApiKeyExpired(created_date): boolean {
    const expiration_date = this.getExpirationDate(created_date);
    const current_date = new Date();
    const isExpired: boolean = expiration_date <= current_date;
    return isExpired;
  }

  private getExpirationDate(created_date): Date {
    const months_to_expire = 12;
    const expiration_date = new Date(created_date);
    expiration_date.setMonth(expiration_date.getMonth() + 12);
    return expiration_date;
  }

  /**
   * 
   * generate - Generates an API Key
   * 
   * @param  {string} id - An ID - preferably human readable
   * @param  {string} tenant_id - The Tenant ID
   * @param  {string} name - A meaningful name to to the API Key
   * @param  {string} description - A brief description of the API Key usage
   * @param  {string} application - The Application using the API Key
   * 
   * @returns Promise<string> - The API Key
   * 
   */
  async generate(
    id: string,
    tenant_id: string,
    name: string,
    description: string,
    application: string
  ): AsyncApiResult<string> {
    let api_key: ApiKeyResults;
    let api_key_hashed: string;
    try {
      api_key = generateApiKey({ method: 'base62' });
      api_key_hashed = this.hashApiKey(`${api_key.toString()}`);
      await this.db.apikeys.create({
        id,
        tenant_id,
        name,
        description,
        application,
        hash: api_key_hashed,
        active: true
      })
    } catch (error) {
      throw new BadRequestException(error, { description: 'Error generating API Key' });
    }
    return ApiResult.success(api_key.toString(), 'Succesfully generated API Key');
  }

  /**
   * 
   * verify - Verifies an API Key
   * 
   * @param  {string} api_key - The API Key
   * 
   * @returns Promise<{@link ApiResult}> - true = valid, false = invalid
   * 
   */
  async verify(
    api_key: string,
  ): AsyncApiResult<{ tenant_id?: string, api_key?: string, id?: string, expiration_date?: string }> {
    try {
      const api_key_to_verify_hashed = this.hashApiKey(`${api_key}`);
      const api_key_db_result = await this.db.apikeys.find({ hash: api_key_to_verify_hashed });
      if (api_key_db_result.length === 0) {
        return ApiResult.failure('API Key not valid', { api_key: api_key })
      } else if (api_key_db_result.length > 1) {
        return ApiResult.failure('API Key not valid', { api_key: api_key })
      } else {
        if (!!this.isApiKeyExpired((<ApiKeyDocument>api_key_db_result[0]).createdAt)) {
          return ApiResult.failure('API Key is expired', { api_key: api_key, tenant_id: api_key_db_result[0].tenant_id, id: api_key_db_result[0].id, expiration_date: this.getExpirationDate((<ApiKeyDocument>api_key_db_result[0]).createdAt).toISOString() })
        } else if (!api_key_db_result[0].active) {
          return ApiResult.failure('API Key is inactive', { api_key: api_key, tenant_id: api_key_db_result[0].tenant_id, id: api_key_db_result[0].id, active: api_key_db_result[0].active })
        }
      }
      return ApiResult.success({ tenant_id: api_key_db_result[0].tenant_id }, 'API Key verified')
    } catch (error) {
      throw new BadRequestException(error, { description: 'Error verifying API Key' });
    }
  }

  /**
   * 
   * lists - Lists the API Keys for a Tenant
   * 
   * @param  {string} tenant_id - The Tenant ID
   * 
   * @returns Promise<Array<>> - a list of the API keys for the tenant id
   * 
   */
  async list(
    tenant_id: string,
  ): AsyncApiResult<Array<ApiKey>> {
    try {
      const api_key_db_result = await this.db.apikeys.find({ tenantId: tenant_id });
      let api_key_list: Array<ApiKey> = [];
      for (let i = 0; i < api_key_db_result.length; i++) {
        let api_key_item: ApiKey = {
          tenant_id: api_key_db_result[i].tenant_id,
          id: api_key_db_result[i].id,
          name: api_key_db_result[i].name,
          description: api_key_db_result[i].description || '',
          active: api_key_db_result[i].active,
          application: api_key_db_result[i].application,
          hash: '********',
          expiration_date: this.getExpirationDate((<ApiKeyDocument>api_key_db_result[i]).createdAt).toISOString()
        }
        api_key_list.push(api_key_item);
      }
      return ApiResult.success(api_key_list);
    } catch (error) {
      throw new BadRequestException(error, { description: 'Error getting API Keys for tenant' });
    }
  }

  /**
   * 
   * inactivate - Inactivate an API Key
   * 
   * @param  {string} id - the API Key ID
   * @param  {string} tenant_id - the Tenant ID
   * 
   * @returns Promise
   * 
   */
  async inactivate(
    id: string,
    tenant_id: string
  ): Promise<void> {
    try {
      const api_key_db_result = await this.db.apikeys.findOneAndUpdate({ id: id, tenant_id: tenant_id }, { set: { active: false } }, { new: true });
      if (!api_key_db_result) {
        throw new ValidationException('Error finding API Key', { description: `API Key id ${id} for Tenant ID ${tenant_id} not found` })
      }
      return;
    } catch (error) {
      throw new BadRequestException(error, { description: 'Error inactivating API Key' });
    }
  }
}
