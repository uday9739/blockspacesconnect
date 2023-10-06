import axios from "axios";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { getApiUrl } from "@platform/utils";

export async function fetchCyclr(): Promise<string> {
  const { data: apiResult } = await axios.post<ApiResult<string>>(getApiUrl("/integrations/embed-link"))
  return apiResult.data;
}