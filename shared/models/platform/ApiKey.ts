export interface ApiKey {
  id: string, /* GUID */
  tenant_id: string, /* Tenant ID GUID */
  name: string, /* Name given to the API Key for differentiation */
  description: string, /* Description given to the API Key for reference */
  application: string, /* Name of the application the API Key is for - Cyclr in this case */
  hash: string, /* SHA2 hash of the TenantId.API Key for verification */
  active: boolean, /* Active indicator used to determine the activeness of an API Key */
  expiration_date?: string /* The expiration date of the API Key */
}
