import { getApiUrl } from "@src/platform/utils";
import axios from "axios";
import { IApiResult } from "@blockspaces/shared/models/ApiResult";



export async function getSystemFlags(): Promise<Array<any>> {
  const { data: apiResult } = await axios.get<IApiResult<Array<any>>>(
    getApiUrl("/feature-flags/system-flags")
  );
  return apiResult.data;
}