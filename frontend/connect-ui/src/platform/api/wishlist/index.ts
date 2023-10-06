import axios from "axios";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Network } from "@blockspaces/shared/models/networks";
import { getApiUrl } from "@platform/utils";
import { Wishlist } from "@blockspaces/shared/models/wishlist";

export async function getMine(): Promise<Wishlist[]> {
  const { data: apiResult } = await axios.get<ApiResult<Wishlist[]>>(getApiUrl("/wishlist/mine"))
  return apiResult.data;
}


export async function useAddToWishlist(connectorId, offerId, networkId): Promise<Wishlist> {
  const { data: apiResult } = await axios.post<ApiResult<Wishlist>>(getApiUrl("/wishlist/create"), {
    connectorId: connectorId,
    offerId: offerId,
    networkId: networkId
  })


  return apiResult.data;
}

