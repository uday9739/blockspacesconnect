import ApiResult, { IApiResult } from '@blockspaces/shared/models/ApiResult';
import { StatusCodes } from "http-status-codes";

/** A general error result returned from the API */
export default class ApiErrorResult<T = any> extends ApiResult<T> {
  /** HTTP status code of the response */
  statusCode: number;

  constructor(statusCode: number, apiResult: Partial<IApiResult<T>>) {
    super(apiResult);
    this.statusCode = statusCode;
  }

  /**
   * Constructs a new error result, returning the most specific type possible for the given error code
   *
   * @param statusCode the HTTP status code associated with the error
   * @param apiResult the original result data returned from the API
   */
  static create<T = any>(statusCode: number, apiResult: Partial<IApiResult<T>>): ApiErrorResult<T> {
    switch (statusCode) {
      // HTTP 401 (Unauthorized)
      case StatusCodes.UNAUTHORIZED:
        return new ApiUnauthorizedResult<T>(apiResult);

      // HTTP 403 (Forbidden)
      case StatusCodes.FORBIDDEN:
        return new ApiForbiddenResult<T>(apiResult);

      // all status codes that do not have a specific error type
      default:
        return new ApiErrorResult<T>(statusCode, apiResult);
    }
  }
}

/** An HTTP 403 (Forbidden) result returned from the API  */
export class ApiForbiddenResult<T = any> extends ApiErrorResult<T> {
  constructor(apiResult: Partial<IApiResult<T>>) {
    super(StatusCodes.FORBIDDEN, apiResult);
  }
}

/** An HTTP 401 (Unauthorized) result returned from the API  */
export class ApiUnauthorizedResult<T = any> extends ApiErrorResult<T> {
  constructor(apiResult: Partial<IApiResult<T>>) {
    super(StatusCodes.UNAUTHORIZED, apiResult);
  }
}

// Add new specific error result classes here, using similar pattern to one's above