import ApiResult from "@blockspaces/shared/models/ApiResult";
import { getApiUrl } from "@src/platform/utils";
import axios from "axios";


export async function getTenantMembers(getOrgDto: {tenantId: string}): Promise<void> {
  const { data: apiResult } = await axios.get<ApiResult<void>>(
    getApiUrl(`/tenant/${getOrgDto.tenantId}`)
  );
  return apiResult.data;
}