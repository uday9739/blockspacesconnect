import { AxiosHttpService, HttpRequestConfig, HttpService } from "@blockspaces/shared/services/http";

/**
 * A base transport class for calling backend APIs via HTTP
 */
export abstract class BaseHttpTransport {

  /** an instance of the Axios HTTP client */
  protected readonly httpService: HttpService;

  constructor(defaultRequestConfig?: HttpRequestConfig) {
    this.httpService = new AxiosHttpService(defaultRequestConfig);
  }
}