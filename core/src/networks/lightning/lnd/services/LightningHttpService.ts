import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { HttpService, HttpRequestConfig, HttpResponse } from "@blockspaces/shared/services/http";
import https from "https"
/**
 * Wrapper for Http calls to an LND node.
 */
@Injectable()
export class LightningHttpService {
  constructor(@Inject(forwardRef(() => HttpService)) private httpService: HttpService) {}

  /**
   * Wrapper for GET calls to an LND node.
   * @param url baseUrl for lightningNode
   * @param endpoint specific route for LND
   * @param macaroon macaroon for LND
   * @param params query params
   * @returns Promise {@link HttpResponse}
   */
  async get<T = any>(url: string, endpoint: string, macaroon?: string, cert?: string, params?: Object): Promise<HttpResponse<T>> {
    let agent: https.Agent
    if (cert) {
      const certificate = Buffer.from(cert, "hex")
      agent = new https.Agent({ cert: certificate })
    }
    const config: HttpRequestConfig = {
      baseURL: url,
      method: "GET",
      url: endpoint,
      responseType: "json",
      params: params,
      headers: undefined,
      httpsAgent: agent
    };
    if (macaroon) config.headers = { "Grpc-Metadata-macaroon": macaroon };
    try {
      const response = await this.httpService.request(config);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  /**
   * Wrapper for POST calls to an LND node.
   * @param url baseUrl for lightningNode
   * @param endpoint specific route for LND
   * @param macaroon Optional macaroon for LND
   * @param body Optional body
   * @returns Promise {@link HttpResponse}
   */
  async post<T = any>(url: string, endpoint: string, macaroon?: string, cert?: string, body?: Object): Promise<HttpResponse<T>> {
    let agent: https.Agent
    if (cert) {
      const certificate = Buffer.from(cert, "hex")
      agent = new https.Agent({ cert: certificate })
    }
    const config: HttpRequestConfig = {
      baseURL: url,
      method: "POST",
      url: endpoint,
      data: body,
      headers: undefined,
      httpsAgent: agent
    };
    if (macaroon) config.headers = { "Grpc-Metadata-macaroon": macaroon };
    try {
      const response = await this.httpService.request(config);
      return response;
    } catch (e) {
      return e.response || e.request;
    }
  }

  /**
   * Wrapper for DELETE calls to an LND node.
   * @param url baseUrl for lightningNode
   * @param endpoint specific route for LND
   * @param macaroon Optional macaroon for LND
   * @param params Optional query params
   * @returns Promise {@link HttpResponse}
   */
  async delete<T = any>(url: string, endpoint: string, macaroon?: string, cert?: string, params?: Object): Promise<HttpResponse<T>> {
    let agent: https.Agent
    if (cert) {
      const certificate = Buffer.from(cert, "hex")
      agent = new https.Agent({ cert: certificate })
    }
    const config: HttpRequestConfig = {
      baseURL: url,
      method: "DELETE",
      url: endpoint,
      responseType: "json",
      headers: undefined,
      params: params,
      httpsAgent: agent
    };
    if (macaroon) config.headers = { "Grpc-Metadata-macaroon": macaroon };
    try {
      const response = await this.httpService.request(config);
      return response;
    } catch (e) {
      return e.response;
    }
  }
}
