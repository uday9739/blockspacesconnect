import ApiResult from '@blockspaces/shared/models/ApiResult';
import { getApiUrl } from 'src/platform/utils';
import axios from 'axios';
import { PlatformApiResponse } from '@blockspaces/shared/models/platform';


export async function platformCheck() {
  const results = await axios.get<ApiResult<PlatformApiResponse>>(
    getApiUrl("platform/status/detailed"))
  return ApiResult.success(results.data.data);
}

