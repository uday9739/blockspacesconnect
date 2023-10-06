import { Cart } from "@blockspaces/shared/models/cart";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { OnchainQuote, InvoiceReference, QuoteReference, PaymentReference, BalanceReference, PriceReference, ChannelActivityReference, BitcoinTxnReference, OnchainInvoice } from "@blockspaces/shared/models/lightning/Invoice";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { NetworkCuratedResources, NetworkOffering } from "@blockspaces/shared/models/network-catalog";
import { NetworkPrice } from "@blockspaces/shared/models/network-catalog/NetworkPrice";
import { Network, UserNetwork } from "@blockspaces/shared/models/networks";
import { UserNetworkOptimism } from "@blockspaces/shared/models/networks/OptimismNetwork";
import { ConnectSubscription, ConnectSubscriptionInvoice } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { IUser, GatewayUserData, UnregisteredUser, RevokedToken } from "@blockspaces/shared/models/users";
import { Injectable, Optional } from "@nestjs/common";
import mongoose from "mongoose";
import { MongooseDataContext } from "../../datacontext/services/MongooseDataContext";
import { MongooseRepository } from "../../datacontext/services/MongooseRepository";
import * as schemas from "../schemas";
import { TaskQueueItem } from "@blockspaces/shared/models/task-queue/TaskQueueItem";
import { Endpoint } from "@blockspaces/shared/models/endpoints/Endpoint";
import { NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog/NetworkPriceBillingCatelog";
import { Notification } from "@blockspaces/shared/models/platform";
import { ExternalIntegration } from "@blockspaces/shared/models/external-integration";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { ApiKey } from "@blockspaces/shared/models/platform";
import { ApiKeyDocument } from "../schemas";
import { WebhookSubscription, WebhookEventRecord } from "@blockspaces/shared/models/webhooks/WebhookTypes";
import { BillingTier } from "@blockspaces/shared/models/network-catalog/Tier";
import { Wishlist } from "@blockspaces/shared/models/wishlist";
import { Connectors, NetworkConnectorIntegration } from "@blockspaces/shared/models/connectors";
import AdminPortalUser from "src/datacontext/dtos/AdminPortalUser";
import { AdminPortalUserSchema } from "../schemas/AdminPortalUserSchema";
import { ConnectDbConnectionManager } from "./ConnectDbConnectionManager";


/** Provides access to Mongoose models tied to the BlockSpaces Connect MongoDB instance */
@Injectable()
export class ConnectDbDataContext extends MongooseDataContext {
  readonly lightningInvoices: MongooseRepository<InvoiceReference>;
  readonly lightningNodes: MongooseRepository<LightningNodeReference>;
  readonly lightningQuotes: MongooseRepository<QuoteReference>;
  readonly lightningPayments: MongooseRepository<PaymentReference>;
  readonly lightningBalances: MongooseRepository<BalanceReference>;
  readonly lightningChannelActivity: MongooseRepository<ChannelActivityReference>;
  readonly bitcoinPrices: MongooseRepository<PriceReference>;
  readonly bitcoinTransactions: MongooseRepository<BitcoinTxnReference>;
  readonly bitcoinQuotes: MongooseRepository<OnchainQuote>;
  readonly bitcoinInvoices: MongooseRepository<OnchainInvoice>;
  readonly networks: MongooseRepository<Network, string>;
  readonly tenants: MongooseRepository<Tenant>;
  readonly endpoints: MongooseRepository<Endpoint>;
  readonly systemMaintenance: MongooseRepository<any>;

  readonly erpObjects: MongooseRepository<ErpObject>;

  /**
   * Provides data access for users, using the {@link UnregisteredUser} data model
   *
   * WARNING: this repository ultimately provides access to the same data as {@link adminPortalUsers},
   * but has looser validation rules. Use with caution, and use only when needing to work specifically with
   * users that have not completed the registration process.
   */

  readonly userNetworks: MongooseRepository<UserNetwork>;
  readonly userSecrets: MongooseRepository<ICredentialReference>;
  readonly gatewayUser: MongooseRepository<GatewayUserData>;
  readonly optimismNetwork: MongooseRepository<UserNetworkOptimism>;
  readonly cart: MongooseRepository<Cart>;
  readonly networkPrices: MongooseRepository<NetworkPrice>;
  readonly networkOfferings: MongooseRepository<NetworkOffering>;
  readonly connectSubscriptions: MongooseRepository<ConnectSubscription>;
  readonly connectSubscriptionInvoices: MongooseRepository<ConnectSubscriptionInvoice>;
  readonly networkCuratedResources: MongooseRepository<NetworkCuratedResources>
  readonly taskQueueItems: MongooseRepository<TaskQueueItem>;
  readonly networkPriceBillingCategories: MongooseRepository<NetworkPriceBillingCategory>;
  readonly notifications: MongooseRepository<Notification>;
  readonly externalIntegration: MongooseRepository<ExternalIntegration>;
  readonly apikeys: MongooseRepository<ApiKey>;
  readonly webhookSubscription: MongooseRepository<WebhookSubscription>;
  readonly webhookEvent: MongooseRepository<WebhookEventRecord>;
  readonly billingTier: MongooseRepository<BillingTier>;
  readonly wishlist: MongooseRepository<Wishlist>;
  readonly connectors: MongooseRepository<Connectors>;
  readonly networkConnectorIntegrations: MongooseRepository<NetworkConnectorIntegration>;
  readonly revokedTokens: MongooseRepository<RevokedToken>;
  readonly adminPortalUsers: MongooseRepository<AdminPortalUser>;


  // TODO update constructor to allow Mongoose connection to be injected (BSPLT-1025)
  constructor(
  ) {
    super(mongoose.connection);
    // init models and repositories
    this.networks = this.createRepository("Network", schemas.NetworkSchema);
    this.tenants = this.createRepository("Tenant", schemas.TenantSchema);
    this.userSecrets = this.createRepository("UserSecret", schemas.UserSecretSchema);

    // TODO rename Lightning schemas to match model names (ditch the pluralized names)
    this.lightningNodes = this.createRepository<LightningNodeReference>("LightningNode", schemas.LightningNodesSchema);
    this.lightningQuotes = this.createRepository<QuoteReference>("LightningQuote", schemas.LightningQuotesSchema);
    this.lightningInvoices = this.createRepository<InvoiceReference>("LightningInvoice", schemas.LightningInvoicesSchema);
    this.lightningPayments = this.createRepository<PaymentReference>("LightningPayment", schemas.LightningPaymentsSchema);
    this.lightningBalances = this.createRepository<BalanceReference>("LightningBalances", schemas.LightningBalancesSchema);
    this.lightningChannelActivity = this.createRepository<ChannelActivityReference>("LightningChannelActivity", schemas.LightningChannelActivitySchema);
    this.bitcoinPrices = this.createRepository<PriceReference>("BitcoinPrices", schemas.BitcoinPricesSchema);
    this.bitcoinTransactions = this.createRepository<BitcoinTxnReference>("BitcoinTransactions", schemas.BitcoinTxnSchema);
    this.bitcoinQuotes = this.createRepository<OnchainQuote>("BitcoinQuotes", schemas.BitcoinQuoteSchema);
    this.bitcoinInvoices = this.createRepository<OnchainInvoice>("BitcoinInvoices", schemas.BitcoinInvoiceSchema);

    this.erpObjects = this.createRepository<ErpObject>("ErpObject", schemas.ErpObjectSchema);

    this.userNetworks = this.createRepository(schemas.USER_NETWORKS_SCHEMA_NAME, schemas.UserNetworkSchema);
    this.cart = this.createRepository<Cart>("Cart", schemas.CartSchema);
    this.networkPrices = this.createRepository<NetworkPrice>("NetworkPrice", schemas.NetworkPriceSchema);
    this.networkOfferings = this.createRepository<NetworkOffering>("NetworkOffering", schemas.NetworkOfferingSchema);
    this.networkCuratedResources = this.createRepository<NetworkCuratedResources>("NetworkCuratedResources", schemas.NetworkCuratedResourcesSchema)
    this.connectSubscriptions = this.createRepository<ConnectSubscription>("ConnectSubscription", schemas.ConnectSubscriptionSchema);
    this.connectSubscriptionInvoices = this.createRepository<ConnectSubscriptionInvoice>("ConnectSubscriptionInvoice", schemas.ConnectSubscriptionInvoiceSchema);
    this.taskQueueItems = this.createRepository<TaskQueueItem>("TaskQueueItem", schemas.TaskQueueItemSchema);
    this.endpoints = this.createRepository<Endpoint>("Endpoints", schemas.EndpointSchema);
    this.networkPriceBillingCategories = this.createRepository<NetworkPriceBillingCategory>("NetworkPriceBillingCategory", schemas.NetworkPriceBillingCategorySchema);
    this.notifications = this.createRepository<Notification>("Notification", schemas.NotificationSchema);
    this.systemMaintenance = this.createRepository("SystemMaintenance", schemas.SystemMaintenanceSchema);
    this.externalIntegration = this.createRepository("ExternalIntegration", schemas.ExternalIntegrationSchema);
    this.apikeys = this.createRepository("ApiKey", schemas.ApiKeySchema);
    this.webhookSubscription = this.createRepository("WebhookSubscription", schemas.WebhookSubscriptionSchema);
    this.webhookEvent = this.createRepository("WebhookEvent", schemas.WebhookEventSchema);
    this.billingTier = this.createRepository("BillingTier", schemas.BillingTierSchema);
    this.wishlist = this.createRepository("Wishlist", schemas.WishlistSchema);
    this.connectors = this.createRepository("Connector", schemas.ConnectorSchema);
    this.networkConnectorIntegrations = this.createRepository("NetworkConnectorIntegration", schemas.NetworkConnectorIntegrationSchema);
    this.revokedTokens = this.createRepository("RevokedToken", schemas.RevokedTokenSchema)
    //this.adminPortalUsers = this.createRepository<AdminPortalUser>("AdminPortalUser", AdminPortalUserSchema);

    //
  }
}
