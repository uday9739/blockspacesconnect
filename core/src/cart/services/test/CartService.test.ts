import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { CartService } from "../CartService";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { NetworkCatalogDataService } from "../../../network-catalog/services/NetworkCatalogDataService";
import { Cart, CartError, CartItem, CartStatus } from "@blockspaces/shared/models/cart";
import { EnvironmentVariables } from "../../../env";
import { StripeService } from "../../../stripe/services/StripeService";
import { ConnectSubscriptionService } from "../../../connect-subscription/services/ConnectSubscriptionService";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { IUser } from "@blockspaces/shared/models/users";
import { BillingAddressDto, UserCartDto, UserCartItemDto } from "@blockspaces/shared/dtos/cart";
import { Network, UserNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import ApiResult, { ApiResultStatus, ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { NetworkOffering, NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { ConnectSubscription, ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { StripeCustomer, StripeCustomerResult } from "../../../stripe/types/StripeTypes";



describe(`${CartService.name}`, () => {
  let service: CartService;

  let mockServices: {
    env: EnvironmentVariables,
    dataContext: ConnectDbDataContext,
    networkCatalogDataService: NetworkCatalogDataService,
    stripeService: StripeService,
    connectSubscriptionService: ConnectSubscriptionService,
    userNetworkDataService: UserNetworkDataService,
    userDataService: UserDataService,
    logger: ConnectLogger
  };

  let mockData: {
    networkId: string,
    user: IUser,
    cartItems: UserCartItemDto[],
    networkOfferings: NetworkOffering[],
    cartId: String,
    stripeSubscriptionId: String,
    cartError: CartError,
    paymentToken: String,
    userCartSession: UserCartDto,
    userNetwork: UserNetwork<any>,
    networkOfferingsForCart: ApiResultWithError<NetworkOfferingDTO[], string>,
    connectSubscription: ConnectSubscription,
    emptyCartModel: Cart,
    cartWithItems: Cart,
    cart: Cart,
    network: Network,
    billingAddress: BillingAddressDto,
    billingCategoryCode: NetworkPriceBillingCodes,
    billingCategory: NetworkPriceBillingCategory
  };




  beforeEach(() => {
    mockServices = {
      env: createMock<EnvironmentVariables>({
        stripe: {
          autoApplyLightningCoupon: '',
          publishableKey: ''
        }
      }),
      dataContext: createMock<ConnectDbDataContext>(),
      networkCatalogDataService: createMock<NetworkCatalogDataService>(),
      stripeService: createMock<StripeService>(),
      connectSubscriptionService: createMock<ConnectSubscriptionService>(),
      userNetworkDataService: createMock<UserNetworkDataService>(),
      userDataService: createMock<UserDataService>(),
      logger: createMock<ConnectLogger>(),

    };

    mockData = {
      networkId: 'networkId',
      user: createMock<IUser>(),
      cartItems: createMock<UserCartItemDto[]>([
        {
          offerId: 'offerId'
        }
      ]),
      networkOfferings: createMock<NetworkOffering[]>([
        {
          ...createMock<NetworkOffering>({
            _id: 'offerId'
          })
        }
      ]),
      cartId: createMock<String>(),
      stripeSubscriptionId: createMock<String>(),
      cartError: createMock<CartError>(),
      paymentToken: "******",
      userCartSession: createMock<UserCartDto>(),
      userNetwork: createMock<UserNetwork>(),
      networkOfferingsForCart: createMock<ApiResultWithError<NetworkOfferingDTO[], string>>({
        data: [
          {
            ...createMock<NetworkOfferingDTO>({
              id: 'offerId'
            })
          }
        ]
      }),
      connectSubscription: createMock<ConnectSubscription>({
        _id: '123'
      }),
      emptyCartModel: createMock<Cart>({
        _id: '123',
        networkId: 'networkId',
        status: CartStatus.EMPTY,
        billingCategory: createMock<NetworkPriceBillingCategory>({ _id: "" })
      }),
      cartWithItems: createMock<Cart>({
        _id: '123',
        networkId: 'networkId',
        status: CartStatus.PENDING_BILLING_INFO,
        items: createMock<CartItem[]>([{
          ...createMock<CartItem>({
            offer: createMock<NetworkOffering>({
              _id: "123"
            })
          })
        }])
      }),
      cart: createMock<Cart>({
        _id: '123',
        networkId: 'networkId'
      }),
      network: createMock<Network>({
        _id: 'networkId'
      }),
      billingAddress: createMock<BillingAddressDto>(),
      billingCategoryCode: NetworkPriceBillingCodes.Infrastructure,
      billingCategory: createMock<NetworkPriceBillingCategory>()
    };

    service = new CartService(mockServices.env,
      mockServices.dataContext,
      mockServices.networkCatalogDataService,
      mockServices.stripeService,
      mockServices.connectSubscriptionService,
      mockServices.userNetworkDataService,
      mockServices.userDataService,
      mockServices.logger);

    jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
    jest.spyOn(service as any, "getInternalConfirmationToken").mockReturnValueOnce("******");
  });


  describe(`${CartService.prototype.getCartById.name}`, () => {
    it(`success`, async () => {
      // arrange
      mockServices.dataContext.cart.findById = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));

      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      // act

      const results = await service.getCartById(mockData.cartId.toString());
      // assert
      expect(results).toBeDefined();
    });

    it(`handle not found exception`, async () => {
      // arrange
      mockServices.dataContext.cart.findById = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act
      await expect(service.getCartById(mockData.cartId.toString())).rejects.toThrow();

    });
  });

  describe(`${CartService.prototype.getCartPendingPaymentByUserId.name}`, () => {
    it(`should return`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      mockServices.connectSubscriptionService.getSubscriptionStripePaymentToken = jest.fn().mockResolvedValueOnce(ApiResult.success(createMock<{ paymentToken: string, amountDue: number, discountTotal: number }>()));
      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      // act
      const results = await service.getCartPendingPaymentByUserId(mockData.user.id.toString());
      // assert
      expect(results).toBeDefined();
      expect(results.paymentConfig).toBeDefined();
    });
  });

  describe(`${CartService.prototype.initCartSessionForNetwork.name}`, () => {

    it(`handle create new cart`, async () => {

      // arrange
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => null
        })
      }));
      mockServices.dataContext.cart.create = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      // act 
      const cartSessionResult = await service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode);

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle expired cart`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.EXPIRED,
        networkId: mockData.networkId
      });
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => cart
        })
      }));
      jest.spyOn(service as any, "clearCartHelper").mockReturnValueOnce(mockData.userCartSession);
      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      // act 
      const cartSessionResult = await service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode);

      // assert
      expect(cartSessionResult).toBeDefined();
    });

    it(`handle cart session with status in [${CartStatus.PENDING_CC_INFO}, ${CartStatus.PENDING_PROCESSING_PAYMENT}, ${CartStatus.ERROR_GATEWAY_ERROR}]`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_CC_INFO,
        networkId: mockData.networkId
      });
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => cart
        })
      }));
      mockServices.connectSubscriptionService.getSubscriptionStripePaymentToken = jest.fn().mockResolvedValueOnce(ApiResult.success(createMock<{ paymentToken: string, amountDue: number, discountTotal: number }>()));
      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      // act 
      const cartSessionResult = await service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode);

      // assert
      expect(cartSessionResult).toBeDefined();
      expect(cartSessionResult.paymentConfig).toBeDefined();
    });

    it(`handle cart session with status ${CartStatus.PENDING_NEW_ADDITION_CONFIRMATION}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION,
        networkId: mockData.networkId,
        items: createMock<CartItem[]>([{
          ...createMock<CartItem>()
        }])
      });
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => cart
        })
      }));
      mockServices.connectSubscriptionService.getProrateAmountForSubscription = jest.fn().mockResolvedValueOnce(createMock<{ amountDue: number, discountTotal: number }>());
      jest.spyOn(service as any, "mapCartToUserCartDto").mockResolvedValueOnce(mockData.userCartSession);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      // act 
      const cartSessionResult = await service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode);

      // assert
      expect(cartSessionResult).toBeDefined();
      expect(cartSessionResult.paymentConfig).toBeDefined();
    });

    it(`handle existing user network already provisioned`, async () => {
      // arrange
      const userNetwork = createMock<UserNetwork>({});
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(userNetwork);
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      // act 
      await expect(service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode)).rejects.toThrow();

    });

    it(`handle existing user network provisioned with status ${UserNetworkStatus.PendingCancelation} and subscription status of ${ConnectSubscriptionStatus.PendingCancelation}`, async () => {
      // arrange
      const userNetwork = createMock<UserNetwork>({
        status: UserNetworkStatus.PendingCancelation
      });
      const subscription = createMock<ConnectSubscription>({
        status: ConnectSubscriptionStatus.PendingCancelation
      });
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(userNetwork);
      mockServices.connectSubscriptionService.getSubscriptionPendingCancelationForUser = jest.fn().mockResolvedValueOnce(subscription);

      // act 
      await expect(service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode)).rejects.toThrow();

    });

    it(`handle not products available for purchase `, async () => {

      // arrange
      const emptyOfferingsForCart = createMock<NetworkOfferingDTO[]>();
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(emptyOfferingsForCart);
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      // act 
      await expect(service.initCartSessionForNetwork(mockData.user, mockData.networkId, mockData.billingCategoryCode)).rejects.toThrow();

    });

    it(`handle:user already has pending payment for a different network. 
      handle existing cart with status: ${CartStatus.PENDING_PROCESSING_PAYMENT} for diff network`, async () => {

      // arrange
      const cart = createMock<Cart>({
        networkId: 'someOtherNetworkId',
        status: CartStatus.PENDING_PROCESSING_PAYMENT
      });
      const targetNetworkId = "targetNetworkId";
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => cart
        })
      }));
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      // act 
      await expect(service.initCartSessionForNetwork(mockData.user, targetNetworkId, mockData.billingCategoryCode)).rejects.toThrow();


    });

    it(`handle:user already has pending payment error for a different network. 
    handle existing cart with status: ${CartStatus.ERROR_GATEWAY_ERROR} for diff network`, async () => {

      // arrange
      const cart = createMock<Cart>({
        networkId: 'someOtherNetworkId',
        status: CartStatus.ERROR_GATEWAY_ERROR
      });
      const targetNetworkId = "targetNetworkId";
      mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockResolvedValueOnce(null);
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          toObject: () => cart
        })
      }));
      mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockResolvedValueOnce(mockData.billingCategory);
      // act 
      const cartSessionResult = await expect(service.initCartSessionForNetwork(mockData.user, targetNetworkId, mockData.billingCategoryCode)).rejects.toThrow();

    });


  });


  describe(`${CartService.prototype.addCartItem.name}`, () => {
    it(`Add items to empty cart with no pre-existing subscription`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.getActiveNetworkOfferingsByNetworkId = jest.fn().mockResolvedValueOnce(mockData.networkOfferings);
      mockServices.connectSubscriptionService.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod = jest.fn().mockResolvedValueOnce(null);
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);

      // act 
      const cartSessionResult = await service.addCartItem(mockData.user, mockData.emptyCartModel._id, mockData.cartItems);

      // assert
      expect(cartSessionResult).toBeDefined();


    });

    it(`Add items to empty cart with a pre-existing subscription`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn()
        .mockImplementationOnce(() => ({
          toObject: () => mockData.emptyCartModel
        }))
        .mockImplementationOnce(() => ({
          populate: (...args2) => ({
            toObject: () => mockData.emptyCartModel
          })
        }));
      mockServices.networkCatalogDataService.getActiveNetworkOfferingsByNetworkId = jest.fn().mockResolvedValueOnce(mockData.networkOfferings);
      mockServices.connectSubscriptionService.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);

      mockServices.connectSubscriptionService.getProrateAmountForSubscription = jest.fn().mockResolvedValueOnce(createMock<{ amountDue: number, discountTotal: number }>());
      jest.spyOn(service as any, "getInternalConfirmationToken").mockReturnValueOnce("*****");
      // act 
      const cartSessionResult = await service.addCartItem(mockData.user, mockData.emptyCartModel._id, mockData.cartItems);

      // assert
      expect(cartSessionResult).toBeDefined();


    });

    it(`handle invalid items`, async () => {
      // arrange
      const cartItems = createMock<UserCartItemDto[]>([
        {
          ...createMock<UserCartItemDto>({
            offerId: "invalid"
          })
        }
      ]);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));
      mockServices.networkCatalogDataService.getActiveNetworkOfferingsByNetworkId = jest.fn().mockResolvedValueOnce(mockData.networkOfferings);

      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, cartItems)).rejects.toThrow();

    });

    it(`handle empty items`, async () => {
      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, null)).rejects.toThrow();
    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, mockData.cartItems)).rejects.toThrow();
    });

    it(`handle when cart status is ${CartStatus.PENDING_PROCESSING_PAYMENT}`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => createMock<Cart>({
          status: CartStatus.PENDING_PROCESSING_PAYMENT
        })
      }));

      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, null)).rejects.toThrow();
    });

    it(`handle when cart status is ${CartStatus.ERROR_GATEWAY_ERROR}`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => createMock<Cart>({
          status: CartStatus.ERROR_GATEWAY_ERROR
        })
      }));

      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, null)).rejects.toThrow();
    });

    it(`handle when cart status is ${CartStatus.CHECKOUT_COMPLETE}`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => createMock<Cart>({
          status: CartStatus.CHECKOUT_COMPLETE
        })
      }));

      // act 
      await expect(service.addCartItem(mockData.user, mockData.emptyCartModel._id, null)).rejects.toThrow();
    });


  });


  describe(`${CartService.prototype.addBillingInfo.name}`, () => {
    it(`add billing address success `, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => mockData.cartWithItems
          })
        })
      }));


      jest.spyOn(service as any, "confirmUserWithStripeCustomerIdCreateIfNotPresent").mockResolvedValueOnce(ApiResult.success(mockData.user));
      //
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      mockServices.connectSubscriptionService.getSubscriptionStripePaymentTokenCreateIfNotPresent = jest.fn().mockResolvedValueOnce(createMock<{ networkSubId: string, paymentToken: string, amountDue: number, discountTotal: number }>());
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cartWithItems
      }));
      // act 
      const cartSessionResult = await service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress);

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)).rejects.toThrow();

    });

    it(`handle cart with status ${CartStatus.ERROR_GATEWAY_ERROR}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.ERROR_GATEWAY_ERROR
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => cart
          })
        })
      }));

      // act 
      await expect(service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)).rejects.toThrow();

    });

    it(`handle cart with status ${CartStatus.CHECKOUT_COMPLETE}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.CHECKOUT_COMPLETE
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => cart
          })
        })
      }));

      // act 
      await expect(service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)).rejects.toThrow();

    });

    it(`handle cart with status ${CartStatus.PENDING_NEW_ADDITION_CONFIRMATION}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => cart
          })
        })
      }));

      // act 
      await expect(service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)).rejects.toThrow();

    });


    it(`handle cart with status ${CartStatus.PENDING_PROCESSING_PAYMENT}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_PROCESSING_PAYMENT
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => cart
          })
        })
      }));

      // act 
      await expect(service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)).rejects.toThrow();

    });

    it(`add billing address success `, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => mockData.cartWithItems
          })
        })
      }));

      jest.spyOn(service as any, "confirmUserWithStripeCustomerIdCreateIfNotPresent").mockResolvedValueOnce(ApiResult.success(mockData.user));
      //
      mockServices.networkCatalogDataService.findById = jest.fn().mockResolvedValueOnce(mockData.network);
      mockServices.connectSubscriptionService.getSubscriptionStripePaymentTokenCreateIfNotPresent = jest.fn().mockResolvedValueOnce(createMock<{ networkSubId: string, paymentToken: string, amountDue: number, discountTotal: number }>());
      mockServices.networkCatalogDataService.getNetworkOfferingsForCart = jest.fn().mockResolvedValueOnce(mockData.networkOfferingsForCart);
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cartWithItems
      }));

      // act 
      const results = service.addBillingInfo(mockData.user, mockData.cartId.toString(), mockData.billingAddress)

      // assert
      expect(results).toBeDefined();
    });

  });


  describe(`${CartService.prototype.markCartPendingPayment.name}`, () => {
    it(`mark pending payment success`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_CC_INFO
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce(() => ({
        toObject: () => cart
      }));

      // act 
      const cartSessionResult = await service.markCartPendingPayment(mockData.user, mockData.cartId.toString());

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.markCartPendingPayment(mockData.user, mockData.cartId.toString())).rejects.toThrow();

    });

    it(`handle cart status is ${CartStatus.PENDING_PROCESSING_PAYMENT}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_PROCESSING_PAYMENT
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));


      // act 
      const cartSessionResult = await service.markCartPendingPayment(mockData.user, mockData.cartId.toString());

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle cart status is ${CartStatus.CHECKOUT_COMPLETE}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.CHECKOUT_COMPLETE
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));

      // act 
      await expect(service.markCartPendingPayment(mockData.user, mockData.cartId.toString())).rejects.toThrow();
    });

    it(`handle cart status is ${CartStatus.PENDING_NEW_ADDITION_CONFIRMATION}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      // act 
      await expect(service.markCartPendingPayment(mockData.user, mockData.cartId.toString())).rejects.toThrow();
    });


  });

  describe(`${CartService.prototype.markCartWithPaymentError.name}`, () => {

    it(`mark pending payment success`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.PENDING_PROCESSING_PAYMENT
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockImplementationOnce(() => ({
        toObject: () => cart
      }));

      // act 
      const cartSessionResult = await service.markCartWithPaymentError(mockData.user, mockData.cartId.toString(), mockData.cartError);

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.markCartWithPaymentError(mockData.user, mockData.cartId.toString(), mockData.cartError)).rejects.toThrow();

    });

    it(`handle cart status is ${CartStatus.ERROR_GATEWAY_ERROR}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.ERROR_GATEWAY_ERROR
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));


      // act 
      const cartSessionResult = await service.markCartWithPaymentError(mockData.user, mockData.cartId.toString(), mockData.cartError);

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle cart status is ${CartStatus.CHECKOUT_COMPLETE}`, async () => {
      // arrange
      const cart = createMock<Cart>({
        status: CartStatus.CHECKOUT_COMPLETE
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));

      // act 
      await expect(service.markCartWithPaymentError(mockData.user, mockData.cartId.toString(), mockData.cartError)).rejects.toThrow();
    });

  });


  describe(`${CartService.prototype.confirmCartPendingItems.name}`, () => {
    it(`return success`, async () => {
      // arrange
      const cart = createMock<Cart>({
        ...mockData.cartWithItems,
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      mockServices.connectSubscriptionService.addOfferToSubscriptionAndInitiateUserNetworkProvisioning = jest.fn().mockResolvedValueOnce(ApiResultWithError.success(true));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValue(cart);

      // act 
      const cartSessionResult = await service.confirmCartPendingItems(mockData.user, mockData.cartId.toString(), mockData.paymentToken.toString());

      // assert
      expect(cartSessionResult).toBeDefined();

    });

    it(`handle invalid status`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.emptyCartModel
      }));

      // act 
      await expect(service.confirmCartPendingItems(mockData.user, mockData.cartId.toString(), mockData.paymentToken.toString())).rejects.toThrow();

    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));


      // act 
      await expect(service.confirmCartPendingItems(mockData.user, mockData.cartId.toString(), mockData.paymentToken.toString())).rejects.toThrow();


    });

    it(`handle invalid payment token`, async () => {
      // arrange
      const cart = createMock<Cart>({
        ...mockData.cartWithItems,
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      mockServices.connectSubscriptionService.addOfferToSubscriptionAndInitiateUserNetworkProvisioning = jest.fn().mockResolvedValueOnce(ApiResultWithError.success(true));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValue(cart);

      // act 
      await expect(service.confirmCartPendingItems(mockData.user, mockData.cartId.toString(), "invalid")).rejects.toThrow();

    });

    it(`handle error adding item to stripe`, async () => {
      // arrange
      const cart = createMock<Cart>({
        ...mockData.cartWithItems,
        status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
      });
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => cart
      }));
      mockServices.connectSubscriptionService.addOfferToSubscriptionAndInitiateUserNetworkProvisioning = jest.fn().mockImplementationOnce(() => { throw new Error() });

      // act 
      await expect(service.confirmCartPendingItems(mockData.user, mockData.cartId.toString(), mockData.paymentToken.toString())).rejects.toThrow();

    });
  });


  describe(`${CartService.prototype.markCartWithPaymentErrorForStripeSubscription.name}`, () => {
    it(`should return`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.cart);

      await expect(service.markCartWithPaymentErrorForStripeSubscription(mockData.stripeSubscriptionId.toString(), mockData.cartError)).resolves.not.toThrow();


    });

    it(`handle subscription not found`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(null);

      // act 
      await expect(service.markCartWithPaymentErrorForStripeSubscription(mockData.stripeSubscriptionId.toString(), mockData.cartError)).rejects.toThrow();
    });

    it(`handle cart not found`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.markCartWithPaymentErrorForStripeSubscription(mockData.stripeSubscriptionId.toString(), mockData.cartError)).rejects.toThrow();

    });

  });



  describe(`${CartService.prototype.markCartCheckoutCompleteForStripeSubscription.name}`, () => {
    it(`should return`, async () => {
      // arrange
      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.cart);

      // act 
      const results = await service.markCartCheckoutCompleteForStripeSubscription(mockData.stripeSubscriptionId.toString());

      // assert
      expect(results).toBeDefined();

    });

    it(`handle subscription not found`, async () => {
      // arrange
      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(null);

      // act 
      await expect(service.markCartCheckoutCompleteForStripeSubscription(mockData.stripeSubscriptionId.toString())).rejects.toThrow();
    });

    it(`handle cart not found`, async () => {
      // arrange
      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.markCartCheckoutCompleteForStripeSubscription(mockData.stripeSubscriptionId.toString())).rejects.toThrow();

    });
  });



  describe(`${CartService.prototype.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription.name}`, () => {
    it(`should return`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.cart);
      mockServices.connectSubscriptionService.deleteSubscriptionWithInvoice = jest.fn().mockResolvedValueOnce(ApiResult.success());

      // act 
      await expect(service.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(mockData.stripeSubscriptionId.toString())).resolves.not.toThrow();

    });

    it(`handle subscription not found`, async () => {
      // arrange
      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(null);

      // act 
      await expect(service.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(mockData.stripeSubscriptionId.toString())).rejects.toThrow();

    });

    it(`handle cart not found`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => null
      }));

      // act 
      await expect(service.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(mockData.stripeSubscriptionId.toString())).rejects.toThrow();

    });

    it(`handle connectSubscriptionService error`, async () => {
      // arrange

      mockServices.connectSubscriptionService.getSubscriptionByStripeSubscriptionId = jest.fn().mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.dataContext.cart.findOne = jest.fn().mockImplementationOnce((...args) => ({
        toObject: () => mockData.cart
      }));
      mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.cart);
      mockServices.connectSubscriptionService.deleteSubscriptionWithInvoice = jest.fn().mockImplementationOnce(() => { throw new Error() });

      // act 
      await expect(service.expireCartSessionAndRemoveConnectSubscriptionForStripeSubscription(mockData.stripeSubscriptionId.toString())).rejects.toThrow();

    });
  });



  describe(`Private Methods`, () => {

    describe("clearCartHelper", () => {
      const methodName = "clearCartHelper";

      it("should be defined", async () => {
        expect(service[`${methodName}`]).toBeDefined();
      });

      it("should return", async () => {
        // arrange
        mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce({ toObject: () => mockData.cart });
        // act
        const results = await service[`${methodName}`](mockData.cart);
        // assert
        expect(results).toBeDefined();
      });

      it("should return when connectSubscriptionId is populated", async () => {
        // arrange
        const cart = createMock<Cart>({
          connectSubscriptionId: "123"
        });
        mockServices.connectSubscriptionService.deleteSubscriptionWithInvoiceAndCancelStripeSubscription = jest.fn().mockResolvedValueOnce(true);
        mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce({ toObject: () => cart });
        // act
        const results = await service[`${methodName}`](cart);
        // assert
        expect(results).toBeDefined();
      });

      it(`should return when cart is status : ${CartStatus.PENDING_NEW_ADDITION_CONFIRMATION}}`, async () => {
        // arrange
        const cart = createMock<Cart>({
          connectSubscriptionId: "123",
          status: CartStatus.PENDING_NEW_ADDITION_CONFIRMATION
        });
        mockServices.dataContext.cart.updateByIdAndSave = jest.fn().mockResolvedValueOnce({ toObject: () => cart });
        // act
        const results = await service[`${methodName}`](cart);
        // assert
        expect(results).toBeDefined();
      });

    });

    describe("confirmUserWithStripeCustomerIdCreateIfNotPresent", () => {
      const methodName = "confirmUserWithStripeCustomerIdCreateIfNotPresent";

      it("should be defined", async () => {
        expect(service[`${methodName}`]).toBeDefined();
      });


      it("should return", async () => {
        // arrange
        const user = createMock<IUser>();
        const stripeCustomerResult = StripeCustomerResult.success(createMock<StripeCustomer>({ id: '123' }));


        mockServices.stripeService.getCustomerByEmail = jest.fn().mockResolvedValueOnce(stripeCustomerResult);
        mockServices.userDataService.update = jest.fn().mockResolvedValueOnce({
          status: ApiResultStatus.Success,
          data: user
        });
        // act
        const results = await service[`${methodName}`](user, mockData.billingAddress);
        // assert
        expect(results).toBeDefined();
      });

      it("handle user already has stripe id", async () => {
        // arrange
        const user = createMock<IUser>({
          billingDetails: {
            stripe: {
              customerId: "123"
            }
          }
        });

        // act
        const results = await service[`${methodName}`](user, mockData.billingAddress);
        // assert
        expect(results).toBeDefined();
      });

      it("handle error getting stripe user", async () => {
        // arrange
        const user = createMock<IUser>();
        const stripeCustomerResult = StripeCustomerResult.failure();
        mockServices.stripeService.getCustomerByEmail = jest.fn().mockResolvedValueOnce(stripeCustomerResult);

        try {
          // act
          const results = await service[`${methodName}`](user, mockData.billingAddress);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
        }

      });

      it("handle stripe create user", async () => {
        // arrange
        const user = createMock<IUser>();
        const stripeCustomerResult = StripeCustomerResult.success(null);
        const stripeCustomerResult_create = StripeCustomerResult.success(createMock<StripeCustomer>({ id: '123' }));


        mockServices.stripeService.getCustomerByEmail = jest.fn().mockResolvedValueOnce(stripeCustomerResult);
        mockServices.stripeService.createCustomer = jest.fn().mockResolvedValueOnce(stripeCustomerResult_create);
        mockServices.userDataService.update = jest.fn().mockResolvedValueOnce({
          status: ApiResultStatus.Success,
          data: user
        });
        // act
        const results = await service[`${methodName}`](user, mockData.billingAddress);
        // assert
        expect(results).toBeDefined();
      });

      it("handle stripe create user error", async () => {
        // arrange
        const user = createMock<IUser>();
        const stripeCustomerResult = StripeCustomerResult.success(null);
        const stripeCustomerResult_create = StripeCustomerResult.failure();


        mockServices.stripeService.getCustomerByEmail = jest.fn().mockResolvedValueOnce(stripeCustomerResult);
        mockServices.stripeService.createCustomer = jest.fn().mockResolvedValueOnce(stripeCustomerResult_create);
        mockServices.userDataService.update = jest.fn().mockResolvedValueOnce({
          status: ApiResultStatus.Success,
          data: user
        });
        try {
          // act
          const results = await service[`${methodName}`](user, mockData.billingAddress);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
        }

      });

      it("handle error updating user", async () => {
        // arrange
        const user = createMock<IUser>();
        const stripeCustomerResult = StripeCustomerResult.success(createMock<StripeCustomer>({ id: '123' }));


        mockServices.stripeService.getCustomerByEmail = jest.fn().mockResolvedValueOnce(stripeCustomerResult);
        mockServices.userDataService.update = jest.fn().mockResolvedValueOnce({
          status: ApiResultStatus.Failed,
          data: user
        });
        try {
          // act
          const results = await service[`${methodName}`](user, mockData.billingAddress);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
        }

      });
    });

  });



});