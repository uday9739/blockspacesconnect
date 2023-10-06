import ApiResult, { IApiResult } from "@blockspaces/shared/models/ApiResult"
import { ExternalLightningOnboardingStep, LightningNodeReference } from "@blockspaces/shared/models/lightning/Node"
import axios from "axios"

export const addExternalNode = async (macaroon: string, endpoint: string, certificate: string): Promise<IApiResult<LightningNodeReference>> => {
  const response = await axios.post("/api/networks/lightning/onboard/external/create", { macaroon, endpoint, certificate })

  return ApiResult.fromJson(response.data)
}

export const externalHeyhowareya = async (): Promise<ApiResult<ExternalLightningOnboardingStep>> => {
  const response = await axios.get("/api/networks/lightning/onboard/external/heyhowareya")

  return ApiResult.fromJson(response.data)
}

export const checkMacaroonPermissions = async (macaroon: string, endpoint: string, certificate: string): Promise<IApiResult<any>> => {
  const response = await axios.post("/api/networks/lightning/lnd/permissions", { macaroon, endpoint, certificate })

  return ApiResult.fromJson(response.data)
}