import ApiResult from '@blockspaces/shared/models/ApiResult';
import axios, { AxiosError, AxiosInstance } from "axios";
import {ApiErrorResult} from '@platform/types';

/**
 * Applies default configuration to a given axios instance.
 */
export function setAxiosDefaults(axiosInstance: AxiosInstance): void {
  if (!axiosInstance) return;

  axiosInstance.defaults.timeout = 30 * 1000; // 30s
}

/**
 * Adds a response interceptor that will transform error responses (non-2xx) in the shape of {@link ApiResult}
 * to an {@link ApiErrorResult} type that can be caught and used to determine the type of error response returned from the server
 *
 * @param axiosInstance an instance of the axios HTTP client
 */
export function useApiErrorResultInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance?.interceptors.response.use((response) => response, handleResponseError);
}

/**
 * Adds a request interceptor that will transform error responses (non-2xx) in the shape of {@link ApiResult}
 * to an {@link ApiErrorResult} type that can be caught and used to determine the type of error response returned from the server
 *
 * @param axiosInstance an instance of the axios HTTP client
 */
export function useApiErrorRequestInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance?.interceptors.request.use((response) => response, handleRequestError);
}


/**
 * Extract result data from a response with an HTTP error status (non-200s)
 * and make Axios return it, in a rejected promise, instead of an AxiosError.
 *
 * If the response is not the standard result expected from the backend API (core),
 * then the original error will simply be returned in a rejected promise.
 *
 * Where possible, specific error result classes will be used that correspond to the
 * HTTP status code (i.e. ApiForbiddenResult for a 403 status).
 * Otherwise, the ApiErrorResult class will be used
 */
function handleResponseError(err: AxiosError) {
  if (!ApiResult.isApiResult(err.response?.data)) {
    return Promise.reject(err);
  }

  const { status: statusCode, data: apiResult } = err.response;
  //useErrorHandler({ error: err.response, statusCode, errorInfo: err.response, errorType: 'axios response full' });
  return Promise.reject(ApiErrorResult.create(statusCode, apiResult));
}

function handleRequestError(err: AxiosError) {
  return Promise.reject(err);
}

// set global defaults
setAxiosDefaults(axios);
useApiErrorResultInterceptor(axios);
useApiErrorRequestInterceptor(axios);