import { HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { Inject, Injectable } from "@nestjs/common";
import { Method } from "axios";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";


@Injectable()
export class HaproxyApiService {
  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly httpService: HttpService,
  ) {

  }

  private async callHaproxyApi<T = any>(method: Method, path: string, data?: Record<string, any>, params?: Record<string, any>) {
    const response = await this.httpService.request({
      auth: {
        username: this.env.protocolRouter.username,
        password: this.env.protocolRouter.password
      },
      method: method,
      timeout: 5000, //5 seconds
      url: `${this.env.protocolRouter.apiUrl}${path}`,
      data,
      params,
      validErrorStatuses: [HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.BAD_GATEWAY, HttpStatus.GATEWAY_TIMEOUT, HttpStatus.SERVICE_UNAVAILABLE, HttpStatus.HTTP_VERSION_NOT_SUPPORTED],
    });

    return response.data;
  }

  async addMapEntry(key: string, value: string): Promise<void> {
    await this.callHaproxyApi<{ id: string, key: string, value: string }>('POST', `/services/haproxy/runtime/maps_entries`, { key: key, value: value }, { map: this.env.protocolRouter.mapFile, force_sync: true });
    return;
  }

  async getMapEntries(): Promise<Array<{ key: string }>> {
    const mapEntries: Array<{ id: string, key: string, value: string }> = await this.callHaproxyApi<Array<{ id: string, key: string, value: string }>>('GET', `/services/haproxy/runtime/maps_entries`,{},{ map: this.env.protocolRouter.mapFile });
    return mapEntries;
  }

  async deleteMapEntry(key: string): Promise<void> {
    await this.callHaproxyApi('DELETE', `/services/haproxy/runtime/maps_entries/${key}`, {}, { map: this.env.protocolRouter.mapFile, force_sync: true });
    return;
  }
}
