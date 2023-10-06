import Strategy from "passport-headerapikey";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { TenantService } from "../../tenants";
import { ApiKeyService } from "../services/ApiKeyService";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";

/**
 * Passport strategy for API Key-based authentication on the BlockSpaces platform
 *
 * This strategy will attempt to verify the API Key using the API Key service and load the associated tenant as the activeTenant
 * 
 */
@Injectable()
export class BlockSpacesApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {

  constructor(
    private readonly tenantDataService: TenantService,
    private readonly apiKeyService: ApiKeyService
  ) {
    super({ header: 'X-API-KEY', prefix: '' },
      true,
      async (api_key, done) => {
        return this.validate(api_key, done);
      });
  }

  /**
   * Callback for Nest.js that provides the user data that will be attached to the request.
   * This method is guaranteed to only be called once the API Key has been validated
   */
  public validate = async (api_key: string, done: (error: Error, data) => {}) => {
    try {
      const api_key_verify_response = await this.apiKeyService.verify(api_key);
      const api_key_is_valid = api_key_verify_response.status === ApiResultStatus.Success
      if (api_key_is_valid) {
        let results = {
          activeTenant: await this.tenantDataService.findByTenantId(api_key_verify_response.data?.tenant_id)
        }
        done(null, results);
      } else {
        done(new UnauthorizedException(api_key_verify_response.message), null)
      }
    } catch (error) {
      done(new UnauthorizedException(error), null);
    }
    done(new UnauthorizedException(), null);
  }
}
