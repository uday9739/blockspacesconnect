import { config } from "dotenv";
import * as path from "path";
import { getEnvDefault, getEnvRequired } from "./env.utils";
import { LndInterfaceType } from "@blockspaces/shared/types/lightning";

// this is a hack to load package.json w/o copying it to TS output directory; this will break if module type is not commonjs
const packageDotJson = require(path.join(process.cwd(), "package.json"));

// Load .env file or for tests the .env.test file
config({ path: path.join(process.cwd(), `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`) });

/**
 * Environment variables
 *
 * When possible, environment variable data should be injected rather than accessed statically,
 * to increase testability.
 *
 * Injection Example:
 * ```
 * constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {}
 * ```
 */
export const env = {
  node: process.env.NODE_ENV || "development",
  isStaging: process.env.NODE_ENV === "staging",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  isDevelopment: process.env.NODE_ENV === "development",
  pid: process.pid,
  admin: {
    id: getEnvRequired("ADMIN_USERID"),
    tenant: getEnvRequired("ADMIN_TENANT"),
    email: getEnvRequired("ADMIN_EMAIL"),
  },
  app: {
    name: getEnvRequired("APP_NAME"),
    version: packageDotJson.version,
    description: packageDotJson.description,
    url: getEnvRequired("BLOCKSPACES_SERVICES_URL"),
    port: getEnvRequired("BLOCKSPACES_SERVICES_PORT"),
    axiosTimeout: Number(getEnvRequired("AXIOS_TIMEOUT"))
  },
  backend: {
    backendGrpcUrl: getEnvRequired("SERVER_URL"),
    backendGrpcPort: getEnvRequired("SERVER_PORT"),
    adminEmail: getEnvRequired("ADMIN_EMAIL"),
    adminUserId: getEnvRequired("ADMIN_USERID"),
    adminTenantId: getEnvRequired("ADMIN_TENANT"),
    httpCookieSig: getEnvRequired("HTTP_COOKIE_SIG")
  },
  vault: {
    vaultApiUrl: getEnvRequired("VAULT_API_URL"),
    vaultAccessorID: getEnvRequired("VAULT_ACCESSOR_ID"),
    vaultJWTPath: getEnvRequired("VAULT_JWT_PATH"),
    vaultConnectPath: getEnvRequired("VAULT_CONNECT_PATH"),
    vaultClientPath: getEnvRequired("VAULT_CLIENT_PATH"),
    vaultAppSecreteId: getEnvRequired("VAULT_APP_SECRET_ID"),
    vaultAppRoleId: getEnvRequired("VAULT_APP_ROLE_ID")
  },
  appId: {
    oauthBaseUrl: getEnvRequired("OAUTH_BASE_URL"),
    oauthClientId: getEnvRequired("OAUTH_CLIENT_ID"),
    oauthTenantId: getEnvRequired("OAUTH_TENANT_ID"),
    oauthSecret: getEnvRequired("OAUTH_SECRET"),
    oauthPublicKey: getEnvRequired("OAUTH_PUBLIC_KEY"),
    iamBaseUrl: getEnvRequired("IAM_BASE_URL"),
    iamApiKey: getEnvRequired("IAM_APIKEY"),
    enableEmailConfirmation: getEnvRequired("ENABLE_EMAIL_CONFIRMATION") === "true" ? true : false
  },
  aws: {
    awsAccessKeyId: getEnvRequired('AWS_ACCESS_KEY_ID'),
    awsSecretAccessKey: getEnvRequired('AWS_SECRET_ACCESS_KEY'),
    awsRegion: getEnvRequired('AWS_REGION'),
    snsTopicArn: getEnvRequired('SNS_TOPIC_ARN'),
  },
  // jobService: {
  //   agendaDbConnectString: getEnvRequired("AGENDA_CONNECT_STRING"),
  //   agendaProcessInterval: getEnvRequired("AGENDA_PROCESS_INTERVAL"),
  //   port: getEnvRequired("JOBSERVER_PORT"),
  //   url: getEnvRequired("JOBSERVER_URL")
  // },
  database: {
    mongoConnectString: getEnvRequired("MONGO_CONNECT_STRING"),
    casbinDbConnectString: getEnvRequired("CASBIN_DB_CONNECT_STRING"),
    serviceCatalogDbConnectString: getEnvRequired("CATALOG_DB_CONNECT_STRING"),
    nodeMonitoringDbConnectString: getEnvRequired("NODE_MONITORING_DB_CONNECT_STRING"),
    keepAlive: getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE") === "true" ? true : false,
    keepAliveInitialDelay: parseInt(getEnvRequired("MONGO_CONNECTION_KEEP_ALIVE_INITIAL_DELAY"))
  },
  policyManager: {
    casbinModel: getEnvRequired("CASBIN_MODEL_FILE")
  },
  log: {
    level: getEnvRequired("LOG_LEVEL"),
    logFile: getEnvRequired("LOG_FILE"),
    logTransactionFile: getEnvRequired("LOG_TRANSACTION_FILE")
  },
  lightning: {
    btcPriceUrl: getEnvRequired("BTC_PRICE_URL"),
    fallbackPriceUrl: getEnvRequired("FALLBACK_PRICE_URL"),
    cryptoCompareKey: getEnvRequired("CRYPTO_COMPARE_KEY"),
    ben1ChannelMacaroon: getEnvRequired("BEN1_CHANNEL_MACAROON"),
    ben1RestEndpoint: getEnvRequired("BEN1_REST_URL"),
    ben2ChannelMacaroon: getEnvRequired("BEN2_CHANNEL_MACAROON"),
    ben2RestEndpoint: getEnvRequired("BEN2_REST_URL"),
    testnodeApi: getEnvRequired("TESTNODE_API"),
    maxNodePoolSize: getEnvRequired("MAX_NODE_POOL_SIZE"),
  },
  quickbooks: {
    clientId: getEnvRequired("QBO_CLIENT_ID"),
    clientSecret: getEnvRequired("QBO_CLIENT_SECRET"),
    callbackUrl: getEnvRequired("QBO_CALLBACK_URL"),
    environment: getEnvRequired("QBO_ENVIRONMENT"),
    apiBaseUrl: getEnvRequired("QBO_API_BASE_URL"),
    blockspace: {
      clientId: getEnvRequired("QBO_BLOCKSPACE_ID"),
      clientSecret: getEnvRequired("QBO_BLOCKSPACE_SECRET"),
      secretCredentialId: getEnvRequired("QBO_BLOCKSPACE_SECRET_CREDENTIAL_ID")
    },
  },
  poktGateway: {
    poktGatewayApiBaseUrl: getEnvDefault("POKT_GATEWAY_API_URL", "https://backend.mainnet.portal.pokt.network/api"),
    poktGatewayRelayUrlPart: getEnvDefault("POKT_GATEWAY_URL_PART", "gw.blockspaces.us/v1/lb")
  },
  stripe: {
    publishableKey: getEnvRequired('STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvRequired('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvRequired('STRIPE_WEBHOOK_SECRET'),
    autoApplyLightningCoupon: getEnvRequired('STRIPE_AUTO_APPLY_LIGHTING_COUPON'),
    lightningCouponCode: getEnvRequired('STRIPE_LIGHTING_COUPON')
  },
  hubspot: {
    hubspotApiKey: getEnvRequired('HUBSPOT_API_TOKEN'),
    hubspotFormsApiEndpoint: getEnvRequired('HUBSPOT_FORMS_API_ENDPOINT'),
    hubspotPortalId: getEnvRequired('HUBSPOT_PORTAL_ID'),
    hubspotWishlistFormsGuid: getEnvRequired('HUBSPOT_WISHLIST_FORM_GUID'),
  },
  protocolRouter: {
    baseUrl: getEnvRequired('PROTOCOL_ROUTER_BASE_URL'),
    apiUrl: getEnvRequired('PROTOCOL_ROUTER_API_URL'),
    username: getEnvRequired('PROTOCOL_ROUTER_USERNAME'),
    password: getEnvRequired('PROTOCOL_ROUTER_PASSWORD'),
    mapFile: getEnvRequired('PROTOCOL_ROUTER_MAPFILE')
  },
  cyclr: {
    oauthBaseUrl: getEnvRequired('CYCLR_OAUTH_BASE_URL'),
    baseUrl: getEnvRequired('CYCLR_BASE_URL'),
    clientId: getEnvRequired('CYCLR_CLIENT_ID'),
    clientSecret: getEnvRequired('CYCLR_CLIENT_SECRET'),
    grantType: getEnvDefault('CYCLR_OAUTH_GRANT_TYPE', 'client_credentials'),
    domain: getEnvRequired('CYCLR_DOMAIN'),
    callbackBaseUrl: getEnvRequired('CYCLR_CALLBACK_BASE_URL'),
    webhookUrl: getEnvDefault('CYCLR_WEBHOOK_URL', 'https://blockspaces-h.cyclr.com/api/partnerwebhook/2pQVhyhE'),
  },
  jira: {
    host: 'https://blockspaces.atlassian.net',
    email: getEnvRequired('JIRA_AUTH_EMAIL'),
    apiToken: getEnvRequired('JIRA_AUTH_TOKEN'),
  },
  google: {
    recaptchaSiteKey: getEnvRequired('GOOGLE_RECAPTCHA_KEY'),
    recaptchaSiteApiKey: getEnvRequired('GOOGLE_RECAPTCHA_API_KEY'),
  },
  sendgrid: {
    apiKey: getEnvRequired('SENDGRID_APIKEY')
  },
};

/** A convenience type used for strongly typing environment variables */
export type EnvironmentVariables = typeof env;

/**
 * A token/key used for injecting environment variables
 *
 * Example:
 * ```
 * constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables) {}
 * ```
 */
export const ENV_TOKEN = Symbol("env");
