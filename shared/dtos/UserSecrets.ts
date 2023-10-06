interface CreateSecretDto {
  label: string;
  description: string;
  credential: any;
  userId: string;
  tenantId: string;
  credentialId?: string;
  subPath?: string;
}

interface ReadSecretDto {
  credentialId: string;
  tenantId: string;
}

interface UseSecretDto {
  userId: string;
  tenantId: string;
  credentialId: string;
  description: string;
  subPath?: string;
}

interface UpdateSecretDto {
  credentialId: string;
  tenantId: string;
  newCredential: {};
}
interface ListSecretDto {
  connectorId: string;
  tenantId: string;
}

export type { CreateSecretDto, UpdateSecretDto, ReadSecretDto, UseSecretDto, ListSecretDto };
