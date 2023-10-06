export enum ApiResultStatus {
  Success = "success",
  Failed = "failed"
}

export interface IApiResult<T = any> {
  status: ApiResultStatus | `${ApiResultStatus}`,
  data?: T,
  message?: string
}

export default class ApiResult<TData = any> implements IApiResult<TData> {

  /** Create a failed API result */
  static failure<TData = any>(message: string = "", data: TData = undefined) {
    return new ApiResult({
      status: ApiResultStatus.Failed,
      message,
      data
    })
  }

  /** Create a successful API result */
  static success<TData = any>(data: TData = null, message: string = undefined) {
    return new ApiResult({
      status: ApiResultStatus.Success,
      data,
      message
    });
  }

  /** Reconstruct an API result from JSON */
  static fromJson<TData = any>(json: IApiResult<TData>): ApiResult<TData> {
    return new ApiResult(json);
  }

  static isApiResult(resultData: any): resultData is IApiResult {
    if (!resultData) return false;

    return resultData.status && (resultData.status === ApiResultStatus.Success) || (resultData.status === ApiResultStatus.Failed);
  }

  status: ApiResultStatus | `${ApiResultStatus}`;
  data?: TData extends object ? {[Property in keyof TData]: TData[Property]} : TData;
  message?: string;

  protected constructor(resultJson: Partial<IApiResult<TData>> = {}) {
    this.status = ApiResultStatus.Success;
    Object.assign(this, resultJson)
  }

  get isSuccess() {
    return this.status === ApiResultStatus.Success;
  }

  get isFailure() {
    return this.status === ApiResultStatus.Failed;
  }

  get asJson(): IApiResult {
    return {
      status: this.status,
      data: this.data
    }
  }
}

/**
 * Use this as a base class when the API returns a different data struct for an Error then a Success response. 
 */
export class ApiResultWithError<T = any, E = any> extends ApiResult<T>{
  error?: E
  protected constructor(resultJson: Partial<IApiResult<T>> = {}, error: E) {
    super(resultJson);
    this.error = error;
  }
  static override  failure<E = any>(message: string = "", error: E = undefined) {
    return new ApiResultWithError({
      status: ApiResultStatus.Failed,
      message,
    }, error)
  }
}


// #######################
// # Convenience Types
// #######################

/** Alias for a promise that resolves to an `ApiResult<T>` */
export type AsyncApiResult<T = any> = Promise<ApiResult<T>>;

/** Alias for a promise that resolves to an `ApiResultWithError<T, TErr>` */
export type AsyncApiResultWithError<T = any, TErr = any> = Promise<ApiResultWithError<T, TErr>>;