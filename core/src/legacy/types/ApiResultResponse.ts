import { Response } from "express"
import ApiResult from "@blockspaces/shared/models/ApiResult"


/** alias for an express.js Response that returns an ApiResult with a given type for the data property (TData) */
type ApiResultResponse<TData = any> = Response<ApiResult<TData>>;
export default ApiResultResponse;