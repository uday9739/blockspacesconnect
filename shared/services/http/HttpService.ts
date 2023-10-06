import { AxiosRequestConfig, AxiosResponse } from "axios";
import { isErrorStatus, isSuccessStatus } from "../../helpers/http";
import { HttpStatus } from "../../types/http";

/**
 * Base class that defines operations for interacting with remote APIs using HTTP.
 *
 * Specific implementations should inherit from this class.
 */
export abstract class HttpService {

  /** Send an HTTP request */
  abstract request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP GET request to the given url */
  abstract get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP POST request to the given url */
  abstract post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP PUT request to the given url */
  abstract put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP DELETE request to the given url */
  abstract delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP PATCH request to the given url */
  abstract patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP HEAD request to the given url */
  abstract head<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** Send an HTTP OPTIONS request to the given url */
  abstract options<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;

  /** returns true if the given status code indicates a successful response (i.e. a 2xx status) */
  isSuccessStatus(statusCode: number): boolean {
    return isSuccessStatus(statusCode);
  }

  /** returns true if the given status code indicates a failed response (i.e. non 2xx status) */
  isErrorStatus(statusCode: number): boolean {
    return isErrorStatus(statusCode);
  }

}

/**
 * Configuration properties for an HTTP request
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /**
   * Specific HTTP error status codes (non-2xx) that should not result in a thrown exception if returned in the response
   *
   * If the {@link validateStatus} property is defined, this setting will be ignored
   *
   * @example
   * ```
   * // this will instruct the HttpClient to not throw for a 400 (bad request) or 403 (forbidden) response
   * await httpClient.post("https://foo.bar.com/api/blah", someData, {
   *   validErrorStatuses: [HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN]
   * })
   * ```
   */
  validErrorStatuses?: Array<number | HttpStatus>
}

/**
 * A response from an HTTP request
 */
export interface HttpResponse<T = any> extends AxiosResponse<T> {
}