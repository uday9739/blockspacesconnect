import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { validateStatusCodes } from "../../helpers/http";
import { HttpRequestConfig, HttpResponse, HttpService } from "./HttpService";

/**
 * An {@link HttpService} implementation that wraps the Axios HTTP client.
 *
 * @see https://axios-http.com/docs/intro
 */
export class AxiosHttpService extends HttpService {

  private readonly axiosInstance: AxiosInstance;

  /**
   * Create a new instance that wraps the given Axios instance.
   *
   * If no instance is provided, then the default Axios instance will be used
   */
  constructor(axiosInstance?: AxiosInstance);

  /**
   * Create a new instance using the given configuration.
   *
   * If no configuration is provided, the default axios instance will be used
   */
  constructor(defaultRequestConfig?: HttpRequestConfig);

  constructor (configOrInstance?: AxiosInstance | HttpRequestConfig) {
    super();

    if (isAxiosInstance(configOrInstance)) {
      this.axiosInstance = configOrInstance;
      return;
    }

    if (configOrInstance) {
      this.axiosInstance = axios.create(this.getAxiosRequestConfig(configOrInstance));
    } else {
      this.axiosInstance = axios;
    }
  }

  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.request<T>(this.getAxiosRequestConfig(config));
  }

  get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.get<T>(url, this.getAxiosRequestConfig(config));
  }

  post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.post<T>(url, data, this.getAxiosRequestConfig(config));
  }

  put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.put<T>(url, data, this.getAxiosRequestConfig(config));
  }

  delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.delete<T>(url, this.getAxiosRequestConfig(config));
  }

  patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, this.getAxiosRequestConfig(config));
  }

  head<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.head<T>(url, this.getAxiosRequestConfig(config));
  }

  options<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.axiosInstance.options<T>(url, this.getAxiosRequestConfig(config));
  }

  private getAxiosRequestConfig(config: HttpRequestConfig): AxiosRequestConfig {
    if (!config) return null;

    if (config.validErrorStatuses && !config.validateStatus) {
      config.validateStatus = validateStatusCodes(...config.validErrorStatuses)
    }

    return config;
  }
}

/** type guard to check if parameter is an Axios instance */
function isAxiosInstance(instance: any): instance is AxiosInstance {
  return instance && instance.request && instance.get && instance.put && instance.post && instance.delete;
}