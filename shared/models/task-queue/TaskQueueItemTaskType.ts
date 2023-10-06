export enum TaskQueueItemTaskType {
  REPORT_SUBSCRIPTION_USAGE = 'REPORT_SUBSCRIPTION_USAGE',
  BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH = 'BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH',
  SUBSCRIPTION_NETWORK_TERMINATION = 'SUBSCRIPTION_NETWORK_TERMINATION',
  SUBSCRIPTION_TERMINATION = 'SUBSCRIPTION_TERMINATION',
  E2E_PURGE_TEST_USER = 'E2E_PURGE_TEST_USER',
  LIGHTNING_NODE_REFRESH_ALL_OBJECTS = 'LIGHTNING_NODE_REFRESH_ALL_OBJECTS',
  BIP_NODE_TERMINATION = 'BIP_NODE_TERMINATION',
  FREE_TIER_WEB3_ENDPOINTS_DAILY_CHECK = 'FREE_TIER_WEB3_ENDPOINTS_DAILY_CHECK',
  REVOKED_JWT_EXPIRY_CHECK = 'REVOKED_JWT_EXPIRY_CHECK',
  CHECK_PROVISION_NODES = 'CHECK_PROVISION_NODES',
  LOCKED_NODES_CHECK = 'LOCKED_NODES_CHECK',
}