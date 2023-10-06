import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { EndpointsService } from "../../../endpoints/services";
import { EnvironmentVariables } from "../../../env";
import { LightningInvoiceService } from "../../../networks/lightning/invoices/services/LightningInvoiceService";
import { EndpointsDashboardQueries } from "../../../node-monitoring-db";
import { QuickbooksCustomerService } from "../../../quickbooks/services/QuickbooksCustomerService";
import { QuickbooksInvoiceService } from "../../../quickbooks/services/QuickbooksInvoiceService";
import { StripeService } from "../../../stripe/services/StripeService";
import { TaskQueueItemDataService } from "../../../task-queue/services/TaskQueueItemDataService";
import { UserNetworkDataService } from "../../../user-network/services/UserNetworkDataService";
import { UserDataService } from "../../../users/services/UserDataService";
import { CancellationService } from "../CancellationService";
import { ConnectSubscriptionService } from "../ConnectSubscriptionService";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { ConnectSubscription, ConnectSubscriptionInvoice, ConnectSubscriptionInvoiceStatus, ConnectSubscriptionItem, ConnectSubscriptionItemStatus, ConnectSubscriptionRecurrence, ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { CreateSubscriptionResult, SubscriptionPaymentSecretResult, SubscriptionStatusResult } from "../../../stripe/types/StripeTypes";
import { IUser } from "@blockspaces/shared/models/users";
import { Network, NetworkId, UserNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { BillingAddress, Cart, CartItem } from "@blockspaces/shared/models/cart";
import ApiResult, { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { NetworkOffering, NetworkOfferingItem, NetworkPrice, NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { TaskQueueItem, TaskQueueItemRecurrence } from "@blockspaces/shared/models/task-queue/TaskQueueItem";
import Stripe from "stripe";
import { QuickbooksInvoice, QuickBooksPaymentSummary } from "../../../quickbooks/types/QuickbooksTypes";
import { NetworkCatalogDataService } from "../../../network-catalog/services/NetworkCatalogDataService";
import { NetworkPriceDto } from "@blockspaces/shared/dtos/network-catalog";


describe(`${ConnectSubscriptionService.name}`, () => {
  let service: ConnectSubscriptionService;

  let mockServices: {
    env: EnvironmentVariables,
    logger: ConnectLogger,
    dataContext: ConnectDbDataContext,
    stripeService: StripeService,
    userNetworkDataService: UserNetworkDataService,
    userDataService: UserDataService,
    lightningInvoiceService: LightningInvoiceService,
    taskQueueItemDataService: TaskQueueItemDataService,
    quickbooksInvoiceService: QuickbooksInvoiceService,
    quickbooksCustomerService: QuickbooksCustomerService,
    networkCancellationService: CancellationService,
    endpointsService: EndpointsService,
    endpointUsageDataService: EndpointsDashboardQueries,
    networkCatalogDataService: NetworkCatalogDataService
  };

  let mockData: {
    networkSubId: String,
    connectSubscription: ConnectSubscription,
    subscriptionPaymentSecretResult: SubscriptionPaymentSecretResult,
    user: IUser,
    network: Network,
    connectSubscriptionId: String,
    billingInfo: BillingAddress,
    offerIds: string[],
    createSubscriptionResult: CreateSubscriptionResult,
    booleanResult: ApiResultWithError<Boolean, string>,
    networkId: String,
    stripeSubscriptionItemsResults: ApiResultWithError<Array<{ id: string, priceId: string }>>,
    userNetwork: UserNetwork,
    userId: String,
    stripeSubscriptionId: String,
    subscriptionId: String,
    connectSubscriptionRecurrence: ConnectSubscriptionRecurrence,
    getProrateAmountForSubscriptionResult: ApiResultWithError<{ amountDue: number, discountTotal: number }, string>,
    offeringItems: NetworkOfferingItem[],
    connectSubscriptionInvoice: ConnectSubscriptionInvoice,
    billingCategoryCode: NetworkPriceBillingCodes,
    networkPriceBillingCategory: NetworkPriceBillingCategory,
    billingRecurrence: TaskQueueItemRecurrence,
    taskQueueItem: TaskQueueItem,
    stripeInvoiceId: String,
    stripePaymentIntentId: String,
    stripeInvoiceResult: ApiResultWithError<Stripe.Invoice, string>,
    connectSubscriptionStatus: ConnectSubscriptionStatus,
    subscriptionStatusResult: SubscriptionStatusResult,
    billingCategoryId: String,
    networkOffering: NetworkOffering

  };

  beforeEach(() => {
    mockServices = {
      env: createMock<EnvironmentVariables>(),
      logger: createMock<ConnectLogger>(),
      dataContext: createMock<ConnectDbDataContext>(),
      stripeService: createMock<StripeService>(),
      userNetworkDataService: createMock<UserNetworkDataService>(),
      userDataService: createMock<UserDataService>(),
      lightningInvoiceService: createMock<LightningInvoiceService>(),
      taskQueueItemDataService: createMock<TaskQueueItemDataService>(),
      quickbooksInvoiceService: createMock<QuickbooksInvoiceService>(),
      quickbooksCustomerService: createMock<QuickbooksCustomerService>(),
      networkCancellationService: createMock<CancellationService>(),
      endpointsService: createMock<EndpointsService>(),
      endpointUsageDataService: createMock<EndpointsDashboardQueries>(),
      networkCatalogDataService: createMock<NetworkCatalogDataService>()
    };
    mockData = {
      networkSubId: createMock<String>(),
      connectSubscription: createMock<ConnectSubscription>({
        _id: '123',
        status: ConnectSubscriptionStatus.Requested,
        items: createMock<Array<ConnectSubscriptionItem>>(),
        networks: createMock<Array<string>>(),
        currentPeriod: createMock<{
          billingStart: number,
          billingEnd: number,
          meteredUsageStart: number,
          meteredUsageEnd: number
        }>()
      }),
      subscriptionPaymentSecretResult: createMock<SubscriptionPaymentSecretResult>({
        data: {
          amountDue: 0,
          clientSecret: ``,
          discountTotal: 0
        }
      }),
      user: createMock<IUser>(),
      network: createMock<Network>(),
      connectSubscriptionId: `123`,
      billingInfo: createMock<BillingAddress>(),
      offerIds: createMock<string[]>(['']),
      createSubscriptionResult: createMock<CreateSubscriptionResult>({
        data: {
          subscriptionId: ``,
          stripeInvoiceId: ``,
          stripePaymentIntentId: ``,
          currentPeriodStart: 0,
          currentPeriodEnd: 0,
          amountDue: 0,
          clientSecret: ``,
          items: [],
          discountTotal: 0
        }
      }),
      booleanResult: ApiResultWithError.success(true),
      networkId: createMock<String>(),
      stripeSubscriptionItemsResults: createMock<ApiResultWithError<Array<{ id: string, priceId: string }>>>(),
      userNetwork: createMock<UserNetwork>(),
      userId: createMock<String>(),
      stripeSubscriptionId: createMock<String>(),
      subscriptionId: createMock<String>(),
      connectSubscriptionRecurrence: ConnectSubscriptionRecurrence.Monthly,
      getProrateAmountForSubscriptionResult: createMock<ApiResultWithError<{ amountDue: number, discountTotal: number }, string>>({ data: createMock<{ amountDue: number, discountTotal: number }>() }),
      offeringItems: createMock<NetworkOfferingItem[]>(),
      connectSubscriptionInvoice: createMock<ConnectSubscriptionInvoice>({
        period: createMock<{
          billingStart: number,
          billingEnd: number,
          meteredUsageStart: number,
          meteredUsageEnd: number
        }>()
      }),
      billingCategoryCode: NetworkPriceBillingCodes.Infrastructure,
      networkPriceBillingCategory: createMock<NetworkPriceBillingCategory>({ _id: '123' }),
      billingRecurrence: TaskQueueItemRecurrence.MONTHLY,
      taskQueueItem: createMock<TaskQueueItem>({ _id: '123' }),
      stripeInvoiceId: createMock<String>(),
      stripePaymentIntentId: createMock<String>(),
      stripeInvoiceResult: createMock<ApiResultWithError<Stripe.Invoice, string>>({
        data: createMock<Stripe.Invoice>()
      }),
      connectSubscriptionStatus: ConnectSubscriptionStatus.Active,
      subscriptionStatusResult: createMock<SubscriptionStatusResult>({
        data: createMock<{ status: string }>()
      }),
      billingCategoryId: createMock<String>(),
      networkOffering: createMock<NetworkOffering>()
    };

    service = new ConnectSubscriptionService(
      mockServices.env,
      mockServices.logger,
      mockServices.dataContext,
      mockServices.stripeService,
      mockServices.userNetworkDataService,
      mockServices.userDataService,
      mockServices.lightningInvoiceService,
      mockServices.taskQueueItemDataService,
      mockServices.quickbooksInvoiceService,
      mockServices.quickbooksCustomerService,
      mockServices.networkCancellationService,
      mockServices.endpointsService,
      mockServices.endpointUsageDataService,
      mockServices.networkCatalogDataService
    );

    jest.spyOn(service as any, "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper").mockResolvedValue(mockData.booleanResult);
    jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValue(mockData.connectSubscription);
    jest.spyOn(service as any, "mapRecurrenceToConnectSubscriptionRecurrence").mockResolvedValue(mockData.connectSubscriptionRecurrence);
    jest.spyOn(service as any, "mapConnectSubscriptionNetworkOfferingRecurrenceToTaskQueueRecurrence").mockResolvedValue(mockData.billingRecurrence);
    jest.spyOn(service as any, "mapStripeSubscriptionStatusToConnectSubscriptionStatusHelper").mockResolvedValue(mockData.connectSubscriptionStatus);


  });


  describe(`${ConnectSubscriptionService.prototype.getSubscriptionStripePaymentToken.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.getSubscriptionStripePaymentToken).toBeDefined();
    });

    describe('Success', () => {
      it(` should return`, async () => {
        // arrange
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockImplementationOnce((data) => (mockData.subscriptionPaymentSecretResult));

        // act
        const results = await service.getSubscriptionStripePaymentToken(mockData.networkSubId.toString());

        // assert
        expect(results).toBeDefined();

      });
    });

    describe('Error', () => {
      it(`should return error subscription not found`, async () => {
        // arrange
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => null
        }));

        // act
        await expect(service.getSubscriptionStripePaymentToken(mockData.networkSubId.toString())).rejects.toThrow();


      });
      it(`should return error from stripe`, async () => {
        // arrange
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        const stripeError = SubscriptionPaymentSecretResult.failure("stripe error", new Error());
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockResolvedValueOnce(stripeError);

        // act
        await expect(service.getSubscriptionStripePaymentToken(mockData.networkSubId.toString())).rejects.toThrow();

      });
    });

  });

  describe(`${ConnectSubscriptionService.prototype.getSubscriptionStripePaymentTokenCreateIfNotPresent.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getSubscriptionStripePaymentTokenCreateIfNotPresent).toBeDefined();
    });

    describe('Success', () => {
      it(`creating a new subscription`, async () => {
        // arrange
        const connectSubscription: ConnectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Requested
        });
        const networkOffering: NetworkOffering = createMock<NetworkOffering>();
        const offerIds = ['123'];
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => null
        }));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({
            toObject: () => networkOffering
          })
        }));
        mockServices.dataContext.connectSubscriptions.create = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockImplementationOnce((data) => (mockData.subscriptionPaymentSecretResult));
        mockServices.stripeService.createSubscription = jest.fn().mockImplementationOnce((data) => (mockData.createSubscriptionResult));
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));


        // act
        const results = await service.getSubscriptionStripePaymentTokenCreateIfNotPresent(mockData.user, mockData.network, mockData.connectSubscriptionId.toString()
          , mockData.billingInfo, offerIds);

        // assert
        expect(results).toBeDefined();


      });

      it(`existing connect subscription with status ${ConnectSubscriptionStatus.Requested}`, async () => {
        // arrange
        const connectSubscription: ConnectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Requested
        });
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockImplementationOnce((data) => (mockData.subscriptionPaymentSecretResult));
        mockServices.stripeService.createSubscription = jest.fn().mockImplementationOnce((data) => (mockData.createSubscriptionResult));
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({ toObject: () => mockData.networkOffering })
        }));

        // act
        const results = await service.getSubscriptionStripePaymentTokenCreateIfNotPresent(mockData.user, mockData.network, mockData.connectSubscriptionId.toString()
          , mockData.billingInfo, mockData.offerIds);

        // assert
        expect(results).toBeDefined();


      });

      it(`existing connect subscription with status not equal to${ConnectSubscriptionStatus.Requested}`, async () => {
        // arrange
        const connectSubscription: ConnectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Active
        });
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockImplementationOnce((data) => (mockData.subscriptionPaymentSecretResult));


        // act
        const results = await service.getSubscriptionStripePaymentTokenCreateIfNotPresent(mockData.user, mockData.network, mockData.connectSubscriptionId.toString()
          , mockData.billingInfo, mockData.offerIds);

        // assert
        expect(results).toBeDefined();


      });

    });

    describe('Error', () => {
      it(`handle getSubscriptionLatestInvoicePaymentAmountAndSecret error`, async () => {
        // arrange
        const connectSubscription: ConnectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Active
        });
        const stripeError = SubscriptionPaymentSecretResult.failure("stripe error", new Error());
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockResolvedValueOnce(stripeError);
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));


        // act
        await expect(service.getSubscriptionStripePaymentTokenCreateIfNotPresent(mockData.user, mockData.network, mockData.connectSubscriptionId.toString()
          , mockData.billingInfo, mockData.offerIds)).rejects.toThrow();


      });

      it(`handle stripe.createSubscription error `, async () => {
        // arrange
        const stripeError = CreateSubscriptionResult.failure("stripe error", new Error());

        const connectSubscription: ConnectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Requested
        });
        const networkOffering: NetworkOffering = createMock<NetworkOffering>();
        const offerIds = ['123'];
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => null
        }));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({
            toObject: () => networkOffering
          })
        }));
        mockServices.dataContext.connectSubscriptions.create = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => connectSubscription
        }));
        mockServices.stripeService.getSubscriptionLatestInvoicePaymentAmountAndSecret = jest.fn().mockImplementationOnce((data) => (mockData.subscriptionPaymentSecretResult));
        mockServices.stripeService.createSubscription = jest.fn().mockImplementationOnce((data) => (stripeError));
        mockServices.dataContext.connectSubscriptions.findByIdAndDelete = jest.fn().mockResolvedValueOnce(connectSubscription);


        // act
        await expect(service.getSubscriptionStripePaymentTokenCreateIfNotPresent(mockData.user, mockData.network, mockData.connectSubscriptionId.toString()
          , mockData.billingInfo, offerIds)).rejects.toThrow();
      });

    });
  });

  describe(`${ConnectSubscriptionService.prototype.addOfferToSubscriptionAndInitiateUserNetworkProvisioning.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning).toBeDefined();
    });

    describe('Success', () => {
      it(`should return when userNetwork is already Provisioned`, async () => {
        // arrange
        mockServices.stripeService.getItemsForSubscription = jest.fn().mockImplementationOnce((...args) => (mockData.stripeSubscriptionItemsResults));
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementation((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementationOnce((...args) => (mockData.userNetwork));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({ toObject: () => mockData.networkOffering })
        }));
        // act
        const results = await service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.offerIds[0]);

        // assert
        expect(results).toBeTruthy();

      });

      it(`should return when userNetwork is not yet Provisioned`, async () => {
        // arrange
        mockServices.stripeService.getItemsForSubscription = jest.fn().mockImplementationOnce((...args) => (mockData.stripeSubscriptionItemsResults));
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementation((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementationOnce((...args) => (null));
        mockServices.userNetworkDataService.addUserNetwork = jest.fn().mockImplementationOnce((...args) => (mockData.userNetwork));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({ toObject: () => mockData.networkOffering })
        }));
        // act
        const results = await service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.offerIds[0]);

        // assert
        expect(results).toBeTruthy();

      });

      it(`should return when userNetwork has a status of ${UserNetworkStatus.PendingCancelation}`, async () => {
        // arrange
        const userNetwork = createMock<UserNetwork>({
          status: UserNetworkStatus.PendingCancelation
        });
        mockServices.dataContext.networkOfferings.findOne
          = jest.fn().mockImplementation((...args) => ({
            populate: () => ({
              toObject: () => createMock<NetworkOffering>({ _id: '123', billingCategory: createMock<NetworkPriceBillingCategory>({ _id: '123' }) })
            })
          }));
        mockServices.stripeService.getItemsForSubscription = jest.fn().mockImplementationOnce((...args) => (mockData.stripeSubscriptionItemsResults));
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementation((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementationOnce((...args) => (userNetwork));
        mockServices.userDataService.findById = jest.fn().mockResolvedValueOnce(mockData.user);
        mockServices.networkCancellationService.resumeNetworkServiceOffering = jest.fn().mockResolvedValueOnce(null);
        mockServices.taskQueueItemDataService.getByPayloadAndType = jest.fn().mockResolvedValueOnce(mockData.taskQueueItem);
        mockServices.taskQueueItemDataService.deleteTask = jest.fn().mockResolvedValueOnce(null);
        // act
        const results = await service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), '123');

        // assert
        expect(results).toBeTruthy();

      });

    });

    describe('Error', () => {
      it(`handle subscription not found`, async () => {
        // arrange
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(null);
        // act
        await expect(service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.offerIds[0])).rejects.toThrow();



      });

      it(`handle stripeService.getItemsForSubscription error`, async () => {
        // arrange
        mockServices.stripeService.getItemsForSubscription = jest.fn().mockResolvedValueOnce(ApiResultWithError.failure("", new Error()));
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementationOnce((...args) => ({
          populate: () => ({ toObject: () => mockData.networkOffering })
        }));
        // act
        await expect(service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.offerIds[0])).rejects.toThrow();

      });

      it(`handle error adding Item To stripe Subscription`, async () => {
        // arrange
        mockServices.dataContext.networkOfferings.findOne = jest.fn().mockImplementation((...args) => ({
          populate: () => ({
            toObject: () => createMock<NetworkOffering>({
              _id: '123',
              billingCategory: createMock<NetworkPriceBillingCategory>({ _id: '123' }),
              items: createMock<Array<NetworkOfferingItem>>([{ price: createMock<NetworkPrice>({ _id: '123', stripeId: '123' }) }])
            })
          })
        }));
        mockServices.stripeService.getItemsForSubscription = jest.fn().mockImplementationOnce((...args) => (createMock<ApiResultWithError<Array<{ id: string, priceId: string }>>>({
          data: createMock<Array<{ id: string, priceId: string }>>([{ id: '123', priceId: '321' }])
        })));
        mockServices.stripeService.addItemToSubscription = jest.fn().mockResolvedValueOnce(ApiResultWithError.failure());
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementation((...args) => ({
          toObject: () => mockData.connectSubscription
        }));
        mockServices.userNetworkDataService.findByUserAndNetwork = jest.fn().mockImplementationOnce((...args) => (null));
        mockServices.userNetworkDataService.addUserNetwork = jest.fn().mockImplementationOnce((...args) => (mockData.userNetwork));

        // act
        await expect(service.addOfferToSubscriptionAndInitiateUserNetworkProvisioning(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), '123')).rejects.toThrow();


      });
    });

  });

  describe(`${ConnectSubscriptionService.prototype.getActiveSubscriptionForUser.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getActiveSubscriptionForUser).toBeDefined();
    });

    it(`should return`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (mockData.connectSubscription)
          })
        })
      }));

      // act
      const results = await service.getActiveSubscriptionForUser(mockData.userId.toString());

      // assert
      expect(results).toBeDefined();

    });
  });


  describe(`${ConnectSubscriptionService.prototype.getActiveSubscriptionForUserWithUserNetworkDetails.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getActiveSubscriptionForUserWithUserNetworkDetails).toBeDefined();
    });

    it(`should return with inactive sub`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (null)
          })
        })
      }));

      // act
      const results = await service.getActiveSubscriptionForUserWithUserNetworkDetails(mockData.userId.toString());

      // assert
      expect(results).toBeDefined();
      expect(results.status).toBe('Inactive');

    });

    it(`should return `, async () => {
      // arrange
      const connectSubscription = createMock<ConnectSubscription>({
        _id: '123',
        items: createMock<ConnectSubscriptionItem[]>([
          createMock<ConnectSubscriptionItem>({
            networkId: mockData.networkId.toString(),
            networkPrice: createMock<NetworkPrice>({
              _id: '123',
              billingCategory: mockData.networkPriceBillingCategory
            })
          })
        ])
      });
      const carts = createMock<Cart[]>([
        createMock<Cart>({
          items: createMock<CartItem[]>([
            createMock<CartItem>({
              offer: createMock<NetworkOffering>({
                items: createMock<NetworkOfferingItem[]>([
                  createMock<NetworkOfferingItem>({
                    price: createMock<NetworkPrice>({
                      network: mockData.network
                    })
                  })
                ])
              })
            })
          ])
        })
      ]);
      const pricesForNetwork = createMock<NetworkPriceDto[]>([
        createMock<NetworkPriceDto>({
          id: '123'
        })
      ]);
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (connectSubscription)
          })
        })
      }));
      mockServices.dataContext.cart.find = jest.fn().mockImplementationOnce(() => ({
        populate: () => ({
          lean: () => carts
        })
      }));
      mockServices.networkCatalogDataService.getPricesForNetwork = jest.fn().mockResolvedValueOnce(ApiResult.success(pricesForNetwork));
      // act
      const results = await service.getActiveSubscriptionForUserWithUserNetworkDetails(mockData.userId.toString());

      // assert
      expect(results).toBeDefined();


    });

  });

  describe(`${ConnectSubscriptionService.prototype.getSubscriptionPendingCancelationForUser.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getSubscriptionPendingCancelationForUser).toBeDefined();
    });

    it(`should return`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (mockData.connectSubscription)
          })
        })
      }));

      // act
      const results = await service.getSubscriptionPendingCancelationForUser(mockData.userId.toString());

      // assert
      expect(results).toBeDefined();

    });
  });

  describe(`${ConnectSubscriptionService.prototype.getSubscriptionByStripeSubscriptionId.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.getSubscriptionByStripeSubscriptionId).toBeDefined();
    });


    it(`should return`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (mockData.connectSubscription)
          })
        })
      }));

      // act
      const results = await service.getSubscriptionPendingCancelationForUser(mockData.stripeSubscriptionId.toString());

      // assert
      expect(results).toBeDefined();

    });
  });

  describe(`${ConnectSubscriptionService.prototype.getSubscriptionByIdPopulateItemsNetworkPrice.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getSubscriptionByIdPopulateItemsNetworkPrice).toBeDefined();
    });


    it(`should return`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (mockData.connectSubscription)
          })
        })
      }));

      // act
      const results = await service.getSubscriptionPendingCancelationForUser(mockData.subscriptionId.toString());

      // assert
      expect(results).toBeDefined();

    });

  });

  describe(`${ConnectSubscriptionService.prototype.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod).toBeDefined();
    });


    it(` should return`, async () => {
      // arrange
      mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
        populate: () => ({
          populate: () => ({
            toObject: () => (mockData.connectSubscription)
          })
        })
      }));

      // act
      const results = await service.getActiveSubscriptionByUserIdRecurrenceAndPaymentMethod(mockData.userId.toString(), mockData.connectSubscriptionRecurrence);

      // assert
      expect(results).toBeDefined();

    });
  });

  describe(`${ConnectSubscriptionService.prototype.getProrateAmountForSubscription.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.getProrateAmountForSubscription).toBeDefined();
    });

    describe('Success', () => {
      it(`should return`, async () => {
        // arrange
        mockServices.stripeService.getProrateAmountForSubscription = jest.fn().mockImplementation(() => (mockData.getProrateAmountForSubscriptionResult));

        // act
        const results = await service.getProrateAmountForSubscription(mockData.userId.toString(), mockData.offeringItems);

        // assert
        expect(results).toBeDefined();

      });
    });

    describe('Error', () => {
      it(`subscription not found`, async () => {
        // arrange
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(null);
        mockServices.stripeService.getProrateAmountForSubscription = jest.fn().mockImplementation(() => (mockData.getProrateAmountForSubscriptionResult));

        // act
        await expect(service.getProrateAmountForSubscription(mockData.userId.toString(), mockData.offeringItems)).rejects.toThrow();

      });

      it(`handle stripe getProrateAmountForSubscription error`, async () => {
        // arrange
        const stripeResult = ApiResultWithError.failure("", new Error());
        mockServices.stripeService.getProrateAmountForSubscription = jest.fn().mockResolvedValueOnce(stripeResult);

        // act
        await expect(service.getProrateAmountForSubscription(mockData.userId.toString(), mockData.offeringItems)).rejects.toThrow();
      });
    });


  });

  describe(`${ConnectSubscriptionService.prototype.deleteSubscriptionWithInvoiceAndCancelStripeSubscription.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.deleteSubscriptionWithInvoiceAndCancelStripeSubscription).toBeDefined();
    });


    describe('Success', () => {
      it(`should return`, async () => {
        // arrange
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => (mockData.connectSubscription)
        }));

        mockServices.dataContext.connectSubscriptions.findByIdAndDelete = jest.fn().mockResolvedValueOnce(null);
        mockServices.dataContext.connectSubscriptionInvoices.findOneAndDelete = jest.fn().mockResolvedValueOnce(null);

        // act
        await expect(service.deleteSubscriptionWithInvoiceAndCancelStripeSubscription(mockData.connectSubscriptionId.toString())).resolves.not.toThrow();


      });
    });

    describe('Error', () => {
      it(`subscription not found`, async () => {
        // arrange

        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
          toObject: () => (null)
        }));

        // act
        await expect(service.deleteSubscriptionWithInvoiceAndCancelStripeSubscription(mockData.connectSubscriptionId.toString())).rejects.toThrow();


      });

      it(`invalid subscription status`, async () => {
        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Active
        });
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementation((...args) => ({
          toObject: () => (connectSubscription)
        }));

        mockServices.dataContext.connectSubscriptions.findByIdAndDelete = jest.fn().mockResolvedValueOnce(null);
        mockServices.dataContext.connectSubscriptionInvoices.findOneAndDelete = jest.fn().mockResolvedValueOnce(null);

        // act
        await expect(service.deleteSubscriptionWithInvoiceAndCancelStripeSubscription(mockData.connectSubscriptionId.toString())).rejects.toThrow();



      });

    });

  });

  describe(`${ConnectSubscriptionService.prototype.cancelSelectServicesByNetworkIdAndBillingCategory.name}`, () => {
    it(` should be defined`, async () => {
      expect(service.cancelSelectServicesByNetworkIdAndBillingCategory).toBeDefined();
    });

    describe('Success', () => {
      it(`handle entire subscription cancelation `, async () => {

        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          items: createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkId: mockData.networkId.toString(),
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: mockData.networkId.toString(),
              statusOverride: ConnectSubscriptionItemStatus.PendingCancelation,
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            })
          ])
        });
        const taskQueueItem = createMock<TaskQueueItem>({
          _id: '123', payload: {
            networkId: ''
          }
        });
        mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => mockData.networkPriceBillingCategory
        }));
        jest.spyOn(service as any, "processSubscriptionMeteredUsage").mockResolvedValueOnce({});
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(connectSubscription);
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce(() => ({
          toObject: () => connectSubscription
        }))
          .mockImplementationOnce(() => ({
            toObject: () => connectSubscription
          }));
        mockServices.taskQueueItemDataService.findByPayloadAndType = jest.fn().mockResolvedValueOnce([taskQueueItem]);
        mockServices.taskQueueItemDataService.deleteTask = jest.fn().mockResolvedValueOnce(ApiResultWithError.success());
        mockServices.networkCancellationService.disableNetworkServiceOffering = jest.fn().mockResolvedValueOnce({});
        mockServices.stripeService.cancelSubscription = jest.fn().mockResolvedValueOnce({});
        mockServices.taskQueueItemDataService.deleteTask = jest.fn().mockResolvedValueOnce({});
        mockServices.networkCancellationService.terminateNetworkServiceOffering = jest.fn().mockResolvedValueOnce({});

        // act 
        const results = await service.cancelSelectServicesByNetworkIdAndBillingCategory(mockData.user, connectSubscription, mockData.networkId.toString(), mockData.billingCategoryCode);

        // assert
        expect(results).toBeTruthy();

      });

      it(`handle cancel only 1 item`, async () => {
        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          items: createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkId: mockData.networkId.toString(),
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: '123',
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            })
          ])
        });
        mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => mockData.networkPriceBillingCategory
        }));
        jest.spyOn(service as any, "processSubscriptionMeteredUsage").mockResolvedValueOnce({});
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(connectSubscription);
        mockServices.stripeService.removeItemFromSubscription = jest.fn().mockResolvedValueOnce(ApiResultWithError.success());

        // act 
        const results = await service.cancelSelectServicesByNetworkIdAndBillingCategory(mockData.user, connectSubscription, mockData.networkId.toString(), mockData.billingCategoryCode);

        // assert
        expect(results).toBeTruthy();

      });

      it(`handle sub with item pending cancelation`, async () => {
        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          items: createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkId: NetworkId.LIGHTNING,
              statusOverride: ConnectSubscriptionItemStatus.PendingCancelation,
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: NetworkId.LIGHTNING,
              statusOverride: ConnectSubscriptionItemStatus.PendingCancelation,
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: NetworkId.ETHEREUM,
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: NetworkId.ETHEREUM,
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),

          ])
        });
        const taskQueueItem = createMock<TaskQueueItem>({
          _id: '123', payload: {
            networkId: ''
          }
        });
        mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => mockData.networkPriceBillingCategory
        }));
        jest.spyOn(service as any, "processSubscriptionMeteredUsage").mockResolvedValueOnce({});
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(connectSubscription);
        mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce(() => ({
          toObject: () => connectSubscription
        })).mockImplementationOnce(() => ({
          toObject: () => connectSubscription
        }));;
        mockServices.taskQueueItemDataService.findByPayloadAndType = jest.fn().mockResolvedValueOnce([taskQueueItem]);
        mockServices.taskQueueItemDataService.deleteTask = jest.fn().mockResolvedValueOnce(ApiResultWithError.success());
        mockServices.networkCancellationService.disableNetworkServiceOffering = jest.fn().mockResolvedValueOnce({});
        mockServices.stripeService.cancelSubscription = jest.fn().mockResolvedValueOnce({});
        mockServices.taskQueueItemDataService.deleteTask = jest.fn().mockResolvedValueOnce({});
        mockServices.taskQueueItemDataService.createScheduledTask = jest.fn().mockResolvedValueOnce({});

        // act 
        const results = await service.cancelSelectServicesByNetworkIdAndBillingCategory(mockData.user, connectSubscription, NetworkId.ETHEREUM.toString(), mockData.billingCategoryCode);

        // assert
        expect(results).toBeTruthy();


      });
    });

    describe('Error', () => {
      it(`handle billing category not found`, async () => {
        // arrange
        mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => null
        }));

        // act 
        await expect(service.cancelSelectServicesByNetworkIdAndBillingCategory(mockData.user, mockData.connectSubscription, mockData.networkId.toString(), mockData.billingCategoryCode)).rejects.toThrow();


      });

      it(`handle stripe removeItemFromSubscription error`, async () => {
        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          items: createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkId: mockData.networkId.toString(),
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            }),
            createMock<ConnectSubscriptionItem>({
              networkId: '123',
              networkPrice: createMock<NetworkPrice>({
                billingCategory: mockData.networkPriceBillingCategory
              })
            })
          ])
        });
        mockServices.dataContext.networkPriceBillingCategories.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => mockData.networkPriceBillingCategory
        }));
        jest.spyOn(service as any, "processSubscriptionMeteredUsage").mockResolvedValueOnce({});
        jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(connectSubscription);
        mockServices.stripeService.removeItemFromSubscription = jest.fn().mockResolvedValueOnce(ApiResultWithError.failure())

        // act 
        await expect(service.cancelSelectServicesByNetworkIdAndBillingCategory(mockData.user, connectSubscription, mockData.networkId.toString(), mockData.billingCategoryCode)).rejects.toThrow();



      });
    });

  });

  describe(`${ConnectSubscriptionService.prototype.deleteSubscriptionWithInvoice.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.deleteSubscriptionWithInvoice).toBeDefined();
    });

    describe('Success', () => {
      it(`should return`, async () => {
        // arrange
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => (mockData.connectSubscription)
        }));

        mockServices.dataContext.connectSubscriptions.findByIdAndDelete = jest.fn().mockResolvedValueOnce(null);
        mockServices.dataContext.connectSubscriptionInvoices.findOneAndDelete = jest.fn().mockResolvedValueOnce(null);

        // act
        await expect(service.deleteSubscriptionWithInvoice(mockData.connectSubscriptionId.toString())).resolves.not.toThrow();
      });
    });

    describe('Error', () => {
      it(`subscription not found`, async () => {
        // arrange

        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => (null)
        }));

        // act
        await expect(service.deleteSubscriptionWithInvoice(mockData.connectSubscriptionId.toString())).rejects.toThrow();

      });

      it(`invalid subscription status`, async () => {
        // arrange
        const connectSubscription = createMock<ConnectSubscription>({
          _id: '123',
          status: ConnectSubscriptionStatus.Active
        });
        mockServices.dataContext.connectSubscriptions.findOne = jest.fn().mockImplementationOnce((...args) => ({
          toObject: () => (connectSubscription)
        }));


        // act
        await expect(service.deleteSubscriptionWithInvoice(mockData.connectSubscriptionId.toString())).rejects.toThrow();


      });


    });
  });

  describe(`${ConnectSubscriptionService.prototype.setSubscriptionDefaultPaymentMethod.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.setSubscriptionDefaultPaymentMethod).toBeDefined();
    });

    it(`should return`, async () => {
      // arrange
      jest.spyOn(service as any, "getActiveSubscriptionForUser").mockResolvedValueOnce(mockData.connectSubscription);
      mockServices.stripeService.setSubscriptionDefaultPaymentMethod = jest.fn().mockResolvedValueOnce(ApiResult.success(true));

      // act
      const result = await service.setSubscriptionDefaultPaymentMethod(mockData.user, "123");

      // assert
      expect(result).toBeTruthy();
    });
  });

  describe(`Stripe Webhook integration`, () => {


    describe(`${ConnectSubscriptionService.prototype.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning.name}`, () => {
      it(` should be defined`, async () => {
        expect(service.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          const cart = createMock<Cart>({
            items: createMock<CartItem[]>([{
              offer: "123" as any
            }])
          });
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userNetworkDataService.addUserNetwork = jest.fn().mockImplementationOnce(() => (mockData.userNetwork));
          mockServices.stripeService.getProrateAmountForSubscription = jest.fn().mockImplementationOnce(() => (mockData.getProrateAmountForSubscriptionResult));
          mockServices.taskQueueItemDataService.createScheduledTask = jest.fn().mockImplementationOnce(() => (mockData.taskQueueItem));
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce(() => (mockData.connectSubscription));
          mockServices.dataContext.networkOfferings.findById = jest.fn().mockResolvedValueOnce(mockData.networkOffering);
          // act
          await expect(service.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning(mockData.stripeSubscriptionId.toString(), cart)).resolves.not.toThrow();

        });
      });

      describe('Error', () => {
        it(`Subscription not found `, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          // act
          await expect(service.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning(mockData.stripeSubscriptionId.toString(), createMock<Cart>())).rejects.toThrow();

        });

        it(`Error adding userNetwork`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userNetworkDataService.addUserNetwork = jest.fn().mockImplementationOnce(null);
          // act
          await expect(service.markSubscriptionActiveByStripeSubscriptionIdAndInitiateUserNetworkProvisioning(mockData.stripeSubscriptionId.toString(), createMock<Cart>())).rejects.toThrow();


        });
      });


    });

    describe(`${ConnectSubscriptionService.prototype.captureSubscriptionInvoicePaymentByStripeInvoiceId.name}`, () => {
      it(` should be defined`, async () => {
        expect(service.captureSubscriptionInvoicePaymentByStripeInvoiceId).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementation((...args) => ({
            toObject: () => mockData.connectSubscriptionInvoice
          }));
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.stripeService.getInvoiceById = jest.fn().mockResolvedValueOnce((...args) => (mockData.stripeInvoiceResult));
          jest.spyOn(service as any, "getOrCreateMatchingQuickbooksInvoiceId").mockResolvedValueOnce("");
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockImplementation((...args) => (mockData.connectSubscription));
          // act
          await expect(service.captureSubscriptionInvoicePaymentByStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0)).resolves.not.toThrow();


        });
      });

      describe('Error', () => {
        it(`handle Subscription Invoice not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementation((...args) => ({
            toObject: () => null
          }));
          // act
          await expect(service.captureSubscriptionInvoicePaymentByStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0)).rejects.toThrow();


        });

        it(`handle Subscription not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementation((...args) => ({
            toObject: () => mockData.connectSubscriptionInvoice
          }));
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          // act
          await expect(service.captureSubscriptionInvoicePaymentByStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0)).rejects.toThrow();

        });

        it(`handle stripeInvoice not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscriptionInvoice
          }));
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.stripeService.getInvoiceById = jest.fn().mockResolvedValueOnce(ApiResultWithError.failure("", new Error("")));
          // act
          await expect(service.captureSubscriptionInvoicePaymentByStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0)).rejects.toThrow();



        });


      });
    });

    describe(`${ConnectSubscriptionService.prototype.updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscriptionInvoice
          }));
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          jest.spyOn(service as any, "calculateMeteredUTCEndDate").mockResolvedValueOnce(Date.now());
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscription
          }));
          // act
          await expect(service.updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), Date.now(), Date.now(), mockData.stripeInvoiceId.toString())).resolves.not.toThrow();



        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange

          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);

          try {
            // act
            const results = await service.updateSubscriptionPeriodAndEnsureNewInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), Date.now(), Date.now(), mockData.stripeInvoiceId.toString());

          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }


        });
      });

    });

    describe(`${ConnectSubscriptionService.prototype.ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.stripeService.getSubscriptionStatus = jest.fn().mockImplementationOnce((...args) => (mockData.subscriptionStatusResult));
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscription
          }));
          jest.spyOn(service as any, "captureSubscriptionInvoicePaymentByStripeInvoiceId").mockResolvedValueOnce(mockData.booleanResult);

          // act
          // assert
          await expect(service.ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0)).resolves.not.toThrow();


        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);

          try {
            // act
            await service.ensureSubscriptionStatusAndCaptureSubscriptionInvoicePayment(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString(), mockData.stripePaymentIntentId.toString(), 0);

          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }

        });

      });

    });


    describe(`${ConnectSubscriptionService.prototype.updateSubscriptionStatus.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.updateSubscriptionStatus).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscription));

          // act
          const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());

          // assert
          expect(results).toBeDefined();

        });
        it(`should return when status is ${ConnectSubscriptionStatus.Canceled}`, async () => {
          // arrange
          const connectSubscription = createMock<ConnectSubscription>({
            _id: '123',
            status: ConnectSubscriptionStatus.Canceled
          });
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(connectSubscription);

          // act
          const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());

          // assert
          expect(results).toBeDefined();

        });
        it(`should return when status is ${ConnectSubscriptionStatus.PendingCancelation}`, async () => {
          // arrange
          const connectSubscription = createMock<ConnectSubscription>({
            _id: '123',
            status: ConnectSubscriptionStatus.PendingCancelation
          });
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(connectSubscription);

          // act
          const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());

          // assert
          expect(results).toBeDefined();

        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);

          try {
            // act
            const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }

        });

        it(`Subscription status not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          jest.spyOn(service as any, "mapStripeSubscriptionStatusToConnectSubscriptionStatusHelper").mockResolvedValueOnce(null);

          try {
            // act
            const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }

        });

        it(`Error updating`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => { throw new Error("") });

          try {
            // act
            const results = await service.updateSubscriptionStatus(mockData.stripeSubscriptionId.toString(), mockData.connectSubscriptionStatus.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }

        });
      });

    });


    describe(`${ConnectSubscriptionService.prototype.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId).toBeDefined();
      });


      describe('Success', () => {

        it(`should return`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          const errorData = createMock<{ attemptCount: number, nextAttempt: number, code: string, message: string, amountDue: number, referenceId: string }>();
          // act
          // assert
          await expect(service.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId(mockData.stripeInvoiceId.toString(), errorData)).resolves.not.toThrow();


        });
      });

      describe('Error', () => {
        it(`Subscription Invoice not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (null));
          const errorData = createMock<{ attemptCount: number, nextAttempt: number, code: string, message: string, amountDue: number, referenceId: string }>();

          try {
            // act
            const results = await service.captureSubscriptionInvoicePaymentErrorByStripeInvoiceId(mockData.stripeInvoiceId.toString(), errorData);
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }
        });
      });
    });

    describe(`${ConnectSubscriptionService.prototype.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscription
          }));

          // act
          // assert
          await expect(service.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId(mockData.stripeSubscriptionId.toString())).resolves;
        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);

          try {
            // act
            const results = await service.ensureSubscriptionIsMarkedUnPaidByStripeInvoiceId(mockData.stripeSubscriptionId.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }
        });
      });

    });

    describe(`${ConnectSubscriptionService.prototype.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId).toBeDefined();
      });

      describe('Success', () => {
        it(` should return with invoice status of ${ConnectSubscriptionInvoiceStatus.Draft}`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          // act
          // assert
          await expect(service.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId(mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });

        it(` should return with invoice status not in status ${ConnectSubscriptionInvoiceStatus.Draft}`, async () => {
          // arrange
          const connectSubscriptionInvoice = createMock<ConnectSubscriptionInvoice>({
            status: ConnectSubscriptionInvoiceStatus.Paid
          });
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (connectSubscriptionInvoice));

          // act
          // assert
          await expect(service.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId(mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });
      });

      describe('Error', () => {
        it(`Subscription Invoice not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (null));
          try {
            // act
            const results = await service.ensureSubscriptionInvoiceIsMarkedAsOpenByStripeInvoiceId(mockData.stripeInvoiceId.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }
        });
      });


    });

    describe(`${ConnectSubscriptionService.prototype.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId).toBeDefined();
      });

      describe('Success', () => {
        it(` should return with invoice status of ${ConnectSubscriptionInvoiceStatus.Draft}`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => (mockData.connectSubscriptionInvoice));
          // act
          await expect(service.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId(mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });


        it(` should return with invoice status of ${ConnectSubscriptionInvoiceStatus.Paid}`, async () => {
          // arrange
          const connectSubscriptionInvoice = createMock<ConnectSubscriptionInvoice>({
            status: ConnectSubscriptionInvoiceStatus.Paid
          });
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (connectSubscriptionInvoice));

          // act
          await expect(service.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId(mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });
      });

      describe('Error', () => {
        it(`Subscription Invoice not found`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockImplementationOnce((...args) => (null));

          try {
            // act
            const results = await service.ensureSubscriptionInvoiceIsMarkedAsVoidByStripeInvoiceId(mockData.stripeInvoiceId.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }
        });
      });

    });


    describe(`${ConnectSubscriptionService.prototype.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          jest.spyOn(service as any, "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper").mockResolvedValueOnce(mockData.booleanResult);

          // act
          await expect(service.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeSubscriptionId.toString())).resolves.not.toThrow();

        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);

          // act
          await expect(service.ensureSubscriptionInvoiceIsCreatedForStripeInvoiceId(mockData.stripeSubscriptionId.toString(), mockData.stripeSubscriptionId.toString())).rejects.toThrow();

        });
      });

    });


    describe(`${ConnectSubscriptionService.prototype.processStripeSubscriptionLineItemRemoval.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.processStripeSubscriptionLineItemRemoval).toBeDefined();
      });

      describe('Success', () => {

        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          jest.spyOn(service as any, "cancelSelectServicesHelper").mockResolvedValueOnce(mockData.booleanResult);
          const stripeSubscriptionLineItemIds: string[] = createMock<string[]>();
          // act
          await expect(service.processStripeSubscriptionLineItemRemoval(mockData.stripeSubscriptionId.toString(), stripeSubscriptionLineItemIds)).resolves.not.toThrow();

        });
      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          const stripeSubscriptionLineItemIds: string[] = createMock<string[]>();

          // act
          await expect(service.processStripeSubscriptionLineItemRemoval(mockData.stripeSubscriptionId.toString(), stripeSubscriptionLineItemIds)).rejects.toThrow();

        });
      });

    });

    describe(`${ConnectSubscriptionService.prototype.cancelSubscriptionAndEnsureInvoiceIsCreated.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.cancelSubscriptionAndEnsureInvoiceIsCreated).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({ toObject: () => mockData.connectSubscription }));
          jest.spyOn(service as any, "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper").mockResolvedValueOnce(mockData.booleanResult);
          mockServices.taskQueueItemDataService.setLastRunDateForTask = jest.fn().mockResolvedValueOnce(null);
          mockServices.taskQueueItemDataService.createScheduledTask = jest.fn().mockResolvedValueOnce(null);
          // act
          await expect(service.cancelSubscriptionAndEnsureInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });

        it(`handle with Subscription status  ${ConnectSubscriptionStatus.Canceled} `, async () => {
          const connectSubscription = createMock<ConnectSubscription>({
            status: ConnectSubscriptionStatus.Canceled
          });
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(connectSubscription);
          jest.spyOn(service as any, "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper").mockResolvedValueOnce(mockData.booleanResult);

          // act
          await expect(service.cancelSubscriptionAndEnsureInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });

        it(`handle with Subscription status  ${ConnectSubscriptionStatus.PendingCancelation} `, async () => {
          const connectSubscription = createMock<ConnectSubscription>({
            status: ConnectSubscriptionStatus.PendingCancelation
          });
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(connectSubscription);
          jest.spyOn(service as any, "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper").mockResolvedValueOnce(mockData.booleanResult);

          // act
          await expect(service.cancelSubscriptionAndEnsureInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });
      });

      describe('Error', () => {

        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByStripeSubscriptionId").mockResolvedValueOnce(null);
          // act
          await expect(service.cancelSubscriptionAndEnsureInvoiceIsCreated(mockData.stripeSubscriptionId.toString(), mockData.stripeInvoiceId.toString())).rejects.toThrow();


        });
      });
    });

  });


  describe(`Process Metered Billing`, () => {
    describe(`${ConnectSubscriptionService.prototype.processSubscriptionMeteredUsage.name}`, () => {
      it(`should be defined`, async () => {
        expect(service.processSubscriptionMeteredUsage).toBeDefined();
      });

      describe('Success', () => {
        it(`should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockImplementationOnce((...args) => (mockData.user));
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscription
          }));
          // act
          const results = await service.processSubscriptionMeteredUsage(mockData.connectSubscriptionId.toString());

          // assert
          expect(results).toBeDefined();

        });

      });

      describe('Error', () => {

        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(null);

          try {
            // act
            const results = await service.processSubscriptionMeteredUsage(mockData.connectSubscriptionId.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }

        });

        it(`user not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(null);
          try {
            // act
            const results = await service.processSubscriptionMeteredUsage(mockData.connectSubscriptionId.toString());
          } catch (error) {
            // assert
            expect(error).toBeDefined();
          }
        });
      });

    });
  });


  describe(`Cron Job Methods`, () => {

    describe(`${ConnectSubscriptionService.prototype.processSubscriptionTermination.name}`, () => {
      it(` should be defined`, async () => {
        expect(service.processSubscriptionTermination).toBeDefined();
      });

      describe('Success', () => {
        it(` should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockImplementationOnce((...args) => (mockData.user));
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.connectSubscription
          }));
          // act
          await expect(service.processSubscriptionTermination(mockData.connectSubscriptionId.toString())).resolves.not.toThrow();

        });
      });

      describe('Error', () => {

        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(null);
          // act
          await expect(service.processSubscriptionTermination(mockData.connectSubscriptionId.toString())).rejects.toThrow();

        });

        it(`user not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(null);
          // act
          await expect(service.processSubscriptionTermination(mockData.connectSubscriptionId.toString())).rejects.toThrow();

        });

      });

    });

    describe(`${ConnectSubscriptionService.prototype.processSubscriptionNetworkTermination.name}`, () => {
      it(` should be defined`, async () => {
        expect(service.processSubscriptionNetworkTermination).toBeDefined();
      });

      describe('Success', () => {

        it(` should return`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockImplementationOnce((...args) => (mockData.user));
          mockServices.dataContext.networkPriceBillingCategories.findById = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => mockData.networkPriceBillingCategory
          }));
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockResolvedValueOnce(null);
          mockServices.networkCancellationService.terminateNetworkServiceOffering = jest.fn().mockResolvedValueOnce(null);
          mockServices.stripeService.removeItemFromSubscription = jest.fn().mockResolvedValueOnce(null);
          // act
          await expect(service.processSubscriptionNetworkTermination(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.billingCategoryId.toString())).resolves.not.toThrow();

        });

      });

      describe('Error', () => {
        it(`Subscription not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(null);
          // act
          await expect(service.processSubscriptionNetworkTermination(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.billingCategoryId.toString())).rejects.toThrow();
        });

        it(`user not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(null);
          // act
          await expect(service.processSubscriptionNetworkTermination(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.billingCategoryId.toString())).rejects.toThrow();
        });

        it(`billing Category not found`, async () => {
          // arrange
          jest.spyOn(service as any, "getSubscriptionByIdPopulateItemsNetworkPrice").mockResolvedValueOnce(mockData.connectSubscription);
          mockServices.userDataService.getUserById = jest.fn().mockImplementationOnce((...args) => (mockData.user));
          mockServices.dataContext.networkPriceBillingCategories.findById = jest.fn().mockImplementationOnce((...args) => ({
            toObject: () => null
          }));
          // act
          await expect(service.processSubscriptionNetworkTermination(mockData.connectSubscriptionId.toString(), mockData.networkId.toString(), mockData.billingCategoryId.toString())).rejects.toThrow();

        });

      });
    });
  });

  describe(`Private Methods`, () => {

    const getOrCreateMatchingQuickbooksInvoiceId = "getOrCreateMatchingQuickbooksInvoiceId";
    describe(`${getOrCreateMatchingQuickbooksInvoiceId}`, () => {
      it(` should be defined`, async () => {
        expect(service[`${getOrCreateMatchingQuickbooksInvoiceId}`]).toBeDefined();
      });


      it('Should return', async () => {
        // arrange
        const userWithQboData = createMock<IUser>({
          billingDetails: {
            quickbooks: {
              customerRef: {
                name: '',
                value: '123'
              }
            }
          }
        });
        const stripeInvoice = createMock<Stripe.Invoice>({

          lines: {
            data: createMock<Stripe.InvoiceLineItem[]>([
              createMock<Stripe.InvoiceLineItem>({
                amount: 1,
                price: createMock<Stripe.Price>()
              })
            ])
          }
        });
        const connectSubscription = createMock<ConnectSubscription>({
          items: createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkId: mockData.networkId.toString(),
              networkPrice: createMock<NetworkPrice>({
                quickBooksItemId: '123'
              })
            })
          ])
        });
        mockServices.dataContext.users.findOne = jest.fn().mockImplementationOnce(() => ({
          toObject: () => userWithQboData
        }));
        mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValueOnce(createMock<QuickbooksInvoice>());
        mockServices.quickbooksInvoiceService.payInvoice = jest.fn().mockResolvedValueOnce(createMock<QuickBooksPaymentSummary>());
        // act
        const results = await service[`${getOrCreateMatchingQuickbooksInvoiceId}`](connectSubscription, stripeInvoice, mockData.stripePaymentIntentId.toString(), 0);
        // assert

        expect(results).toBeDefined();
      });

    });

    const cancelSelectServicesHelper = "cancelSelectServicesHelper";
    describe(`${cancelSelectServicesHelper}`, () => {
      it(` should be defined`, async () => {
        expect(service[`${cancelSelectServicesHelper}`]).toBeDefined();
      });

      describe('Success', () => {

        it(` should be return `, async () => {
          // arrange 
          const itemsToCancel = createMock<ConnectSubscriptionItem[]>([
            createMock<ConnectSubscriptionItem>({
              networkPrice: createMock<NetworkPrice>({
                billingCategory: createMock<NetworkPriceBillingCategory>({
                  _id: '123'
                })
              })
            })
          ]);
          mockServices.networkCancellationService.disableNetworkServiceOffering = jest.fn().mockResolvedValueOnce({});
          mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(mockData.user);
          mockServices.taskQueueItemDataService.createScheduledTask = jest.fn().mockResolvedValueOnce(mockData.taskQueueItem);
          mockServices.dataContext.connectSubscriptions.updateByIdAndSave = jest.fn().mockImplementationOnce(() => ({
            toObject: () => mockData.connectSubscription
          }));
          // act
          await expect(service[`${cancelSelectServicesHelper}`](mockData.connectSubscription, itemsToCancel)).resolves.not.toThrow();

        });

        it(` should be return when nop items to cancel `, async () => {
          // arrange 
          const itemsToCancel = createMock<ConnectSubscriptionItem[]>();
          // act
          await expect(service[`${cancelSelectServicesHelper}`](mockData.connectSubscription, itemsToCancel)).resolves.not.toThrow();


        });

      });

      describe('Error', () => {
        it(`handle user not found`, async () => {
          // arrange 
          const itemsToCancel = createMock<ConnectSubscriptionItem[]>([createMock<ConnectSubscriptionItem>()]);
          mockServices.userDataService.getUserById = jest.fn().mockResolvedValueOnce(null);
          // act
          await expect(service[`${cancelSelectServicesHelper}`](mockData.connectSubscription, itemsToCancel)).rejects.toThrow();

        });

      });

    });


    const ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper = "ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper";
    describe(`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`, () => {
      it(` should be defined`, async () => {
        expect(service[`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`]).toBeDefined();
      });

      describe('Success', () => {

        it(`should return`, async () => {
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockResolvedValueOnce(null);
          mockServices.stripeService.getInvoiceTotal = jest.fn().mockResolvedValueOnce(ApiResult.success(0));
          mockServices.dataContext.connectSubscriptionInvoices.create = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          // act
          await expect(service[`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`](mockData.connectSubscription, mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });

        it(`test Update`, async () => {
          // arrange

          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          mockServices.stripeService.getInvoiceTotal = jest.fn().mockResolvedValueOnce(ApiResult.success(0));
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          // act
          await expect(service[`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`](mockData.connectSubscription, mockData.stripeInvoiceId.toString(), Date.now(), Date.now(), Date.now(), Date.now())).resolves.not.toThrow();

        });

      });

      describe('Error', () => {

        it(`handle stripeService.getInvoiceTotal error`, async () => {
          // arrange

          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          mockServices.stripeService.getInvoiceTotal = jest.fn().mockResolvedValueOnce(ApiResultWithError.failure());

          // act
          await expect(service[`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`](mockData.connectSubscription, mockData.stripeInvoiceId.toString())).resolves.not.toThrow();

        });

        it(`handle duplicate error`, async () => {
          class SampleError extends Error {
            code: number;
            constructor(message, code) {
              super(message);
              this.code = code;
            }
          }
          // arrange
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          mockServices.stripeService.getInvoiceTotal = jest.fn().mockResolvedValueOnce(ApiResult.success(0));
          mockServices.dataContext.connectSubscriptionInvoices.create = jest.fn().mockImplementationOnce(() => { throw new SampleError("", 1100); });
          mockServices.dataContext.connectSubscriptionInvoices.findOne = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          mockServices.dataContext.connectSubscriptionInvoices.updateByIdAndSave = jest.fn().mockResolvedValueOnce(mockData.connectSubscriptionInvoice);
          // act
          await expect(service[`${ensureSubscriptionInvoiceIsCreatedForStripeInvoiceHelper}`](mockData.connectSubscription, mockData.stripeInvoiceId.toString())).resolves.not.toThrow();


        });


      });

    });

  });
});