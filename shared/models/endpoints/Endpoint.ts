
export interface Endpoint {

  // Endpoint Id - should be a guid
  endpointId: string,

  // Tenant Id - the id of the tenant that owns the endpoint
  tenantId: string,

  // Network Id - the id of the network that the endpoint is for
  networkId: string,

  // Active - an indicator as to whether the endpoint is active or not
  active: boolean,

  // Alias - an optional name that a customer could use to identify a specific endpoint
  alias?: string,

  // Token - an optional token that a customer wants to use as added security on their endpoint
  token?: string,

  // Description - an optioanl description of the endpoint
  description?: string,

}

export interface EndpointWithUrl extends Endpoint {

  // Endpoint URL - the endpoint url, which is calculated by the service and is not stored as it could change
  endpointUrl: string
}

