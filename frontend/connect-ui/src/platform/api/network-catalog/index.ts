import axios from "axios";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Network } from "@blockspaces/shared/models/networks";
import { getApiUrl } from "@platform/utils";
import { NetworkOffering, NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog";

export async function fetchCatalog(): Promise<Network[]> {
  const { data: apiResult } = await axios.get<ApiResult<Network[]>>(getApiUrl("/network-catalog"))
  return apiResult.data;
}

export async function getNetworkCatalogCategories(): Promise<NetworkPriceBillingCategory[]> {
  const { data: apiResult } = await axios.get<ApiResult<NetworkPriceBillingCategory[]>>(getApiUrl("/network-catalog/categories"))
  return apiResult.data;
}

export async function getActiveNetworkOfferings(): Promise<NetworkOffering[]> {
  const { data: apiResult } = await axios.get<ApiResult<NetworkOffering[]>>(getApiUrl("/network-catalog/active-offers"))
  return apiResult.data;
}