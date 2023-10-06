export interface VaultResult<T> {
  data?: T;
  request_id: string;
  lease_id: string;
  renewable: boolean;
  lease_duration: number;

  // TODO add proper typings
  auth?: any;
  wrap_info?: any;
  warnings?: any;
}

export interface Entity {
  id: string;
  name: string;
  metadata: Record<string, any>;
  aliases?: Array<EntityAlias> | null;
}

export interface EntityAlias {
  /** the entity alias ID */
  id: string;

  /** the ID of the entity this alias is associated with */
  canonical_id: string;

  name: string;
  metadata?: Record<string, any>;
  mount_accessor?: string;
  mount_path?: string;
  mount_type?: string;
  last_update_time?: string;
  creation_time?: string;
}

export interface Group {
  name: string;
  id: string;
  alias?: GroupAlias
}

export interface GroupAlias {
  name: string;
  id: string;
  canonical_id: string;
}

/** Parameters for the request to create a group via the Vault API */
export interface CreateGroupParams {
  name?: string;
  id?: string;
  policies?: string[];
  type?: "internal" | "external";
  metadata?: Record<string, any>;
  member_entity_ids?: string[];
  member_group_ids?: string[];
}