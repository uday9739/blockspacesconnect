import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { NotFoundException, ValidationException } from "../../exceptions/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { StripeService } from "../../stripe/services/StripeService";
import { Network, NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { IUser } from "@blockspaces/shared/models/users";
import { ConnectSubscription, PaymentMethod, ConnectSubscriptionStatus, ConnectSubscriptionItem, ConnectSubscriptionInvoiceStatus, ConnectSubscriptionInvoice, ConnectSubscriptionRecurrence, ConnectSubscriptionInvoiceLineItem, ConnectSubscriptionItemStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { NetworkOffering, NetworkOfferingItem, NetworkOfferingRecurrence, NetworkPrice, NetworkPriceBillingCategory, NetworkPriceBillingCodes, NetworkPriceBillingUsageCode } from "@blockspaces/shared/models/network-catalog";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";
import { BillingAddress, Cart, CartStatus } from "@blockspaces/shared/models/cart";
import { UserDataService } from "../../users/services/UserDataService";
import { LightningInvoiceService } from "../../networks/lightning/invoices/services/LightningInvoiceService";
import { DateTime } from "luxon";
import { TaskQueueItemDataService } from "../../task-queue/services/TaskQueueItemDataService";
import { TaskQueueItemTaskType } from "@blockspaces/shared/models/task-queue/TaskQueueItemTaskType";
import { TaskQueueItemRecurrence } from "@blockspaces/shared/models/task-queue/TaskQueueItem";
import { QuickbooksCreateInvoice, QuickbooksInvoicingLineItem, QuickBooksPayment } from "../../quickbooks/types/QuickbooksTypes";
import { QuickbooksInvoiceService } from "../../quickbooks/services/QuickbooksInvoiceService";
import { QuickbooksCustomerService } from "../../quickbooks/services/QuickbooksCustomerService";
import { CustomerCreateQuickbooksRequestDto } from "@blockspaces/shared/dtos/lightning";
import Stripe from "stripe";
import { CancellationService } from "./CancellationService";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import { EndpointsDashboardQueries } from "../../node-monitoring-db";
import { EndpointsService } from "../../endpoints/services";
import { ConnectSubscriptionExpandedDto, ConnectSubscriptionItemExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto"
import { NetworkCatalogDataService } from "../../network-catalog/services/NetworkCatalogDataService";
import { NetworkPriceDto } from "@blockspaces/shared/dtos/network-catalog";


@Injectable()
export class ConnectSubscriptionService {
  private readonly METERED_BILLING_DAYS_IN_ARREARS = 2;
  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly dataContext: ConnectDbDataContext,
    private readonly stripeService: StripeService,
    private readonly userNetworkDataService: UserNetworkDataService,
    private readonly userDataService: UserDataService,
    private readonly lightningInvoiceService: LightningInvoiceService,
    private readonly taskQueueItemDataService: TaskQueueItemDataService,
    private readonly quickbooksInvoiceService: QuickbooksInvoiceService,
    private readonly quickbooksCustomerService: QuickbooksCustomerService,
    private readonly networkCancellationService: CancellationService,
    private readonly endpointsService: EndpointsService,
    private readonly endpointUsageDataService: EndpointsDashboardQueries,
    private readonly networkCatalogDataService: NetworkCatalogDataService,

  ) {
    logger.setModule(this.constructor.name);

  }

  async getConnectSubscriptionStatus(networkSubId: string): Promise<ConnectSubscriptionStatus> {
    const connectSubscription = (await this.dataContext.connectSubscriptions.findOne({ _id: networkSubId }))?.toObject<ConnectSubscription>();
    return connectSubscription.status;
  }

  /**
   * Get Connect Subscription Payment token needed for front end CC stripe integration 
   * @param networkSubId 
   * @returns Stripe Payment Token & Amount Due in Fiat
   */
  async getSubscriptionStripePaymentToken(networkSubId: string): Promise<{ paymentToken: string, amountDue: number, discountTotal: number }> {

    const connectSubscription = (await this.dataContext.connectSubscriptions.findOne({ _id: networkSubId }))?.toObject<ConnectSubscription>();
    if (!connectSubscription) throw new NotFoundException(`connect subscription id:${networkSubId} not found`);

    const stripePaymentTokenResult = await this.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret(connectSubscription.stripeSubscriptionId);
    if (stripePaymentTokenResult.isFailure) throw new ValidationException("Error getting payment token, please contact support");

    return {
      paymentToken: stripePaymentTokenResult.data.clientSecret,
      amountDue: stripePaymentTokenResult.data.amountDue,
      discountTotal: stripePaymentTokenResult.data.discountTotal
    };
  }

  /**
   * creates a Connect Subscription & Stripe Subscription if one is not Present
   * @param user 
   * @param network 
   * @param connectSubscriptionId 
   * @param offerIds 
   * @returns Stripe Payment Token , Amount Due in Fiat & Newly created Connect Subscription Id if applicable 
   */
  async getSubscriptionStripePaymentTokenCreateIfNotPresent(user: IUser, network: Network, connectSubscriptionId: string, billingInfo: BillingAddress, offerIds: string[])
    : Promise<{ networkSubId: string, paymentToken: string, amountDue: number, discountTotal: number }> {
    let clientSecretResult = null;
    let amountDue = null;
    let discountTotal = null;
    let connectSubscription: ConnectSubscription = null;
    let offers: NetworkOffering[] = null;
    if (connectSubscriptionId) connectSubscription = (await this.dataContext.connectSubscriptions.findOne({ _id: connectSubscriptionId }))?.toObject<ConnectSubscription>();

    // create subscription if not present
    if (!connectSubscription) {
      // retrieve offer's from db
      offers = await Promise.all(offerIds.map(async (oId) => ((await this.dataContext.networkOfferings.findOne({ _id: oId }).populate("items.price"))?.toObject<NetworkOffering>())));
      connectSubscription = (await this.dataContext.connectSubscriptions.create({
        createdOn: DateTime.utc().toMillis(),
        userId: user.id,
        tenantId: user.activeTenant?.tenantId,
        paymentMethod: PaymentMethod.Fiat,
        status: ConnectSubscriptionStatus.Requested,
        billingInfo,
        recurrence: this.mapRecurrenceToConnectSubscriptionRecurrence(offers[0].recurrence)
      }))?.toObject<ConnectSubscription>();
    }

    if (connectSubscription.status === ConnectSubscriptionStatus.Requested) {
      /* 
        * stripe connection has not been created yet
        * create stripe sub and link to connect sub
      */

      // retrieve offer's from db
      if (!offers) offers = await Promise.all(offerIds.map(async (oId) => ((await this.dataContext.networkOfferings.findOne({ _id: oId }).populate("items.price"))?.toObject<NetworkOffering>())));
      // grab stripe price id's for selected offer items
      const offeringItems = offers.reduce((results: NetworkOfferingItem[], offering: NetworkOffering) => results.concat(offering.items), []).map(x => x);
      const stripePriceIds = offeringItems.map((x: NetworkOfferingItem): { priceId: string } => ({ priceId: x.price.stripeId }));
      // create stripe 
      const defaultCoupon = network._id === NetworkId.LIGHTNING && JSON.parse(this.env.stripe.autoApplyLightningCoupon) === true ? this.env.stripe.lightningCouponCode : null;
      const stripeSubResult = await this.stripeService.createSubscription(connectSubscription._id?.toString(), connectSubscription.recurrence, user.billingDetails?.stripe?.customerId?.toString(), stripePriceIds, defaultCoupon);
      if (stripeSubResult.isFailure) {
        // clean up subscription
        await this.dataContext.connectSubscriptions.findByIdAndDelete(connectSubscription._id);
        throw new ValidationException("Error creating subscription, please contact support");
      }
      const stripeIntegrationData = stripeSubResult.data;
      /**  capture client Secret **/
      clientSecretResult = stripeIntegrationData.clientSecret;
      amountDue = stripeIntegrationData.amountDue;
      discountTotal = stripeIntegrationData.discountTotal;
      /** update network sub **/
      connectSubscription.status = ConnectSubscriptionStatus.Incomplete;
      connectSubscription.stripeSubscriptionId = stripeIntegrationData.subscriptionId;
      connectSubscription.currentPeriod = {
        billingStart: stripeIntegrationData.currentPeriodStart,
        billingEnd: stripeIntegrationData.currentPeriodEnd,
        meteredUsageStart: DateTime.fromMillis(stripeIntegrationData.currentPeriodStart * 1000).toUTC().toMillis(), // brand new subscription metered usage start will mirror billing start
        meteredUsageEnd: this.calculateMeteredUTCEndDate(stripeIntegrationData.currentPeriodEnd * 1000)
      };
      connectSubscription.items = stripeIntegrationData.items.map((stripeSubItem) => {
        const offerItem = offeringItems.find(i => i.price.stripeId === stripeSubItem.priceId);
        return {
          networkPrice: offerItem.price,
          stripeItemId: stripeSubItem.id,
          networkId: network._id,
          dateAdded: DateTime.utc().toMillis()
        } as ConnectSubscriptionItem;
      });


      // persist connect subscription
      connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription))?.toObject<ConnectSubscription>();

      // make sure invoice is created
      const meteredUsageStart = DateTime.fromMillis(connectSubscription.currentPeriod?.billingStart * 1000).toUTC().toMillis();
      const meteredUsageEnd = DateTime.fromMillis(connectSubscription.currentPeriod?.billingStart * 1000).toUTC().toMillis();
      await this.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription, stripeIntegrationData.stripeInvoiceId,
        connectSubscription.currentPeriod?.billingStart, connectSubscription.currentPeriod?.billingEnd,
        meteredUsageStart, meteredUsageEnd);

    } else {
      // grab client secret from stripe
      const stripePaymentTokenResult = await this.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret(connectSubscription.stripeSubscriptionId);
      if (stripePaymentTokenResult.isFailure) throw new ValidationException("Error getting payment token, please contact support");
      /**  capture client Secret **/
      clientSecretResult = stripePaymentTokenResult.data.clientSecret;
      amountDue = stripePaymentTokenResult.data.amountDue;
      discountTotal = stripePaymentTokenResult.data.discountTotal;
    }

    return {
      networkSubId: connectSubscription._id,
      paymentToken: clientSecretResult,
      amountDue,
      discountTotal
    };
  }

  /**
   * Add new items to existing connect subscription & provision network if applicable 
   * @param connectSubscriptionId 
   * @param targetNetworkId 
   * @param offerIds 
   * @returns 
   */
  async addOfferToSubscriptionAndInitiateUserNetworkProvisioning(connectSubscriptionId: string, targetNetworkId: string, offerId: string)
    : Promise<boolean> {
    let connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription for Id:${connectSubscriptionId} not found`);
    const utcNow = DateTime.utc().toMillis();
    const errors: string[] = [];

    // retrieve offer's from db
    const offer = (await this.dataContext.networkOfferings.findOne({ _id: offerId }).populate("items.price"))?.toObject<NetworkOffering>();
    const offeringItems = offer.items;

    // grab stripe subscription items
    const stripeSubscriptionItemsResult = await this.stripeService.getItemsForSubscription(connectSubscription.stripeSubscriptionId);
    if (stripeSubscriptionItemsResult.isFailure) throw new ValidationException("error reading subscription, please contact support");
    const stripeSubscriptionItems = stripeSubscriptionItemsResult.data;

    const connectSubscriptionLineItems = await Promise.all(offeringItems.map(async (item) => {
      const stripePriceId = item.price.stripeId;
      const alreadyInStripe = stripeSubscriptionItems.find(si => si.priceId === stripePriceId);
      // if item is already in stripe this item was 'canceled' from connect side, item should be {@link ConnectSubscriptionItemStatus.PendingCancelation}
      if (alreadyInStripe) return {
        alreadyBilled: true,
        item: connectSubscription.items.find(x => x.stripeItemId === alreadyInStripe.id)
      };

      const newStripeSubItem = await this.stripeService.addItemToSubscription(connectSubscription.stripeSubscriptionId, stripePriceId);
      if (newStripeSubItem.isFailure) {
        const msg = `Error adding item to stripe. network price id: ${item.price._id.toString()}, stripePriceId :${stripePriceId}`;
        this.logger.fatal(msg);
        errors.push(msg);
        return null;
      }

      return {
        networkId: item.price.network.toString(),
        networkPrice: item.price,
        stripeItemId: newStripeSubItem.data.id,
        dateAdded: utcNow
      };
    }));


    // add new items
    connectSubscriptionLineItems
      .filter(x => x)
      // ignore alreadyBilled  
      .filter(x => !x.alreadyBilled)
      // push into  connect subscription items
      .map(lineItem => connectSubscription.items.push({
        networkId: lineItem.networkId,
        networkPrice: lineItem.networkPrice,
        stripeItemId: lineItem.stripeItemId,
        dateAdded: lineItem.dateAdded
      }));

    // persist connect subscription
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription))?.toObject<ConnectSubscription>();

    if (errors.length > 0) throw new BadRequestException(`Please contact support. Issues updating existing subscription`);



    // provision user network
    // check if some how this is already in place ??
    let userNetwork = await this.userNetworkDataService.findByUserAndNetwork(connectSubscription.userId, targetNetworkId, offer.billingCategory.toString());
    if (!userNetwork) {
      userNetwork = await this.userNetworkDataService.addUserNetwork({
        networkId: targetNetworkId,
        userId: connectSubscription.userId,
        billingCategory: offer.billingCategory,
        billingTier: offer.billingTier
      });
    }
    else if (userNetwork?.status === UserNetworkStatus.PendingCancelation) {
      const user = await this.userDataService.findById(connectSubscription.userId);
      const networkId = targetNetworkId;
      const billingCategoryId = typeof offer.billingCategory === 'string' ? offer.billingCategory : offer.billingCategory._id.toString();

      // clean up connect subscription items
      // find item that is pending cancelation for this offer and remove it
      connectSubscription.items = connectSubscription.items.filter(x => {
        return !(x.statusOverride === ConnectSubscriptionItemStatus.PendingCancelation &&
          // filter by !isMetered because isMetered items stay on the subscription 
          offeringItems.find(y => y.price._id.toString() === x.networkPrice._id.toString() && !y.price.isMetered));
      });
      // clean up status of pending item that is maintained 
      connectSubscription.items = connectSubscription.items.map(x => {
        if (x.statusOverride === ConnectSubscriptionItemStatus.PendingCancelation &&
          offeringItems.find(y => y.price._id.toString() === x.networkPrice._id.toString())) {
          // wipe statusOverride, this item is no longer going to be removed 
          x.statusOverride = undefined;
        }
        return x;
      });
      // resume network services
      await this.networkCancellationService.resumeNetworkServiceOffering(user, networkId, offer.billingCategory as any);
      // get pending cron job form previous cancelation 
      const task = await this.taskQueueItemDataService.getByPayloadAndType(TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION, {
        connectSubscriptionId,
        networkId,
        billingCategoryId
      });
      // delete pending cron job
      await this.taskQueueItemDataService.deleteTask(task._id);
    }

    // update items with user networks
    connectSubscription.items = connectSubscription.items.map((item) => {
      if (item.networkId === targetNetworkId) {
        item.userNetwork = userNetwork;
      }
      return item;
    });
    // update networks array
    if (!connectSubscription.networks.find(n => n === targetNetworkId)) connectSubscription.networks.push(targetNetworkId);

    // persist connect subscription
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription))?.toObject<ConnectSubscription>();

    return true;
  }

  async applyCouponToSubscription(connectSubscriptionId: string, couponCode: string): Promise<{ amountDue: number, discountTotal?: number }> {
    let connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription for Id:${connectSubscriptionId} not found`);

    const results = await this.stripeService.applyCouponToSubscription(connectSubscription.stripeSubscriptionId, couponCode);
    if (results.isFailure) throw new ValidationException(`error reading applying coupon: '${couponCode}', please contact support`);
    return {
      amountDue: results.data.amountDue,
      discountTotal: results.data.discountTotal
    };
  }
  /**
   * Returns {@link ConnectSubscription} with status of {@link ConnectSubscriptionStatus.Active}
   * @param userId 
   * @returns 
   */
  async getActiveSubscriptionForUser(userId: string): Promise<ConnectSubscription> {
    return (await this.dataContext.connectSubscriptions.findOne({ userId: userId, status: ConnectSubscriptionStatus.Active }).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
  }

  async getActiveSubscriptionForUserWithUserNetworkDetails(userId: string): Promise<ConnectSubscriptionExpandedDto> {
    const connectSubscription = (await this.dataContext.connectSubscriptions.findOne({
      userId: userId, status: {
        $in: [ConnectSubscriptionStatus.Active, ConnectSubscriptionStatus.PendingCancelation, ConnectSubscriptionStatus.PastDue, ConnectSubscriptionStatus.Unpaid]
      }
    }).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
    if (!connectSubscription)
      return {
        status: ConnectSubscriptionStatus.Inactive,
        recurrence: null,
        paymentMethod: null,
        items: []
      };
    const purchasedOffersForSubscription: Cart[] = (await this.dataContext.cart.find({ connectSubscriptionId: connectSubscription._id.toString(), status: CartStatus.CHECKOUT_COMPLETE })
      .populate({ path: "items.offer", populate: { path: "items.price", populate: { path: "network" } } }).lean());
    const purchasedNetworkPrices = purchasedOffersForSubscription.flatMap(x => x.items).flatMap(x => x.offer.items).map(x => x.price);
    const purchasedNetworkPricesByNetwork = purchasedNetworkPrices.reduce((results: { [key: string]: { network: string, items: NetworkPrice[] } }, np) => {
      if (!results[np.network._id]) {
        results[np.network._id] = {
          network: np.network._id,
          items: []
        };
      }
      results[np.network._id].items.push(np);
      return results;
    }, {});
    let catalogData: NetworkPriceDto[] = [];
    for (const [key, value] of Object.entries(purchasedNetworkPricesByNetwork)) {
      const networkId = value.network;
      const pricesForNetwork = await this.networkCatalogDataService.getPricesForNetwork(networkId, value.items);
      catalogData = catalogData.concat(pricesForNetwork.data);
    }
    //
    const userNetworks = await this.userNetworkDataService.findByUserId(userId);
    return {
      cancellationDate: connectSubscription.cancellationDate,
      createdOn: connectSubscription.createdOn,
      recurrence: connectSubscription.recurrence,
      paymentMethod: connectSubscription.paymentMethod,
      status: connectSubscription.status,
      currentPeriod: connectSubscription.currentPeriod,
      networks: connectSubscription.networks,
      items: connectSubscription.items.map((x) => {
        const npDetails = catalogData.find(d => d.id === x.networkPrice._id.toString());
        const usrNw = userNetworks?.find(d => d.networkId === x.networkId);
        return {
          billingCategory: x.networkPrice.billingCategory,
          networkId: x.networkId,
          dateAdded: x.dateAdded,
          statusOverride: x.statusOverride || usrNw?.status,
          recurrence: x.networkPrice.recurrence,
          isMetered: x.networkPrice.isMetered,
          userNetwork: usrNw,
          ...npDetails
        } as ConnectSubscriptionItemExpandedDto;
      }),
      usageAuditTrail: connectSubscription.usageAuditTrail
    } as ConnectSubscriptionExpandedDto;
  }

  /**
 * Returns {@link ConnectSubscription} with status of {@link ConnectSubscriptionStatus.PendingCancelation}
 * @param userId 
 * @returns 
 */
  async getSubscriptionPendingCancelationForUser(userId: string): Promise<ConnectSubscription> {
    return (await this.dataContext.connectSubscriptions.findOne({ userId: userId, status: ConnectSubscriptionStatus.PendingCancelation }).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
  }

  /**
   * Get connectSubscription providing Stripe Subscription Id
   * @param stripeSubscriptionId 
   * @returns Connect Subscription
   */
  async getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<ConnectSubscription> {
    return (await this.dataContext.connectSubscriptions.findOne({ stripeSubscriptionId }).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
  }

  /**
   * Get connect subscription by Id
   * @param id 
   * @returns Connect Subscription
   */
  async getSubscriptionByIdPopulateItemsNetworkPrice(id: string): Promise<ConnectSubscription> {
    return (await this.dataContext.connectSubscriptions.findById(id).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
  }

  /**
   * Get instance of connect subscription for a given user , recurrence & payment method
   * @param userId 
   * @param recurrence 
   * @param paymentMethod 
   * @returns 
   */
  async getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod(userId: string, recurrence: ConnectSubscriptionRecurrence | NetworkOfferingRecurrence, paymentMethod: PaymentMethod = PaymentMethod.Fiat)
    : Promise<ConnectSubscription> {
    recurrence = this.mapRecurrenceToConnectSubscriptionRecurrence(recurrence);
    return (await this.dataContext.connectSubscriptions.findOne({ userId, recurrence, paymentMethod, status: ConnectSubscriptionStatus.Active }).populate({ path: "items.networkPrice", populate: { path: "billingCategory" } }).populate("items.userNetwork"))?.toObject<ConnectSubscription>();
  }

  /**
   * Calculate prorated amount for given items
   * @param connectSubscriptionId 
   * @param proposedOfferingItems 
   * @returns 
   */
  async getProrateAmountForSubscription(connectSubscriptionId: string, proposedOfferingItems: NetworkOfferingItem[])
    : Promise<{ amountDue: number, discountTotal: number }> {
    const connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription for Id:${connectSubscriptionId} not found`);

    /**
     * Handle special use case when user has canceled a service but is trying to re-add that service before the billing cycle has completed
     */
    // build list of items to exclude, which is the metered stuff
    const itemsPendingCancel = connectSubscription.items.filter(x => x.statusOverride === ConnectSubscriptionItemStatus.PendingCancelation);
    const meteredItemsPendingCancel = itemsPendingCancel?.filter(x => x.networkPrice.isMetered);
    const stripeIds = proposedOfferingItems.filter(x => !meteredItemsPendingCancel?.find(y => y.networkPrice._id.toString() === x.price._id.toString())).map(x => ({ price: x.price.stripeId }));

    const stripeProrateCalc = await this.stripeService.getProrateAmountForSubscription(connectSubscription.stripeSubscriptionId, stripeIds);
    if (stripeProrateCalc.isFailure) throw new ValidationException("error calculating new total, please contact support");

    return {
      amountDue: stripeProrateCalc.data.amountDue,
      discountTotal: stripeProrateCalc.data.discountTotal
    };
  }

  /**
  * Delete Pending connect subscription, connect subscription invoice and cancel stripe subscription
  * Only applies when a connect subscription has a status of {@link ConnectSubscriptionStatus.Requested} or {@link ConnectSubscriptionStatus.Incomplete}
  * @param connectSubscriptionId 
  * @returns 
  */
  async deleteSubscriptionWithInvoiceAndCancelStripeSubscription(connectSubscriptionId: string): Promise<void> {

    const connectSubscription = (await this.dataContext.connectSubscriptions.findOne({ _id: connectSubscriptionId }))?.toObject<ConnectSubscription>();
    if (!connectSubscription) throw new NotFoundException(`connect subscription for Id:${connectSubscriptionId} not found`);

    switch (connectSubscription.status) {
      case ConnectSubscriptionStatus.Requested:
      case ConnectSubscriptionStatus.Incomplete: {
        break;
      }
      default:
        throw new ValidationException(`Cannot delete connect subscription with status of ${connectSubscription.status} `);
    }
    if (connectSubscription.stripeSubscriptionId) {
      // cancel stripe sub
      const stripeResult = await this.stripeService.cancelSubscription(connectSubscription.stripeSubscriptionId);
      if (stripeResult.isFailure) {
        throw new ValidationException(`error canceling subscription please contact support`);
      }
    }

    const [deleteNetworkSub, deleteNetworkSubInvoice] = await Promise.allSettled([
      this.dataContext.connectSubscriptions.findByIdAndDelete(connectSubscription._id),
      this.dataContext.connectSubscriptionInvoices.findOneAndDelete({ connectSubscription: connectSubscriptionId })
    ]);
    if (deleteNetworkSub.status === "rejected") {
      this.logger.error(`Error deleting connect subscription ${connectSubscription._id} `);
    }
    if (deleteNetworkSubInvoice.status === "rejected") {
      this.logger.error(`Error deleting connect subscription invoice for connectSubscriptionId:${connectSubscription._id} `);
    }
  }

  /**
   * Cancel services for a given {@link Network} and {@link NetworkPriceBillingCategory}
   * This call will trigger asynchronous processes that will happen outside of the current 'process' please allow a couple seconds to reflect changes 
   * @param connectSubscription 
   * @param networkId 
   * @param billingCategory 
   * @returns 
   */
  async cancelSelectServicesByNetworkIdAndBillingCategory(user: IUser, connectSubscription: ConnectSubscription, networkId: string, billingCategoryCode: NetworkPriceBillingCodes)
    : Promise<Boolean> {
    const billingCategory = (await this.dataContext.networkPriceBillingCategories.findOne({ code: billingCategoryCode })).toObject<NetworkPriceBillingCategory>();
    if (!billingCategory) throw new NotFoundException(`Error billing category code ${billingCategoryCode}, not found`);
    // check if the subscription has any items pending cancelation 
    const currentItemsPendingCancelation = connectSubscription.items.filter(x => x.statusOverride === ConnectSubscriptionItemStatus.PendingCancelation);
    // grab all network & billing category related items
    const newItemsPendingCancelation = connectSubscription.items.filter(x => x.networkId === networkId && x.networkPrice.billingCategory._id.toString() === billingCategory._id.toString());
    // filter out items that are 'NOT' metered
    // this is because we must allow the subscription cycle to finish before removing any metered related items
    const itemsToRemove = newItemsPendingCancelation.filter(x => !x.networkPrice.isMetered);
    // check if we need to cancel entire subscription
    const cancelSubOverride = (currentItemsPendingCancelation.length + newItemsPendingCancelation.length) === connectSubscription.items.length;
    if (cancelSubOverride || (newItemsPendingCancelation.length === connectSubscription.items.length)) {
      /**
       * handle entire subscription cancelation 
       */
      // report metered usage & wait for finish
      await this.processSubscriptionMeteredUsage(connectSubscription._id.toString(), connectSubscription, user);
      // re-hydrate
      connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscription._id);
      // set subscription to pending cancelation  
      connectSubscription.status = ConnectSubscriptionStatus.PendingCancelation;
      // persist
      connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();


      if (currentItemsPendingCancelation.length > 0) {
        // clean up
        const tasks = await this.taskQueueItemDataService.findByPayloadAndType(TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION, {
          "payload.connectSubscriptionId": connectSubscription._id.toString(),
          "payload.networkId": { $exists: true },
          "payload.billingCategoryId": { $exists: true }
        });

        // terminate network services for given billing category
        await Promise.allSettled(tasks.map(x => this.networkCancellationService.terminateNetworkServiceOffering(user, x.payload.networkId, billingCategory)));
        // clean up pending 
        await Promise.allSettled(tasks.map(x => this.taskQueueItemDataService.deleteTask(x._id)));
      }

      // process in parallel 
      const [disableNetwork, stripeCancalationReponse,] = await Promise.allSettled([
        // disable network services for given billing category 
        this.networkCancellationService.disableNetworkServiceOffering(user, networkId, billingCategory),

        // call stripe to cancel 
        this.stripeService.cancelSubscription(connectSubscription.stripeSubscriptionId),

        // delete cron job item for metered billing
        this.taskQueueItemDataService.deleteTask(connectSubscription.scheduledTaskId),

      ]);


      if (disableNetwork.status === "rejected") throw (disableNetwork.reason);
      if (stripeCancalationReponse.status === "fulfilled" && stripeCancalationReponse.value.isFailure) throw new ValidationException("error canceling service, please contact support");

      // terminate network services for given billing category 
      await this.networkCancellationService.terminateNetworkServiceOffering(user, networkId, billingCategory);
      // set subscription
      connectSubscription.status = ConnectSubscriptionStatus.Canceled;
      // persist
      connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();

    } else {

      // call disable so UI will no longer display items 
      await this.networkCancellationService.disableNetworkServiceOffering(user, networkId, billingCategory);
      // call stripe & remove line items, let webhooks handle the rest of the workflow ;o) 
      const results = await Promise.all(itemsToRemove.map(x => this.stripeService.removeItemFromSubscription(connectSubscription.stripeSubscriptionId, x.stripeItemId)));

      if (results.filter(x => x.isFailure).length > 0) throw new ValidationException(`Error canceling service, please contact support`);
    }

    return true;
  }

  /**
 * Used to clean up a stale and/or expired cart 
 * @param connectSubscriptionId 
 * @returns 
 */
  async deleteSubscriptionWithInvoice(connectSubscriptionId: string): Promise<void> {

    const connectSubscription = (await this.dataContext.connectSubscriptions.findOne({ _id: connectSubscriptionId }))?.toObject<ConnectSubscription>();
    if (!connectSubscription) throw new NotFoundException(`subscription id ${connectSubscriptionId} not found`);

    switch (connectSubscription.status) {
      case ConnectSubscriptionStatus.Requested:
      case ConnectSubscriptionStatus.Incomplete:
      case ConnectSubscriptionStatus.IncompleteExpired: {
        break;
      }
      default:
        throw new ValidationException(`Cannot delete connect subscription with status of ${connectSubscription.status} `);
    }

    const [deleteNetworkSub, deleteNetworkSubInvoice] = await Promise.allSettled([
      this.dataContext.connectSubscriptions.findByIdAndDelete(connectSubscription._id),
      this.dataContext.connectSubscriptionInvoices.findOneAndDelete({ connectSubscription: connectSubscriptionId })
    ]);
    if (deleteNetworkSub.status === "rejected") {
      this.logger.error(`Error deleting connect subscription ${connectSubscription._id} `);
    }
    if (deleteNetworkSubInvoice.status === "rejected") {
      this.logger.error(`Error deleting connect subscription invoice for connectSubscriptionId:${connectSubscription._id} `);
    }

  }

  /**
   * Update Default payment method for stripe Subscription
   * @param user 
   * @param paymentMethodId 
   * @returns 
   */
  async setSubscriptionDefaultPaymentMethod(user: IUser, paymentMethodId: string): Promise<Boolean> {
    const subscription = await this.getActiveSubscriptionForUser(user.id);
    if (!subscription) throw new ValidationException("No Active Subscription found");

    const { data, isFailure } = await this.stripeService.setSubscriptionDefaultPaymentMethod(subscription.stripeSubscriptionId, paymentMethodId);
    if (isFailure) throw new ValidationException("Error setting default payment method, please contact support");

    return data;
  }

  // #region Stripe Webhook integration

  /**
 * Used for Stripe Webhook integration
 * Integration point this gets called when stripe Subscription is marked Paid & Active for the 1st time
 * Mark Connect Connect Subscription as Active and create UserNetwork record 
 * @param stripeSubscriptionId 
 * @param userId 
 * @param targetNetworkId 
 * @returns True if successful  
 */
  async markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning(stripeSubscriptionId: string, cart: Cart)
    : Promise<void> {
    const userId = cart.userId;
    const targetNetworkId = cart.networkId;
    const offerId = cart.items[0].offer;

    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    const offer = await this.dataContext.networkOfferings.findById(offerId.toString());

    // #region initiate network provisioning
    const userNetwork = await this.userNetworkDataService.addUserNetwork({
      networkId: targetNetworkId,
      userId: userId,
      billingCategory: offer.billingCategory,
      billingTier: offer.billingTier
    });

    if (!userNetwork) {
      throw new Error(`Error creating user network for targetNetworkId${targetNetworkId},userId:${userId}`);
    }
    // #endregion

    // #region update subscription
    connectSubscription.status = ConnectSubscriptionStatus.Active;
    connectSubscription.networks = (connectSubscription.networks || []).filter(x => x !== targetNetworkId).concat(targetNetworkId);
    connectSubscription.items = connectSubscription.items.map((item) => {
      if (item.networkId === targetNetworkId && item.networkPrice?.billingCategory?._id?.toString() === offer.billingCategory?.toString()) {
        item.userNetwork = userNetwork;
      }
      return item;
    });
    // #endregion

    // #region Create Task Queue Item
    const billingRecurrence: TaskQueueItemRecurrence = this.mapConnectSubscriptionNetworkOfferingRecurrenceToTaskQueueRecurrence(connectSubscription.recurrence);
    const meteredUsageEndDate = connectSubscription.currentPeriod?.meteredUsageEnd;
    const queuedTask = await this.taskQueueItemDataService.createScheduledTask(TaskQueueItemTaskType.REPORT_SUBSCRIPTION_USAGE,
      billingRecurrence, { connectSubscriptionId: connectSubscription._id.toString() }, meteredUsageEndDate);
    if (!queuedTask) {
      throw new Error(`Error creating queued task for connect subscription id :${connectSubscription._id} userId:${userId}`);
    }
    // #endregion

    // #region  subscription & persist
    connectSubscription.scheduledTaskId = queuedTask?._id?.toString();
    // persist 
    await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription);
    // #endregion

  }

  /**
   * Used for Stripe Webhook integration
   * Updates Connect Connect Subscription Invoice as Paid
   * @param stripeInvoiceId 
   * @param stripePaymentIntentId 
   * @param amountPaid 
   * @returns 
   */
  async captureSubscriptionInvoicePaymentByStripeInvoiceId(stripeSubscriptionId: string, stripeInvoiceId: string, stripePaymentIntentId: string, amountPaid: number)
    : Promise<void> {
    if (amountPaid as any === "NaN") amountPaid = 0;
    const networkSubInvoice = (await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId }))?.toObject<ConnectSubscriptionInvoice>();
    if (!networkSubInvoice) throw new NotFoundException(`connect subscription invoice with stripeInvoiceId = ${stripeInvoiceId} not found`);

    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    // Get Stripe Invoice
    const stripeInvoice = await this.stripeService.getInvoiceById(stripeInvoiceId);
    if (stripeInvoice.isFailure) {
      throw (stripeInvoice.error);
    }

    const invoiceDiscountTotal = (stripeInvoice.data as Stripe.Invoice)?.total_discount_amounts?.reduce((total, discount) => (total + discount.amount / 100), 0) ?? 0;

    const stripeItems = (stripeInvoice.data as Stripe.Invoice)?.lines?.data;
    const connectInvoiceLineItems: ConnectSubscriptionInvoiceLineItem[] = stripeItems?.map((sLine) => {
      const connectSubLineItem = connectSubscription.items.find(i => i.networkPrice?.stripeId === sLine.price?.id);
      return {
        stripeLineItemId: sLine.id,
        connectSubscriptionItemId: connectSubLineItem._id,
        networkId: connectSubLineItem.networkId,
        networkPrice: connectSubLineItem.networkPrice._id,
        userNetwork: connectSubLineItem.userNetwork == null ? "" : typeof connectSubLineItem.userNetwork === 'object' ? connectSubLineItem.userNetwork?._id : (connectSubLineItem.userNetwork as string).toString(),
        title: sLine.price?.nickname,
        description: sLine.description,
        quantity: sLine.quantity,
        lineTotal: sLine.amount_excluding_tax / 100,
        unitAmount: Number(sLine.unit_amount_excluding_tax) / 100,
        proration: sLine.proration,
        prorationDate: sLine.proration ? sLine.period.start * 1000 : null
      } as ConnectSubscriptionInvoiceLineItem;
    });


    const currentPeriodUsageAuditTrial = connectSubscription.usageAuditTrail?.filter(x => x.meteredUsageStart === networkSubInvoice.period.meteredUsageStart && x.meteredUsageEnd === networkSubInvoice.period.meteredUsageEnd);

    // capture quickbooks integration
    // create QB Invoice with line items that match, then set returned ID below.
    // log an error but keep going.
    let quickBooksInvoiceId: string;
    try {
      quickBooksInvoiceId = await this.getOrCreateMatchingQuickbooksInvoiceId(connectSubscription, stripeInvoice.data, stripePaymentIntentId, invoiceDiscountTotal);
      if (!quickBooksInvoiceId) {
        // log the Quickbooks error
        this.logger.error(`Failed creating new Quickbooks Invoice during Stripe Customer Subscription Invoice Payment for StripeInvoice ${stripeInvoiceId} and Stripe Subscription ${stripeSubscriptionId}`);
      }
    } catch (error) {
      this.logger.error(`Caught Error Failed creating new Quickbooks Invoice during Stripe Customer Subscription Invoice Payment for StripeInvoice ${stripeInvoiceId} and Stripe Subscription ${stripeSubscriptionId} with error ${error.message}; Error: ${error.message}`, error);
    }



    if (networkSubInvoice.status !== ConnectSubscriptionInvoiceStatus.Paid) {
      networkSubInvoice.status = ConnectSubscriptionInvoiceStatus.Paid;
      networkSubInvoice.quickBooksInvoiceId = quickBooksInvoiceId;
      networkSubInvoice.amount = amountPaid;
      networkSubInvoice.payment = {
        paymentSource: "Stripe",
        referenceId: stripePaymentIntentId,
        amount: amountPaid
      };
      networkSubInvoice.number = stripeInvoice.data?.number;
      networkSubInvoice.lines = connectInvoiceLineItems;
      networkSubInvoice.usageAuditTrail = currentPeriodUsageAuditTrial;
      networkSubInvoice.totalDiscountAmount = invoiceDiscountTotal;
      // persist
      await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(networkSubInvoice._id, networkSubInvoice);
    }

  }


  /**
   * Used for Stripe Webhook integration
   * @param stripeSubscriptionId 
   * @param newPeriodStart 
   * @param newPeriodEnd 
   * @param newStripeInvoiceId 
   */
  async updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated(stripeSubscriptionId: string, newPeriodStart: number, newPeriodEnd: number, newStripeInvoiceId: string)
    : Promise<void> {
    let connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    const subscriptionPreviousPeriod = connectSubscription.currentPeriod;
    // update currentPeriod
    connectSubscription.currentPeriod = {
      billingStart: newPeriodStart,
      billingEnd: newPeriodEnd,
      // new start is previous periods end. Add 1 second to not capture double usage 
      meteredUsageStart: DateTime.fromMillis(subscriptionPreviousPeriod.meteredUsageEnd).plus({ second: 1 }).toUTC().toMillis(),
      meteredUsageEnd: this.calculateMeteredUTCEndDate(newPeriodEnd * 1000)
    };

    // persist
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();

    // at this point in the integration the connect subscription invoice should  exist because of invoice.created event,
    // however we must check due to the fact webhooks don't guarantee order of operations 
    // Also must use updated meteredUsageStart & meteredUsageEnd ** very important **
    await this.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription, newStripeInvoiceId,
      connectSubscription.currentPeriod.billingStart, connectSubscription.currentPeriod.billingEnd,
      subscriptionPreviousPeriod.meteredUsageStart, subscriptionPreviousPeriod.meteredUsageEnd);

  }

  /**
 * Used for Stripe Webhook integration
 * syncs connect  subscription status with stripe subscription status and captures connect subscription invoice payment 
 * @param stripeSubscriptionId 
 * @param stripeInvoiceId 
 * @param stripePaymentIntentId 
 * @param amountPaid 
 */
  async ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment(stripeSubscriptionId: string, stripeInvoiceId: string, stripePaymentIntentId: string, amountPaid: number)
    : Promise<void> {
    let connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);



    // get stripe subscription current status
    const stripeSubStatusResult = await this.stripeService.getSubscriptionStatus(stripeSubscriptionId);
    if (stripeSubStatusResult.isFailure) {
      this.logger.error(stripeSubStatusResult.message);
    }


    const stripeSubStatus = stripeSubStatusResult.data?.status;
    let newStatus: ConnectSubscriptionStatus = null;
    if (stripeSubStatus) {
      newStatus = this.mapStripeSubscriptionStatusToConnectSubscriptionStatusHelper(stripeSubStatus);
    } else {
      switch (connectSubscription.status) {
        case ConnectSubscriptionStatus.Canceled:
        case ConnectSubscriptionStatus.PendingCancelation: {
          // leave as is
          newStatus = connectSubscription.status;
          break;
        }
        default: {
          newStatus = ConnectSubscriptionStatus.Active;
          break;
        }
      }
    }

    // update
    connectSubscription.status = newStatus;

    // persist
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();


    // connection subscription invoice 
    await this.captureSubscriptionInvoicePaymentByStripeInvoiceId(stripeSubscriptionId, stripeInvoiceId, stripePaymentIntentId, amountPaid);


  }

  /**
   * Used for Stripe Webhook integration.
   * Updates connect connect subscription status to reflect stripe subscription changes 
   * @param stripeSubscriptionId 
   * @param newStatus 
   */
  async updateSubscriptionStatus(stripeSubscriptionId: string, newStatus: string): Promise<ConnectSubscriptionStatus> {
    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    const newNetworkSubStatus = this.mapStripeSubscriptionStatusToConnectSubscriptionStatusHelper(newStatus);
    if (!newNetworkSubStatus) throw new NotFoundException(`No status found to map to ${newStatus} `);

    if (connectSubscription.status === ConnectSubscriptionStatus.PendingCancelation || newNetworkSubStatus === ConnectSubscriptionStatus.Canceled)
      return connectSubscription.status;

    if (connectSubscription.status === newNetworkSubStatus)
      return newNetworkSubStatus;


    try {
      // update
      connectSubscription.status = newNetworkSubStatus;
      // persist
      await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription);
    } catch (error) {
      if (error?.errors?.scheduledTaskId) {
        // eat valid validation rule
      } else {
        throw (error);
      }
    }
    return newNetworkSubStatus;
  }

  /**
 * Used for Stripe Webhook integration.
 * @param stripeInvoiceId 
 * @param errorInfo 
 */
  async captureSubscriptionInvoicePaymentErrorByStripeInvoiceId(stripeInvoiceId: string, errorInfo: { attemptCount: number, nextAttempt: number, code: string, message: string, amountDue: number, referenceId: string })
    : Promise<void> {
    const networkSubInvoice = await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId: stripeInvoiceId });
    if (!networkSubInvoice) throw new NotFoundException(`connect subscription invoice for stripe invoice id:${stripeInvoiceId}, not found`);

    // make sure status is open/unpaid
    networkSubInvoice.status = ConnectSubscriptionInvoiceStatus.Open;

    // update payment & error props
    networkSubInvoice.payment = {
      paymentSource: "Stripe",
      referenceId: errorInfo.referenceId,
      amount: errorInfo.amountDue,
      error: {
        attemptCount: errorInfo.attemptCount,
        code: errorInfo.code,
        message: errorInfo.message,
        nextAttempt: errorInfo.nextAttempt
      }
    };

    // persist
    await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(networkSubInvoice._id, networkSubInvoice);


  }

  /**
   * Used for Stripe Webhook integration.
   * Mark connect connect subscription invoice as unpaid, if not already
   * @param stripeSubscriptionId 
   */
  async ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId(stripeSubscriptionId: string): Promise<void> {
    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    if (connectSubscription.status !== ConnectSubscriptionStatus.Unpaid) {
      // set status
      connectSubscription.status = ConnectSubscriptionStatus.Unpaid;
      // persist
      await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription);
    }
  }

  /**
   * Used for Stripe Webhook integration.
   * Mark connect connect subscription invoice as open, if not already
   * @param stripeInvoiceId 
   * @returns 
   */
  async ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId(stripeInvoiceId: string): Promise<void> {
    const networkSubInvoice = await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId: stripeInvoiceId });
    if (!networkSubInvoice) throw new NotFoundException(`connect subscription invoice for stripe invoice id:${stripeInvoiceId}, not found`);


    switch (networkSubInvoice.status) {
      case ConnectSubscriptionInvoiceStatus.Draft: {
        // set status
        networkSubInvoice.status = ConnectSubscriptionInvoiceStatus.Open;
        // persist
        await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(networkSubInvoice._id, networkSubInvoice);
        break;
      }
    }
  }

  /**
   * Used for Stripe Webhook integration.
   * Mark connect connect subscription invoice as void, if not already
   * @param stripeInvoiceId 
   * @returns 
   */
  async ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId(stripeInvoiceId: string): Promise<void> {
    const networkSubInvoice = await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId: stripeInvoiceId });
    if (!networkSubInvoice) throw new NotFoundException(`connect subscription invoice for stripe invoice id:${stripeInvoiceId}, not found`);
    if (networkSubInvoice.status !== ConnectSubscriptionInvoiceStatus.Paid) {
      // set status
      networkSubInvoice.status = ConnectSubscriptionInvoiceStatus.Void;
      // persist
      await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(networkSubInvoice._id, networkSubInvoice);
    }
  }

  /**
   * Used for Stripe Webhook integration.
   * Makes sure we have a subscription invoice created 
   * @param stripeSubscriptionId 
   * @param stripeInvoiceId 
   * @returns 
   */
  async ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId(stripeSubscriptionId: string, stripeInvoiceId: string): Promise<void> {
    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);
    await this.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription, stripeInvoiceId);
  }

  /**
   * Used for Stripe Webhook integration.
   * Triggered when removing line items from a subscription
   * @param stripeSubscriptionId 
   * @param stripeSubscriptionLineItemIds 
   * @returns 
   */
  async processStripeSubscriptionLineItemRemoval(stripeSubscriptionId: string, stripeSubscriptionLineItemIds: string[])
    : Promise<void> {
    const connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);
    const itemsToCancel = connectSubscription.items.filter(x => stripeSubscriptionLineItemIds.indexOf(x.stripeItemId) >= 0);
    await this.cancelSelectServicesHelper(connectSubscription, itemsToCancel);
  }

  /**
   *  Used for Stripe Webhook integration. Handle Stripe Subscription Cancelation triggered from stripe admin UI
   *  Mark connect  subscription as canceled , clean up any dependencies
   * @param stripeSubscriptionId 
   * @returns 
   */
  async cancelSubscriptionAndEnsureInvoiceIsCreated(stripeSubscriptionId: string, stripeInvoiceId: string, cancelDateInMillis?: number): Promise<void> {
    cancelDateInMillis = cancelDateInMillis ?? DateTime.utc().toMillis();
    let connectSubscription = await this.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${stripeSubscriptionId} not found`);

    if (connectSubscription.status === ConnectSubscriptionStatus.Canceled || connectSubscription.status === ConnectSubscriptionStatus.PendingCancelation) {
      await this.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription, stripeInvoiceId);
      return;
    }

    const newBillingEndDate = Number(String(cancelDateInMillis).substring(0, String(cancelDateInMillis).length - 3));
    const isCancelationDateInTheFuture = cancelDateInMillis > DateTime.utc().toMillis();
    const dateToTerminateService = DateTime.fromMillis(newBillingEndDate * 1000).plus({ hour: 3 }).toMillis();
    // update 
    connectSubscription.currentPeriod.billingEnd = newBillingEndDate;
    connectSubscription.currentPeriod.meteredUsageEnd = isCancelationDateInTheFuture ? this.calculateMeteredUTCEndDate(cancelDateInMillis) : cancelDateInMillis;
    connectSubscription.status = isCancelationDateInTheFuture ? ConnectSubscriptionStatus.PendingCancelation : ConnectSubscriptionStatus.Canceled;
    connectSubscription.cancellationDate = cancelDateInMillis;
    // persist
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();



    const [confirmInvoice, ,] = await Promise.allSettled([
      // confirm invoice
      this.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription, stripeInvoiceId),

      // Clean up cron job item
      this.taskQueueItemDataService.setLastRunDateForTask(connectSubscription.scheduledTaskId, connectSubscription.currentPeriod.meteredUsageEnd),

      // Create Scheduled task to process service termination. On Cancelation Date
      this.taskQueueItemDataService.createScheduledTask(TaskQueueItemTaskType.SUBSCRIPTION_TERMINATION,
        TaskQueueItemRecurrence.ONCE, { connectSubscriptionId: connectSubscription._id.toString() }, dateToTerminateService)
    ]);

    if (confirmInvoice.status === "rejected") throw (confirmInvoice.reason);

    return;
  }
  // #endregion

  // #region Process Metered Billing 

  /**
   * 
   * Process metered billing. Used by Cron job
   * @param connectSubscriptionId required, will be the only value supplied when ran by cron job
   * @param connectSubscription optional 
   * @param userDetails optional 
   * @param meteredUsageStartOverride optional
   * @param meteredUsageEndOverride optional
   * @returns 
   */
  async processSubscriptionMeteredUsage(connectSubscriptionId: string, connectSubscription: ConnectSubscription = null, userDetails: IUser = null
    , meteredUsageStartOverride: number = null, meteredUsageEndOverride: number = null): Promise<Array<{
      billingCode: NetworkPriceBillingUsageCode,
      unitQuantity: number,
      connectSubscriptionItemId: string,
      meteredUsageStart: number,
      meteredUsageEnd: number,
      timestamp: number
    }>> {
    const errorLogs: Array<String> = [];
    const results: Array<{
      billingCode: NetworkPriceBillingUsageCode,
      unitQuantity: number,
      connectSubscriptionItemId: string,
      meteredUsageStart: number,
      meteredUsageEnd: number,
      timestamp: number
    }> = [];

    // #region Load Dependencies 
    if (!connectSubscription) connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription for connectSubscriptionId:${connectSubscriptionId} not found`);

    if (!userDetails) userDetails = await this.userDataService.getUserById(connectSubscription.userId);
    if (!userDetails) throw new NotFoundException(`connect user for userId:${connectSubscription.userId} not found`);
    // #endregion

    // #region Metered usage dates
    const meteredUsageStart = meteredUsageStartOverride ?? connectSubscription.currentPeriod.meteredUsageStart;
    const meteredUsageEnd = meteredUsageEndOverride ?? connectSubscription.currentPeriod.meteredUsageEnd;
    // #endregion

    // #region Process LIGHTNING Metered Billing

    const lightingTransactionLineItems = connectSubscription.items.filter(x => x.networkPrice.billingUsageCode === NetworkPriceBillingUsageCode.LNC_TRANSACTION);
    // const lightingLiquidityLineItems = connectSubscription.items.filter(x => x.networkPrice.billingUsageCode === NetworkPriceBillingUsageCode.LNC_LIQUIDITY_RENTAL);

    for (const lightingTransactionLineItem of lightingTransactionLineItems) {
      try {
        // get lightning volume for for period 
        const lightingBillDetails = await this.lightningInvoiceService.getLightningVolume(meteredUsageStart, meteredUsageEnd, userDetails.activeTenant?.tenantId);
        const totalVolumeInUsd = lightingBillDetails.totalVolume || 0;
        // capture stripe subscription usage
        const stripeCaptureSubscriptionUsageResult = await this.stripeService.captureSubscriptionUsage(connectSubscriptionId, lightingTransactionLineItem.stripeItemId, totalVolumeInUsd, connectSubscription.currentPeriod.billingStart);
        if (stripeCaptureSubscriptionUsageResult.isFailure) {
          this.logger.error(`error capturing stripe subscription usage stripeSubscriptionId:${connectSubscriptionId}, stripeItemId:${lightingTransactionLineItem.stripeItemId}, totalVolumeInUsd:${totalVolumeInUsd}, periodStart:${connectSubscription.currentPeriod.billingStart}.\n msg:${stripeCaptureSubscriptionUsageResult.message} `);
          throw (stripeCaptureSubscriptionUsageResult.error);
        } else {
          // update subscription with audit trail
          connectSubscription.usageAuditTrail = (connectSubscription.usageAuditTrail || []);
          const usageData = {
            billingCode: NetworkPriceBillingUsageCode.LNC_TRANSACTION,
            connectSubscriptionItemId: lightingTransactionLineItem._id.toString(),
            unitQuantity: totalVolumeInUsd,
            meteredUsageStart,
            meteredUsageEnd,
            timestamp: DateTime.utc().toMillis()
          };
          results.push(usageData);
          connectSubscription.usageAuditTrail.push(usageData);

        }
      } catch (error) {
        this.logger.fatal(`Error inside processing billing code:${NetworkPriceBillingUsageCode.LNC_TRANSACTION.toString()} , for connectSubscriptionId:${connectSubscriptionId}, connectSubscriptionItemId:${lightingTransactionLineItem._id.toString()} `);
        // In JavaScript, there is no special "rethrow" keyword. You simply throw() the
        // error that you caught. This will maintain the original stacktrace recorded by
        // the error as you "pass it back up" the call-stack.
        throw (error);

      }
    }

    // #endregion

    // #region Process Developer EndPoints Metered Billing

    const devEndPointLineItems = connectSubscription.items.filter(x => x.networkPrice.billingUsageCode === NetworkPriceBillingUsageCode.DEV_ENDPOINT_TRANSACTION);
    for (const devEndPointLineItem of devEndPointLineItems) {

      try {
        const userEndpoints = await this.endpointsService.getEndpoints(userDetails.activeTenant?.tenantId, devEndPointLineItem.networkId);
        const startDateTime = DateTime.fromMillis(meteredUsageStart).toUTC();
        const endDateTime = DateTime.fromMillis(meteredUsageEnd).toUTC();
        const networkUsageAmounts = await this.endpointUsageDataService.getNetworkUsageByInterval(startDateTime, endDateTime, userEndpoints, NetworkDataInterval.DAILY);
        const totalUsage = networkUsageAmounts?.reduce((total, data) => total + Number(data.usage), 0) ?? 0;

        // capture stripe subscription usage
        const stripeCaptureSubscriptionUsageResult = await this.stripeService.captureSubscriptionUsage(connectSubscriptionId, devEndPointLineItem.stripeItemId, totalUsage, connectSubscription.currentPeriod.billingStart);
        if (stripeCaptureSubscriptionUsageResult.isFailure) {
          const msg = `error capturing stripe subscription usage stripeSubscriptionId:${connectSubscriptionId}, stripeItemId:${devEndPointLineItem.stripeItemId}, totalUsage:${totalUsage}, periodStart:${connectSubscription.currentPeriod.billingStart}.\n msg:${stripeCaptureSubscriptionUsageResult.message} `;
          this.logger.error(msg);
          throw (stripeCaptureSubscriptionUsageResult.error);
        } else {
          // update subscription with audit trail
          connectSubscription.usageAuditTrail = (connectSubscription.usageAuditTrail || []);
          const usageData = {
            billingCode: NetworkPriceBillingUsageCode.DEV_ENDPOINT_TRANSACTION,
            connectSubscriptionItemId: devEndPointLineItem._id.toString(),
            unitQuantity: totalUsage,
            meteredUsageStart,
            meteredUsageEnd,
            timestamp: DateTime.utc().toMillis()
          };
          results.push(usageData);
          connectSubscription.usageAuditTrail.push(usageData);
        }
      } catch (error) {
        this.logger.error(`Error inside processing billing code:${NetworkPriceBillingUsageCode.DEV_ENDPOINT_TRANSACTION.toString()} , for connectSubscriptionId:${connectSubscriptionId}, connectSubscriptionItemId:${devEndPointLineItem._id.toString()} `);
        throw (error);
      }
    }
    // #endregion

    // #region Update subscription
    const subUpdateResult = await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription);
    // #endregion 

    return results;
  }

  // #endregion

  // #region Cron Job Methods

  /**
   * Handles {@link TaskQueueItemTaskType.SUBSCRIPTION_TERMINATION}
   * @param connectSubscriptionId 
   * @returns 
   */
  async processSubscriptionTermination(connectSubscriptionId: string): Promise<void> {
    // #region Load Dependencies 
    const connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${connectSubscriptionId} not found`);
    const userDetails = await this.userDataService.getUserById(connectSubscription.userId);
    if (!userDetails) throw new NotFoundException(`connect user for userId:${connectSubscription.userId} not found`);
    // #endregion

    // #region Edge case , not currently handled , Check if any usages happened between last usage reported date and actual end date
    //   
    //   if so need a new bill in stripe & sync to QuickBooks. 
    // const startDate = connectSubscription.currentPeriod.meteredUsageEnd;
    // const endDate = connectSubscription.currentPeriod.billingEnd * 1000;
    // const usageResults = await this.processSubscriptionMeteredUsage(connectSubscription._id.toString(), connectSubscription, userDetails, startDate, endDate);
    // if (usageResults.isSuccess) {
    //   const totalUsage = usageResults.data.reduce((total, data) => total + data.unitQuantity, 0);
    //   if (totalUsage > 0) {
    //     // create invoice for pending usage 
    //     const items = connectSubscription.items.filter(x => usageResults.data.find(y => y.connectSubscriptionItemId === x._id.toString()));

    //     // Create invoice items

    //     // Create invoice

    //     // Finalize an invoice

    //     // get payment method

    //     // Pay Invoice
    //   }
    // }
    // #endregion

    //  Call Service termination for each service on subscription

    const groupedByNetworkBillingCategory = connectSubscription.items.reduce((results: { [key: string]: { networkId: string, billingCategory: NetworkPriceBillingCategory, items: ConnectSubscriptionItem[] } }, item: ConnectSubscriptionItem) => {
      const groupName = `${item.networkId} -${item.networkPrice.billingCategory._id.toString()} `;
      if (!results[groupName]) results[groupName] = { networkId: item.networkId, billingCategory: item.networkPrice.billingCategory, items: [] };
      results[groupName].items.push(item);
      return results;
    }, {});

    for (const [key, value] of Object.entries(groupedByNetworkBillingCategory)) {
      const networkId = value.networkId;
      const billingCategory = value.billingCategory;
      try {
        await this.networkCancellationService.terminateNetworkServiceOffering(userDetails, networkId, billingCategory);
      } catch (error) {
        this.logger.error(`Error calling networkCancellationService.terminateNetworkServiceOffering(userId: ${userDetails.id}, networkId: ${networkId}, billingCategoryId: ${billingCategory._id.toString()}) from processSubscriptionTermination`, error);
      }

    }

    // update 
    connectSubscription.status = ConnectSubscriptionStatus.Canceled;
    // persist 
    (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();


  }

  /**
   * Handles {@link TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION}
   * Gets created on Stripe webhook line item(s) removal event. 
   * Will be scheduled to run at end of current subscription cycle end date, this is because there may be pending usage that needs to get reported for canceled service. 
   * @param connectSubscriptionId 
   * @param networkId 
   * @param billingCategoryId 
   * @returns 
   */
  async processSubscriptionNetworkTermination(connectSubscriptionId: string, networkId: string, billingCategoryId: string): Promise<void> {
    // #region Validation 
    const connectSubscription = await this.getSubscriptionByIdPopulateItemsNetworkPrice(connectSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connectSubscription for stripeSubscriptionId:${connectSubscriptionId} not found`);

    const userDetails = await this.userDataService.getUserById(connectSubscription.userId);
    if (!userDetails) throw new NotFoundException(`connect user for userId:${connectSubscription.userId} not found`);

    const billingCategory = (await this.dataContext.networkPriceBillingCategories.findById(billingCategoryId)).toObject<NetworkPriceBillingCategory>();
    if (!billingCategory) throw new NotFoundException(`Error billingCategoryId: ${billingCategoryId}, not found`);
    // #endregion

    // grab all network & billing category related items that are metered, this should be all thats left to remove at this point in the workflow 
    // this is because we must allow the subscription cycle to finish before removing any metered related items
    const networkBillingCategoryRelatedItems = connectSubscription.items.filter(x => x.networkId === networkId && x.networkPrice.billingCategory._id.toString() === billingCategory._id.toString());
    const stripeItemsToRemove = networkBillingCategoryRelatedItems.filter(x => x.networkPrice.isMetered);

    // update subscription items
    connectSubscription.items = connectSubscription.items.filter(x => !networkBillingCategoryRelatedItems.find(y => y._id.toString() === x._id.toString()));
    // update networks list
    connectSubscription.networks = [...new Set(connectSubscription.items.map(x => x.networkId))];

    const [a, b, c] = await Promise.allSettled([
      // persist
      this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription),
      // clean up resources
      this.networkCancellationService.terminateNetworkServiceOffering(userDetails, networkId, billingCategory),
      // call stripe & remove line items
      Promise.allSettled(stripeItemsToRemove.map(x => this.stripeService.removeItemFromSubscription(connectSubscription.stripeSubscriptionId, x.stripeItemId, x.networkPrice.isMetered)))
    ]);

    if (b.status === "rejected") {
      this.logger.error(`error calling networkCancellationService.terminateNetworkServiceOffering`, null, { error: b.reason });
    }

  }

  // #endregion

  // #region Helper methods

  /**
   * Quickbooks integration. method will get/or create a quick books customer for current user and then create qbo invoice and payment
   * @param connectSubscription 
   * @param stripeInvoice 
   * @param stripePaymentIntentId 
   * @param invoiceDiscountTotal 
   * @returns 
   */
  private async getOrCreateMatchingQuickbooksInvoiceId(connectSubscription: ConnectSubscription, stripeInvoice: Stripe.Invoice, stripePaymentIntentId: string, invoiceDiscountTotal: number)
    : Promise<string> {
    // get customerRef to create Invoice
    let user = (await this.dataContext.users.findOne({ id: connectSubscription.userId })).toObject<IUser>();
    let connectBillingQbCustomer = user?.billingDetails?.quickbooks?.customerRef?.value ? user.billingDetails.quickbooks.customerRef : null;
    if (!connectBillingQbCustomer) {
      // check if we have a existing qb customer for given email
      const existingQbCustomers = await this.quickbooksCustomerService.getCustomerByEmailAddress(user.email);
      if (existingQbCustomers && existingQbCustomers.length > 0) {
        const _existingQbCustomer = existingQbCustomers[0];
        if (existingQbCustomers.length > 1) {
          this.logger.warn(`Found more than one qb user for email ${user.email} using customer id:${_existingQbCustomer?.Customer?.Id} `);
        }
        // update
        user.billingDetails = {
          ...user.billingDetails,
          quickbooks: {
            customerRef: {
              name: _existingQbCustomer.Customer.DisplayName,
              value: _existingQbCustomer.Customer.Id
            }
          }
        };
        // persist
        const userUpdateResponse = (await this.userDataService.update(user));
        if (userUpdateResponse.status !== ApiResultStatus.Success) {
          this.logger.fatal(`Error updating user.${userUpdateResponse.data} `);
          throw Error(userUpdateResponse.data);
        }
        user = userUpdateResponse.data;

        connectBillingQbCustomer = {
          name: _existingQbCustomer.Customer.DisplayName,
          value: _existingQbCustomer.Customer.Id,
        };
      } else {
        // create a qbCustomer
        const data: CustomerCreateQuickbooksRequestDto = {
          GivenName: user.firstName,
          FamilyName: user.lastName,
          CompanyName: user.companyName,
          // DisplayName must be unique
          DisplayName: `${user.companyName ? `${user.companyName} | ` : ``}${user.firstName} ${user.lastName} ( ${user.email} )`,
          PrimaryEmailAddr: { Address: user.email, },
        };
        const newCustomer = await this.quickbooksCustomerService.createCustomer(data);
        if (!newCustomer) {
          const msg = `Failed creating new Quickbooks Customer for Stripe Subscription ${connectSubscription.stripeSubscriptionId} `;
          this.logger.fatal(msg);
          throw Error(msg);
        }
        // update
        user.billingDetails = {
          ...user.billingDetails,
          quickbooks: {
            customerRef: {
              name: newCustomer.Customer.DisplayName,
              value: newCustomer.Customer.Id
            }
          }
        };
        // persist
        const userUpdateResponse = (await this.userDataService.update(user));
        if (userUpdateResponse.status !== ApiResultStatus.Success) {
          this.logger.fatal(`Error updating user.${userUpdateResponse.data} `);
          throw Error(userUpdateResponse.data);
        }
        user = userUpdateResponse.data;
        connectBillingQbCustomer = {
          name: newCustomer.Customer.DisplayName,
          value: newCustomer.Customer.Id,
        };
      }

    }

    // Map quickbooks + stripe lineItems to add to invoice
    const networkPrices = connectSubscription.items.map(item => item.networkPrice);
    const stripeItems = (stripeInvoice as Stripe.Invoice).lines.data;
    const invoiceLineItems: QuickbooksInvoicingLineItem[] = stripeItems.map((stripeLine: Stripe.InvoiceLineItem) => {
      return {
        DetailType: "SalesItemLineDetail",
        Amount: stripeLine.amount / 100,
        Description: stripeLine.proration ? `Prorated amount.${stripeLine.description} ` : null,
        SalesItemLineDetail: {
          ItemRef: {
            name: "",
            value: networkPrices.find(price => price.stripeId === stripeLine.price.id).quickBooksItemId
          }
        }
      } as QuickbooksInvoicingLineItem;
    });


    // capture discounts
    if (invoiceDiscountTotal > 0) {
      invoiceLineItems.push({
        DetailType: "DiscountLineDetail",
        Amount: invoiceDiscountTotal,
        Description: "Automatically applied coupon",
        DiscountLineDetail: {
          DiscountPercent: 0,
          PercentBased: false
        }
      } as QuickbooksInvoicingLineItem);
    }

    // create quickbooks Invoice
    const invoiceData: QuickbooksCreateInvoice = {
      CustomerRef: connectBillingQbCustomer,
      Line: invoiceLineItems,
    };

    // create QB invoice
    const quickbooksInvoice = await this.quickbooksInvoiceService.createInvoice(invoiceData);

    // mark invoice as paid
    const quickBooksPayment: QuickBooksPayment = {
      CustomerRef: {
        value: Number(connectBillingQbCustomer.value),
      },
      PrivateNote: `stripePaymentIntentId: ${stripePaymentIntentId}; invoice number ${stripeInvoice.number} `,
      TotalAmt: stripeInvoice.amount_paid / 100,
      Line: [
        {
          Amount: stripeInvoice.amount_paid / 100,
          LinkedTxn: [
            {
              TxnId: Number(quickbooksInvoice.Id),
              TxnType: "Invoice",
            }
          ]
        }
      ]
    };

    try {
      if (quickBooksPayment.TotalAmt > 0) {
        const paid = await this.quickbooksInvoiceService.payInvoice(quickBooksPayment);
      }
    } catch (error) {
      this.logger.fatal(`Error capturing qb payment for quickbooksInvoiceId:${quickbooksInvoice?.Id}.error:${error?.message} `, error);
    }

    return quickbooksInvoice?.Id;

  }

  /**
   * Disables related services from Connect Subscription & creates a scheduled task type {@link TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION}
   * Used only when keeping Subscription but terminating (select) services
   * @param connectSubscription 
   * @param itemsToCancel 
   * @param initiatedFromStripe 
   * @returns 
   */
  private async cancelSelectServicesHelper(connectSubscription: ConnectSubscription, itemsToCancel: ConnectSubscriptionItem[])
    : Promise<void> {
    // only process non metered items
    itemsToCancel = itemsToCancel.filter(x => !x.networkPrice.isMetered);
    if (itemsToCancel.length === 0) return
    // set termination date for end of current billing period , this way we allow for metered usage to get reported 
    // add 3 hours because stripe waits 1 hour after billing end date to charge CC on file, so give a cushion before cleaning up 
    const dateToTerminateService = DateTime.fromMillis(connectSubscription.currentPeriod.billingEnd * 1000).plus({ hour: 3 }).toMillis();
    const userDetails = await this.userDataService.getUserById(connectSubscription.userId);
    if (!userDetails) throw new NotFoundException(`connect user for userId:${connectSubscription.userId} not found`);

    // group by networkId & billingCategory, so we can handle termination  
    const groupedByNetworkBillingCategory = itemsToCancel.reduce((results: { [key: string]: { networkId: string, billingCategory: NetworkPriceBillingCategory, items: ConnectSubscriptionItem[] } }, item: ConnectSubscriptionItem) => {
      const groupName = `${item.networkId} -${item.networkPrice.billingCategory._id.toString()} `;
      if (!results[groupName]) results[groupName] = { networkId: item.networkId, billingCategory: item.networkPrice.billingCategory, items: [] };
      results[groupName].items.push(item);
      return results;
    }, {});

    for (const [key, value] of Object.entries(groupedByNetworkBillingCategory)) {
      const networkId = value.networkId;
      const billingCategory = value.billingCategory;


      connectSubscription.items = connectSubscription.items.map(x => {
        if (x.networkId === networkId && x.networkPrice.billingCategory._id.toString() === billingCategory._id.toString()) {
          // update status
          x.statusOverride = ConnectSubscriptionItemStatus.PendingCancelation;
        }
        return x;
      });

      const [disableResults, task] = await Promise.allSettled([
        // disable network services for given billing category 
        this.networkCancellationService.disableNetworkServiceOffering(userDetails, networkId, billingCategory),
        // Create Scheduled task to process service termination (final clean-up). On Cancelation Date
        this.taskQueueItemDataService.createScheduledTask(TaskQueueItemTaskType.SUBSCRIPTION_NETWORK_TERMINATION,
          TaskQueueItemRecurrence.ONCE,
          {
            connectSubscriptionId: connectSubscription._id.toString(),
            networkId: networkId,
            billingCategoryId: billingCategory._id.toString()
          },
          dateToTerminateService)
      ]);

      if (disableResults.status === "rejected") {
        this.logger.error(`Error calling networkCancellationService.disableNetworkServiceOffering(userId: ${userDetails.id}, networkId: ${networkId}, billingCategoryId: ${billingCategory._id.toString()}) from cancelSelectServicesHelper :: error ${disableResults.reason}`);
      }

    }

    // persist
    connectSubscription = (await this.dataContext.connectSubscriptions.updateByIdAndSave(connectSubscription._id, connectSubscription)).toObject<ConnectSubscription>();

  }

  /**
   * 
    * Helper method to create connect subscription invoice
    * @param connectSubscription 
    * @param stripeInvoiceId 
    * @param overrideBillingStart  if provided will update  {@link ConnectSubscriptionInvoice} billingStart
    * @param overrideBillingEnd if provided will update  {@link ConnectSubscriptionInvoice} billingEnd
    * @param overrideMeteredUsageStart if provided will update  {@link ConnectSubscriptionInvoice} meteredUsageStart
    * @param overrideMeteredUsageEnd   if provided will update  {@link ConnectSubscriptionInvoice} meteredUsageEnd
    * @returns 
  */
  private async ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper(connectSubscription: ConnectSubscription, stripeInvoiceId: string,
    overrideBillingStart: number = null, overrideBillingEnd: number = null,
    overrideMeteredUsageStart: number = null, overrideMeteredUsageEnd: number = null)
    : Promise<void> {
    let networkSubInvoice = await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId: stripeInvoiceId });

    let runUpdate = networkSubInvoice != null;

    // Get Stripe Invoice
    const stripeInvoice = await this.stripeService.getInvoiceById(stripeInvoiceId);
    if (stripeInvoice.isFailure) {
      throw (stripeInvoice.error);
    }

    const stripeItems = (stripeInvoice.data as Stripe.Invoice)?.lines?.data;
    const connectInvoiceLineItems: ConnectSubscriptionInvoiceLineItem[] = stripeItems?.map((sLine) => {
      const connectSubLineItem = connectSubscription?.items?.find(i => i.networkPrice?.stripeId === sLine?.price?.id);
      return {
        stripeLineItemId: sLine.id,
        connectSubscriptionItemId: connectSubLineItem?._id,
        networkId: connectSubLineItem?.networkId,
        networkPrice: connectSubLineItem?.networkPrice._id,
        userNetwork: connectSubLineItem?.userNetwork == null ? "" : typeof connectSubLineItem?.userNetwork === 'object' ? connectSubLineItem?.userNetwork?._id : (connectSubLineItem?.userNetwork as string).toString(),
        title: sLine.price?.nickname,
        description: sLine.description,
        quantity: sLine.quantity,
        lineTotal: sLine.amount_excluding_tax / 100,
        unitAmount: Number(sLine.unit_amount_excluding_tax) / 100,
        proration: sLine.proration,
        prorationDate: sLine.proration ? sLine.period.start * 1000 : null
      } as ConnectSubscriptionInvoiceLineItem;
    });

    if (!networkSubInvoice) {

      try {
        const user = await this.userDataService.getUserById(connectSubscription.userId);
        // create invoice synced with stripe sub invoice
        await this.dataContext.connectSubscriptionInvoices.create({
          userId: connectSubscription.userId,
          number: stripeInvoice.data?.number,
          tenantId: user.activeTenant?.tenantId || user.tenants[0],
          status: ConnectSubscriptionInvoiceStatus.Draft,
          stripeInvoiceId: stripeInvoiceId,
          connectSubscription: connectSubscription,
          amount: stripeInvoice.data?.total / 100,
          period: {
            billingStart: overrideBillingStart || connectSubscription.currentPeriod?.billingStart,
            billingEnd: overrideBillingEnd || connectSubscription.currentPeriod?.billingEnd,
            meteredUsageStart: overrideMeteredUsageStart || connectSubscription.currentPeriod.meteredUsageStart,
            meteredUsageEnd: overrideMeteredUsageEnd || connectSubscription.currentPeriod.meteredUsageEnd
          },
          lines: connectInvoiceLineItems
        });

      } catch (error) {
        if (error.code === 11000) {
          // webhooks are kicked off and proceeded in parallel this is a valid use case. 
          // "E11000 duplicate key error collection: connect.connectsubscriptioninvoices index: stripeInvoiceId"
          runUpdate = true;
          networkSubInvoice = await this.dataContext.connectSubscriptionInvoices.findOne({ stripeInvoiceId: stripeInvoiceId });
        } else {
          this.logger.fatal(`error creating connect subscription invoice for stripeInvoiceId: ${stripeInvoiceId}.Error: ${error.message} `, error);
          throw (error);
        }

      }

    }

    if (runUpdate) {
      // Update
      networkSubInvoice.number = stripeInvoice.data?.number;
      networkSubInvoice.lines = connectInvoiceLineItems;
      // metered usage
      if (overrideMeteredUsageStart != null) {
        networkSubInvoice.period.meteredUsageStart = overrideMeteredUsageStart;

      }
      if (overrideMeteredUsageEnd != null) {
        networkSubInvoice.period.meteredUsageEnd = overrideMeteredUsageEnd;

      }
      // billing
      if (overrideBillingStart != null) {
        networkSubInvoice.period.billingStart = overrideBillingStart;

      }
      if (overrideBillingEnd != null) {
        networkSubInvoice.period.billingEnd = overrideBillingEnd;

      }

      // persist
      await this.dataContext.connectSubscriptionInvoices.updateByIdAndSave(networkSubInvoice._id, networkSubInvoice);
    }

  }
  /**
   * Returns the date for which metered usage must be reported. 
   * @param periodEndInMillis Current subscription period end in milliseconds 
   * @returns 
   */
  private calculateMeteredUTCEndDate(periodEndInMillis: number) {
    return DateTime.fromMillis(periodEndInMillis).endOf('day').minus({ day: this.METERED_BILLING_DAYS_IN_ARREARS }).toUTC().toMillis();
  }

  private mapStripeSubscriptionStatusToConnectSubscriptionStatusHelper(stripeSubscriptionStatus: string): ConnectSubscriptionStatus {
    // https://stripe.com/docs/api/subscriptions/object#subscription_object-status
    switch (stripeSubscriptionStatus) {
      case `incomplete`:
        return ConnectSubscriptionStatus.Incomplete;
      case `incomplete_expired`:
        return ConnectSubscriptionStatus.IncompleteExpired;
      case `active`:
        return ConnectSubscriptionStatus.Active;
      case `past_due`:
        return ConnectSubscriptionStatus.PastDue;
      case `canceled`:
        return ConnectSubscriptionStatus.Canceled;
      case `unpaid`:
        return ConnectSubscriptionStatus.Unpaid;
      default:
        return null;
    }
  }

  private mapConnectSubscriptionNetworkOfferingRecurrenceToTaskQueueRecurrence(recurrence: ConnectSubscriptionRecurrence): TaskQueueItemRecurrence {
    let results = TaskQueueItemRecurrence.MONTHLY;
    switch (recurrence.toLowerCase().trim()) {
      case `monthly`:
        results = TaskQueueItemRecurrence.MONTHLY;
        break;
      case `weekly`:
        results = TaskQueueItemRecurrence.WEEKLY;
        break;
      case `yearly`:
        results = TaskQueueItemRecurrence.YEARLY;
        break;
      default:
        break;
    }
    return results;
  }

  private mapRecurrenceToConnectSubscriptionRecurrence(recurrence: NetworkOfferingRecurrence | string): ConnectSubscriptionRecurrence {
    let results = ConnectSubscriptionRecurrence.Monthly;
    switch (recurrence.toLowerCase().trim()) {
      case `monthly`:
        results = ConnectSubscriptionRecurrence.Monthly;
        break;
      case `weekly`:
        results = ConnectSubscriptionRecurrence.Weekly;
        break;
      case `yearly`:
        results = ConnectSubscriptionRecurrence.Yearly;
        break;
      default:
        break;
    }
    return results;
  }
  // #endregion
}