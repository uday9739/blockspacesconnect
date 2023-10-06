import axios, { AxiosResponse } from "axios"
import { Agent } from "https"

export const get = async <T>(url: string, endpoint: string, cert: string, macaroon: string, params?: Object): Promise<AxiosResponse<T>> => {
  let agent: Agent
  if (cert) {
    const certificate = Buffer.from(cert, "hex")
    agent = new Agent({ cert: certificate })
  }
  try {
    const response = await axios.request({
      method: "GET",
      baseURL: url,
      url: endpoint,
      httpsAgent: agent,
      params: params,
      headers: {
        "Grpc-Metadata-macaroon": macaroon
      }
    })
    return response
  } catch (e) {
    return e.response
  }
}

export const post = async <T>(url:string, endpoint: string, cert: string, macaroon: string, body?: Object): Promise<AxiosResponse<T>> => {
  let agent: Agent
  if (cert) {
    const certificate = Buffer.from(cert, "hex")
    agent = new Agent({ cert: certificate })
  }
  try {
    const response = await axios.request({
      method: "POST",
      baseURL: url,
      url: endpoint,
      httpsAgent: agent,
      data: body,
      headers: {
        "Grpc-Metadata-macaroon": macaroon
      }
    })

    return response
  } catch (e) {
    return e.response
  }
}