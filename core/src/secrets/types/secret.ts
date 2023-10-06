

import * as pathLib from 'path';

/** A secret stored in a secure secret storage location (i.e. Hashicorp Vault) */
export interface Secret<TData> {
  /** path to the secret */
  path: string;
  /** the secret data */
  data?: TData;
}

/** additional parts to add on to a secret path */
export interface SecretPathAddons {
  secretId: string;
  /** part to add to the beginning of the path */
  pathPrefix?: string;
  /** part to add to the end of the path */
  subpath?: string;
}

/** the types of secrets that can be stored */
export enum SecretType {
  "QUICKBOOKS" = "quickbooks",
  "Macaroon" = "macaroon"
}

/** A tenant-level secret */
export class TenantSecret<TData = any> implements Secret<TData> {
  readonly path: string;
  data: TData;

  /**
   * Creates a new tenant-level secret.
   *
   * The secret path will be constructed based on the secret type and tenant id
   *
   * @param secretType the type of secret
   * @param tenantId Tenant ID
   * @param pathAddons optional parts to add to the path
   */
  constructor(readonly secretType: SecretType, readonly tenantId: string, pathAddons: SecretPathAddons) {
    this.path = this.createPath(tenantId, pathAddons);
  }

  private createPath(tenantId: string, pathAddons: SecretPathAddons): string {
    // add logic here to combine the tenant id and the “addons” to construct a path;
    // this is total pseudo-code; not tested or verified; just for demo purposes;
    // real code might use a global prefix instead of “/” at beginning
    return pathLib.join(pathAddons.pathPrefix || "connect/data", "tenant/", tenantId, pathAddons?.subpath || "", pathAddons.secretId);
  }
}

/** A user-level secret */
export class UserSecret<TData = any> extends TenantSecret<TData> {

  /**
   * Creates a new user-level secret.
   * The secret path will be constructed based on the secret type, tenant id, and user id
   *
   * @param secretType the type of secret
   * @param tenantId the tenant id
   * @param userId user id
   * @param pathAddons options parts to add to the path
   */
  constructor(
    secretType: SecretType,
    tenantId: string,
    readonly userId: string,
    pathAddons: SecretPathAddons
  ) {
    // add the user id on to the path
    pathAddons.subpath = pathLib.join("user/", userId, pathAddons.subpath || "");
    super(secretType, tenantId, pathAddons);
  }
}
