import crypto from "node:crypto";
import { Inject, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { Cart, CartError, CartItem, CartStatus } from "@blockspaces/shared/models/cart";
import { BillingAddressDto, CartPaymentConfig, CartSessionResponseDto, UserCartDto, UserCartItemDto } from "@blockspaces/shared/dtos/cart";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { StripeService } from "../../stripe/services/StripeService";
import { NetworkCatalogDataService } from "../../network-catalog/services/NetworkCatalogDataService";
import { IUser } from "@blockspaces/shared/models/users";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { ConnectSubscriptionService } from "../../connect-subscription/services/ConnectSubscriptionService";
import { UserDataService } from "../../users/services/UserDataService";
import { UserNetworkDataService } from "../../user-network/services/UserNetworkDataService";
import { ConnectSubscriptionStatus, PaymentMethod } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { NetworkOffering, NetworkOfferingItem, NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog";
import { UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { ValidationException, BadRequestException } from "../../exceptions/common";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";

@Injectable()
export class CartService {

  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly dataContext: ConnectDbDataContext,
    private readonly networkCatalogDataService: NetworkCatalogDataService,
    private readonly stripeService: StripeService,
    private readonly connectSubscriptionService: ConnectSubscriptionService,
    private readonly userNetworkDataService: UserNetworkDataService,
    private readonly userDataService: UserDataService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {

    logger.setModule(this.constructor.name);
  }

  /**
   * Get Cart session by id, Used by UI when Polling Cart Status while pending payment 
   * @param cartId 
   * @returns 
   */
  async getCartById(cartId: string): Promise<UserCartDto> {
    const cartSession = (await this.dataContext.cart.findById(cartId))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`cartId: ${cartId} not found.`);
    return this.mapCartToUserCartDto(cartSession);
  }

  async getCartPendingPaymentByUserId(userId: string): Promise<CartSessionResponseDto> {
    const cartSession = (await this.dataContext.cart.findOne({ userId: userId, status: { $in: [CartStatus.PENDING_PROCESSING_PAYMENT] } }, {}, { populate: "billingCategory" }))?.toObject<Cart>();
    if (!cartSession) return null;

    const priceCatalogResults = await this.networkCatalogDataService.getNetworkOfferingsForCart(cartSession.networkId, (cartSession.billingCategory as NetworkPriceBillingCategory)._id.toString());
    if (priceCatalogResults.isFailure) throw new BadRequestException(priceCatalogResults.message);
    if (priceCatalogResults.data.length === 0) throw new ValidationException("Product not available for purchase");


    const network = await this.networkCatalogDataService.findById(cartSession.networkId);


    const stripePaymentTokenResult = await this.connectSubscriptionService.getSubscriptionStripePaymentToken(cartSession.connectSubscriptionId);
    const paymentConfig = {
      key: this.env.stripe.publishableKey,
      paymentToken: stripePaymentTokenResult.paymentToken,
      amountDue: stripePaymentTokenResult.amountDue,
      couponApplied: Boolean(this.env.stripe.autoApplyLightningCoupon),
      discountTotal: stripePaymentTokenResult.discountTotal
    };
    // return session  
    return {
      network: network,
      cart: await this.mapCartToUserCartDto(cartSession),
      paymentConfig: paymentConfig,
      catalog: priceCatalogResults.data
    } as CartSessionResponseDto;
  }

  /**
   *  Returns Cart Session for a given user & network. Only 1 cart session with a status not equal to {@link CartStatus.CHECKOUT_COMPLETE} per user allowed at a time, due to current design limits
   * @param userId 
   * @param networkId 
   * @returns Cart Session with available price catalog for given network 
   */
  async initCartSessionForNetwork(user: IUser, networkId: string, billingCategoryCode: string): Promise<CartSessionResponseDto> {
    const billingCategory = await this.dataContext.networkPriceBillingCategories.findOne({ code: billingCategoryCode });
    const billingCategoryId = billingCategory?._id;
    // check if user already has a user network record, if so assume they have already gone through cart checkout process 
    const userNetwork = await this.userNetworkDataService.findByUserAndNetwork(user.id, networkId, billingCategoryId);
    if (userNetwork && userNetwork.status !== UserNetworkStatus.PendingCancelation) {
      throw new ValidationException(`You already have this network configured`);
    }

    // check if the user's master-subscription is PendingCancelation, if so need to wait for background processes to clean up PendingCancelation
    if (userNetwork?.status === UserNetworkStatus.PendingCancelation) {
      const sub = await this.connectSubscriptionService.getSubscriptionPendingCancelationForUser(user.id);
      if (sub) throw new ValidationException(`Your subscription is pending cancelation, please check back in a couple hours`);
    }

    let paymentConfig: CartPaymentConfig = null;
    // grab network prices
    const priceCatalogResults = await this.networkCatalogDataService.getNetworkOfferingsForCart(networkId, billingCategoryId);
    if (priceCatalogResults.isFailure) throw new BadRequestException(priceCatalogResults.message);
    if (priceCatalogResults.data.length === 0) throw new ValidationException("Product not available for purchase");

    // check if a cart session is already created 
    let cartSession: Cart = (await this.dataContext.cart.findOne({ userId: user.id, status: { $ne: CartStatus.CHECKOUT_COMPLETE } })
      .populate({ path: "items.offer", populate: { path: "items.price" } }))?.toObject<Cart>();

    if (cartSession && cartSession.networkId !== networkId) {
      switch (cartSession.status) {
        case CartStatus.PENDING_PROCESSING_PAYMENT:
          throw new ValidationException(`You already have a pending payment, please complete that before adding new services.`);
      }
      // reset session
      cartSession = await this.clearCartHelper(cartSession, networkId, billingCategoryId);
    }



    if (!cartSession) {
      // no pending session found, create a new one
      cartSession = (await this.dataContext.cart.create({
        date: new Date(),
        userId: user.id,
        networkId,
        billingCategory: billingCategoryId,
        status: CartStatus.EMPTY
      })).toObject();
    }

    // check status
    switch (cartSession.status) {
      case CartStatus.PENDING_CC_INFO:
      case CartStatus.PENDING_PROCESSING_PAYMENT: {
        const stripePaymentTokenResult = await this.connectSubscriptionService.getSubscriptionStripePaymentToken(cartSession.connectSubscriptionId);
        paymentConfig = {
          key: this.env.stripe.publishableKey,
          paymentToken: stripePaymentTokenResult.paymentToken,
          amountDue: stripePaymentTokenResult.amountDue,
          couponApplied: Boolean(this.env.stripe.autoApplyLightningCoupon),
          discountTotal: stripePaymentTokenResult.discountTotal
        };
        break;
      }
      case CartStatus.PENDING_NEW_ADDITION_CONFIRMATION: {
        const offeringItems = cartSession.items.reduce((results: NetworkOfferingItem[], item: CartItem) => results.concat(item.offer.items), []).map(x => x);
        const subProrateCalc = await this.connectSubscriptionService.getProrateAmountForSubscription(cartSession.connectSubscriptionId, offeringItems);
        paymentConfig = {
          key: null,
          paymentToken: this.getInternalConfirmationToken(user, cartSession),
          amountDue: subProrateCalc.amountDue,
          couponApplied: false,
          discountTotal: subProrateCalc.discountTotal
        };
      }
    }


    if (cartSession.status === CartStatus.EXPIRED
      || cartSession.status === CartStatus.ERROR_GATEWAY_ERROR
      || cartSession.status === CartStatus.PENDING_CC_FOR_FREE_OFFER
      || cartSession.status === CartStatus.PENDING_BILLING_FOR_FREE_OFFER
    ) {
      cartSession = await this.clearCartHelper(cartSession);
    }

    const network = await this.networkCatalogDataService.findById(networkId);

    // return session  
    return {
      network: network,
      cart: await this.mapCartToUserCartDto(cartSession),
      paymentConfig: paymentConfig,
      catalog: priceCatalogResults.data
    } as CartSessionResponseDto;

  }

  /**
   * Add items to cart session. 
   * @param userId 
   * @param cartId 
   * @param items 
   * @returns Cart Session with a status of {@link CartStatus.PENDING_BILLING_INFO}
   */
  async addCartItem(user: IUser, cartId: string, items: UserCartItemDto[]): Promise<CartSessionResponseDto> {
    if (!items || items?.length === 0) throw new BadRequestException(`items cannot be empty`);
    let paymentConfig: CartPaymentConfig = null;
    // get cart session for user
    let cartSession: Cart = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id }, {}, { populate: "billingCategory" }))?.toObject<Cart>();

    if (!cartSession) throw new NotFoundException("Cart session not found");

    // get network details
    const network = await this.networkCatalogDataService.findById(cartSession.networkId);

    // confirm status
    switch (cartSession.status) {
      case CartStatus.PENDING_PROCESSING_PAYMENT:
      case CartStatus.ERROR_GATEWAY_ERROR:
      case CartStatus.CHECKOUT_COMPLETE: {
        throw new ValidationException(`Cart status is not valid`);
      }
    }

    // validate items against network offerings
    const networkOfferings = await this.networkCatalogDataService.getActiveNetworkOfferingsByNetworkId(cartSession.networkId);

    // get catalog items
    const priceCatalogResults = await this.networkCatalogDataService.getNetworkOfferingsForCart(cartSession.networkId, (cartSession?.billingCategory as NetworkPriceBillingCategory)?._id.toString());
    if (priceCatalogResults.isFailure) throw new BadRequestException(priceCatalogResults.message);

    // check if we have any invalid items
    const invalidEntry = items.filter((x: UserCartItemDto) => networkOfferings.find(y => y._id.toString() === x.offerId)).length !== items.length;
    if (invalidEntry) throw new ValidationException(`Invalid items`);

    // check if items have changed
    const validItems = items.map((x: UserCartItemDto) => {
      // grab offer from source of truth 
      const networkOffer = networkOfferings.find(y => y._id.toString() === x.offerId);
      return {
        offer: networkOffer
      };
    });

    // check if user has existing subscription
    // Assume Fiat
    const paymentMethod = PaymentMethod.Fiat;
    const recurrence = validItems[0].offer.recurrence;
    const hasExistingActiveSubscription = await this.connectSubscriptionService.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod(user.id, recurrence, paymentMethod);


    // clear items if needed &  add item to cart
    if (cartSession.status !== CartStatus.EMPTY)
      cartSession = await this.clearCartHelper(cartSession);

    // add items to cart
    cartSession.items = validItems;


    const cartTier = (validItems[0].offer.billingTier as BillingTier).code;
    // Handle Free Offer
    if (cartTier === BillingTierCode.Free) {

      cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject();
      await this.userNetworkDataService.addUserNetwork({
        billingCategory: (validItems[0].offer.billingCategory as NetworkPriceBillingCategory)._id,
        billingTier: (validItems[0].offer.billingTier as BillingTier)._id,
        networkId: network._id,
        userId: user.id
      });
      // return session  
      return {
        network,
        cart: await this.mapCartToUserCartDto(cartSession),
        catalog: priceCatalogResults.data,
        paymentConfig: null
      } as CartSessionResponseDto;
    } else if (cartTier === BillingTierCode.FreeWithCC && !hasExistingActiveSubscription) {
      // handle case where a new customer chooses a free service that requires a entry in stripe 
      cartSession.status = CartStatus.PENDING_BILLING_FOR_FREE_OFFER;
      cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject();
      return {
        network,
        cart: await this.mapCartToUserCartDto(cartSession),
        catalog: priceCatalogResults.data,
        paymentConfig: null
      } as CartSessionResponseDto;
    }




    // update status , Move cart to next step
    if (hasExistingActiveSubscription) {
      cartSession.status = CartStatus.PENDING_NEW_ADDITION_CONFIRMATION;
      cartSession.connectSubscriptionId = hasExistingActiveSubscription._id;
    }
    else {
      cartSession.status = CartStatus.PENDING_BILLING_INFO;
    }

    // persist 
    cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject();


    if (cartSession.status === CartStatus.PENDING_NEW_ADDITION_CONFIRMATION) {
      // get amount due
      cartSession = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id }).populate({ path: "items.offer", populate: { path: "items.price" } }))?.toObject<Cart>();
      const offeringItems = cartSession.items.reduce((results: NetworkOfferingItem[], item: CartItem) => results.concat(item.offer.items), []).map(x => x);
      const subProrateCalc = await this.connectSubscriptionService.getProrateAmountForSubscription(cartSession.connectSubscriptionId, offeringItems);
      paymentConfig = {
        key: null,
        paymentToken: this.getInternalConfirmationToken(user, cartSession),
        amountDue: subProrateCalc.amountDue,
        couponApplied: false,
        discountTotal: subProrateCalc.discountTotal
      };
    }


    // return session  
    return {
      network,
      cart: await this.mapCartToUserCartDto(cartSession),
      catalog: priceCatalogResults.data,
      paymentConfig
    } as CartSessionResponseDto;
  }

  /**
   * Add billing info to cart session and advance to {@link CartStatus.PENDING_CC_INFO}
   * @param userId 
   * @param cartId 
   * @param billingAddress 
   * @returns Cart Session with a status of {@link CartStatus.PENDING_CC_INFO} & token to link for Stripe payment
   */
  async addBillingInfo(user: IUser, cartId: string, billingAddress: BillingAddressDto)
    : Promise<CartSessionResponseDto> {
    // get cart session for user
    let cartSession = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id })
      .populate({ path: "items.offer", populate: { path: "billingCategory" } })
      .populate({ path: "items.offer", populate: { path: "billingTier" } }))
      ?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`Cart id: ${cartId} not found`);

    // confirm status
    switch (cartSession.status) {
      case CartStatus.CHECKOUT_COMPLETE:
      case CartStatus.PENDING_NEW_ADDITION_CONFIRMATION:
      case CartStatus.PENDING_PROCESSING_PAYMENT: {
        throw new ValidationException("Cart status is not valid");
      }
      default: {
        break;
      }
    }

    // set billing information
    cartSession.billingAddress = {
      fullName: billingAddress.fullName,
      addressLine1: billingAddress.addressLine1,
      addressLine2: billingAddress.addressLine2,
      city: billingAddress.city,
      country: billingAddress.country,
      postalCode: billingAddress.postalCode,
      state: billingAddress.state
    };

    // update status
    if (cartSession.status === CartStatus.PENDING_BILLING_FOR_FREE_OFFER || cartSession.status === CartStatus.PENDING_CC_FOR_FREE_OFFER) {
      cartSession.status = CartStatus.PENDING_CC_FOR_FREE_OFFER;

      // await this.userNetworkDataService.addUserNetwork({
      //   billingCategory: (cartSession.items[0].offer.billingCategory as NetworkPriceBillingCategory)._id,
      //   billingTier: (cartSession.items[0].offer.billingTier as BillingTier)._id,
      //   networkId: cartSession.networkId,
      //   userId: user.id
      // });

    } else {
      cartSession.status = CartStatus.PENDING_CC_INFO;
    }


    // Create stripe customer if not yet created
    const connectUserResult = await this.confirmUserWithStripeCustomerIdCreateIfNotPresent(user, billingAddress);

    // create Stripe payment token
    const network = await this.networkCatalogDataService.findById(cartSession.networkId);
    const stripePaymentTokenResult = await this.connectSubscriptionService.getSubscriptionStripePaymentTokenCreateIfNotPresent(connectUserResult, network, cartSession.connectSubscriptionId, cartSession.billingAddress, cartSession.items.map((x) => x.offer._id.toString()));

    // update cart subscription id
    cartSession.connectSubscriptionId = stripePaymentTokenResult.networkSubId;

    // grab catalog items
    const priceCatalogResults = await this.networkCatalogDataService.getNetworkOfferingsForCart(cartSession.networkId, cartSession?.billingCategory?.toString());
    if (priceCatalogResults.isFailure) throw new BadRequestException(priceCatalogResults.message);

    // persist 
    cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject<Cart>();


    // return session  
    return {
      network,
      cart: await this.mapCartToUserCartDto(cartSession),
      paymentConfig: {
        key: this.env.stripe.publishableKey,
        paymentToken: stripePaymentTokenResult.paymentToken,
        amountDue: stripePaymentTokenResult.amountDue,
        couponApplied: Boolean(this.env.stripe.autoApplyLightningCoupon),
        discountTotal: stripePaymentTokenResult.discountTotal
      },
      catalog: priceCatalogResults.data
    } as CartSessionResponseDto;

  }

  /**
     * Advance cart session to status {@link CartStatus.PENDING_PROCESSING_PAYMENT} 
     * @param userId
     * @param cartId
     * @returns  Cart Session with a status of {@link CartStatus.PENDING_PROCESSING_PAYMENT} 
     */
  async markCartPendingPayment(user: IUser, cartId: string): Promise<UserCartDto> {
    // get cart session for user
    let cartSession = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException("Cart session not found");

    if (cartSession.status === CartStatus.PENDING_PROCESSING_PAYMENT)
      return await this.mapCartToUserCartDto(cartSession);


    switch (cartSession.status) {
      case CartStatus.PENDING_CC_INFO:
      case CartStatus.ERROR_GATEWAY_ERROR: {
        break;
      }
      default: {
        throw new ValidationException("Cart status is not valid");
      }
    }

    // update status 
    cartSession.status = CartStatus.PENDING_PROCESSING_PAYMENT;

    // persist 
    cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject();

    // return session  
    return await this.mapCartToUserCartDto(cartSession);

  }

  /**
   * Used when cart is in status {@link CartStatus.PENDING_NEW_ADDITION_CONFIRMATION}. Will update user existing subscription 
   * and bypass payment collection
   * @param user 
   * @param cartId 
   * @returns 
   */
  async confirmCartPendingItems(user: IUser, cartId: string, paymentToken: string): Promise<UserCartDto> {
    // get cart session for user
    let cartSession = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException("Cart session not found");

    // confirm status
    switch (cartSession.status) {
      case CartStatus.PENDING_NEW_ADDITION_CONFIRMATION: {
        break;
      }
      default: {
        throw new ValidationException("Cart status is not valid");
      }
    }

    if (paymentToken !== this.getInternalConfirmationToken(user, cartSession))
      throw new BadRequestException("Invalid payment token");


    // update existing subscription 
    const newOffers = cartSession.items.map((x) => x.offer.toString());
    const updateResult = await this.connectSubscriptionService.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(cartSession.connectSubscriptionId, cartSession.networkId, newOffers[0]);

    // update cart
    cartSession.status = CartStatus.CHECKOUT_COMPLETE;

    // persist cart
    cartSession = await this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession);

    return await this.mapCartToUserCartDto(cartSession);
  }

  /**
   * 
   * @param user 
   * @param cartId 
   * @param cartError 
   * @returns 
   */
  async markCartWithPaymentError(user: IUser, cartId: string, cartError: CartError): Promise<UserCartDto> {
    // get cart session for user
    let cartSession = (await this.dataContext.cart.findOne({ _id: cartId, userId: user.id })).toObject<Cart>();
    if (!cartSession) throw new NotFoundException("Cart session not found");

    if (cartSession.status === CartStatus.ERROR_GATEWAY_ERROR)
      return await this.mapCartToUserCartDto(cartSession);


    if (cartSession.status === CartStatus.CHECKOUT_COMPLETE)
      throw new ValidationException("Cart status is not valid");


    // update status 
    cartSession.status = CartStatus.ERROR_GATEWAY_ERROR;
    cartSession.cartError = cartError;

    // persist 
    cartSession = (await this.dataContext.cart.updateByIdAndSave(cartId, cartSession)).toObject();

    // return session  
    return await this.mapCartToUserCartDto(cartSession);

  }
  // #region Integrations Methods. Should move to a Cart Integration Service ?

  /**
 * Stripe webhook integration, mark cart with error from stripe payment gateway 
 * @param stripeSubscriptionId 
 * @param cartError 
 */
  async markCartWithPaymentErrorForStripeSubscription(stripeSubscriptionId: string, cartError: CartError): Promise<void> {
    const connectSubscription = await this.connectSubscriptionService.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription with stripeSubscriptionId:${stripeSubscriptionId} not found`);

    const cartSession = (await this.dataContext.cart.findOne({ connectSubscriptionId: connectSubscription._id, status: { $ne: CartStatus.CHECKOUT_COMPLETE } }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`Cart for connect subscription Id:${connectSubscription._id} not found`);

    // update
    cartSession.status = CartStatus.ERROR_GATEWAY_ERROR;
    cartSession.cartError = cartError;

    // persist
    const cart = await this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession);

  }

  /**
   * Stripe webhook integration, mark cart {@link CartStatus.CHECKOUT_COMPLETE}
   * @param stripeSubscriptionId 
   * @returns 
   */
  async markCartCheckoutCompleteForStripeSubscription(stripeSubscriptionId: string): Promise<Cart> {
    const connectSubscription = await this.connectSubscriptionService.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription with stripeSubscriptionId:${stripeSubscriptionId} not found`);

    let cartSession = (await this.dataContext.cart.findOne({ connectSubscriptionId: connectSubscription._id, status: { $ne: CartStatus.CHECKOUT_COMPLETE } }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`Cart for connect subscription Id:${connectSubscription._id} not found`);


    switch (cartSession.status) {
      case CartStatus.PENDING_BILLING_FOR_FREE_OFFER:
      case CartStatus.PENDING_CC_FOR_FREE_OFFER:
        return cartSession;
      default:
        break;
    }

    // update
    cartSession.status = CartStatus.CHECKOUT_COMPLETE;

    // persist
    cartSession = await this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession);

    return cartSession;
  }

  async markCartCheckoutComplete(id: string): Promise<Cart> {
    let cartSession = (await this.dataContext.cart.findOne({ _id: id }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`Cart  Id:${id} not found`);

    // update
    cartSession.status = CartStatus.CHECKOUT_COMPLETE;

    // persist
    cartSession = await this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession);

    return cartSession;
  }

  /**
   * Stripe webhook integration, mark cart {@link CartStatus.EXPIRED}
   * @param stripeSubscriptionId 
   */
  async expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(stripeSubscriptionId: string): Promise<void> {
    const connectSubscription = await this.connectSubscriptionService.getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (!connectSubscription) throw new NotFoundException(`connect subscription with stripeSubscriptionId:${stripeSubscriptionId} not found`);

    const cartSession = (await this.dataContext.cart.findOne({ connectSubscriptionId: connectSubscription._id, status: { $ne: CartStatus.CHECKOUT_COMPLETE } }))?.toObject<Cart>();
    if (!cartSession) throw new NotFoundException(`Cart for Connect connect subscription Id:${connectSubscription._id} not found`);


    // update
    cartSession.status = CartStatus.EXPIRED;
    cartSession.connectSubscriptionId = null;

    // persist
    const [, connectSubscriptionDeleteResult] = await Promise.allSettled([
      // update cart
      this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession),
      // clean up connect subscription
      this.connectSubscriptionService.deleteSubscriptionWithInvoice(connectSubscription._id)
    ]);

    if (connectSubscriptionDeleteResult?.status === "rejected") throw (connectSubscriptionDeleteResult.reason);


  }

  // #endregion

  // #region Helper Methods

  /**
   * Used to clean up any dependencies 
   * @param userId 
   * @param cartId 
   * @returns Cart Session with status of {@link CartStatus.EMPTY} and available price catalog for given network 
   */
  private async clearCartHelper(cartSession: Cart, networkId: string = null, billingCategoryId: string = null): Promise<Cart> {

    const connectSubscriptionId = cartSession.connectSubscriptionId;

    // clear connect subscription
    if (cartSession.status !== CartStatus.PENDING_NEW_ADDITION_CONFIRMATION && connectSubscriptionId) {
      const sub = await this.connectSubscriptionService.getConnectSubscriptionStatus(connectSubscriptionId);
      if (sub !== ConnectSubscriptionStatus.Active) {
        await this.connectSubscriptionService.deleteSubscriptionWithInvoiceAndCancelStripeSubscription(connectSubscriptionId);
      }

    }
    cartSession.connectSubscriptionId = null;

    // clear items
    cartSession.items = [];

    // update status 
    cartSession.status = CartStatus.EMPTY;

    if (networkId) {
      cartSession.networkId = networkId;
      cartSession.billingCategory = billingCategoryId;
    }

    // persist 
    cartSession = (await this.dataContext.cart.updateByIdAndSave(cartSession._id, cartSession)).toObject();

    return cartSession;

  }

  private async confirmUserWithStripeCustomerIdCreateIfNotPresent(userDetails: IUser, billingAddress: BillingAddressDto): Promise<IUser> {

    if (userDetails.billingDetails?.stripe?.customerId)
      return userDetails;

    // check if a user has already been created with the same email
    const stripeCustomerResult = await this.stripeService.getCustomerByEmail(userDetails.email);
    if (stripeCustomerResult.isFailure)
      throw new BadRequestException(stripeCustomerResult.message);

    let stripeCustomerData = stripeCustomerResult.data;
    // if not create a new user
    if (!stripeCustomerData) {
      const createStripeCustomerResult = await this.stripeService.createCustomer(userDetails.id, {
        email: userDetails.email,
        name: `${billingAddress.fullName}`,
        description: `${userDetails.companyName}`,
        address: {
          line1: billingAddress.addressLine1,
          line2: billingAddress.addressLine2,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        }
      }, userDetails.companyName);
      if (createStripeCustomerResult.isFailure) throw new BadRequestException(createStripeCustomerResult.message);


      stripeCustomerData = createStripeCustomerResult.data;

    }

    // update user details object with stripe id
    userDetails.billingDetails = (userDetails.billingDetails ||
    // initialize 
    {
      stripe: {
        customerId: null
      },
      quickbooks: {
        customerRef: {
          name: null,
          value: null
        }
      }
    });
    // set stripe data
    userDetails.billingDetails = {
      ...userDetails.billingDetails,
      stripe: {
        customerId: stripeCustomerData.id
      }
    };

    // update user
    const userUpdateResponse = (await this.userDataService.update(userDetails));
    if (userUpdateResponse.status !== ApiResultStatus.Success) {
      throw new BadRequestException(userUpdateResponse.data);
    }
    userDetails = userUpdateResponse.data;

    return userDetails;

  }

  private async mapCartToUserCartDto(cart: Cart): Promise<UserCartDto> {
    if (!(cart.billingCategory as NetworkPriceBillingCategory)?.code) {
      const billingCat = await this.dataContext.networkPriceBillingCategories.findById(cart.billingCategory.toString());
      cart.billingCategory = billingCat as NetworkPriceBillingCategory;
    }
    return {
      ...cart,
      id: cart._id.toString(),
      items: cart.items?.map((x) => ({
        offerId: x.offer?._id
      }))
    } as UserCartDto;
  }

  private getInternalConfirmationToken(userDetails: IUser, cartSession: Cart): string {
    return crypto.createHash("sha1").update(`${userDetails.id}-${cartSession._id.toString()}`).digest("base64");
  }

  // #endregion

}