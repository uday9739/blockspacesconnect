import { BillingAddressDto, CartPaymentConfig, CartSessionResponseDto, UserCartDto } from "@blockspaces/shared/dtos/cart";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { CartError, CartStatus } from "@blockspaces/shared/models/cart";
import { action, computed, makeAutoObservable, reaction, runInAction, toJS, when } from "mobx";
import { DataStore, IDataStore } from "../data-store";
import { CartTransport } from "./cart-transport";


export class CartStore implements IDataStore {
  network: string = null;
  isLoading = false;
  isBillingInfoLoading = false;
  initializingCartSession: boolean = false;
  cartSession: UserCartDto = null;
  paymentConfig: CartPaymentConfig = null;
  priceCatalog: NetworkOfferingDTO[] = [];
  cartErrorMsg: string = null;
  networkData: {
    name: string,
    description: string
  } = null;
  isConfirmingNewItemsLoading: boolean = false;
  pendingPaymentMsg: string = null;
  @computed
  get networkName(): string {
    return this.networkData?.name;
  }

  @computed
  get isPendingPaymentProcessing() {
    return this.cartSession?.status === CartStatus.PENDING_PROCESSING_PAYMENT;
  }
  @computed
  get isCartEmpty() {
    return this.cartSession?.status === CartStatus.EMPTY;
  }

  @computed
  get isCheckoutComplete() {
    return this.cartSession?.status === CartStatus.CHECKOUT_COMPLETE;
  }
  constructor(
    public readonly dataStore: DataStore,
    private readonly transport: CartTransport = CartTransport.instance
  ) {

    makeAutoObservable(this);

    when(
      // Once...
      () => this.isPendingPaymentProcessing,
      // ... then.
      () => this.cartStatusPoll()
    )


  }
  @action
  reset(): void {
    this.network = null;
    this.isLoading = false;
    this.isBillingInfoLoading = false;
    this.initializingCartSession = false;
    this.cartSession = null;
    this.cartErrorMsg = null;
    this.paymentConfig = null;
    this.priceCatalog = [];
    this.networkData = null;
    this.isConfirmingNewItemsLoading = false;
    this.pendingPaymentMsg = null;
  }


  async initCart(networkId: string): Promise<void> {
    if (this.initializingCartSession) return;
    this.reset();

    runInAction(() => {
      this.initializingCartSession = true;
      this.network = networkId;
    });

    const cartResults = await this.transport.initCart(networkId);
    if (cartResults.isFailure) {
      runInAction(() => {
        this.cartErrorMsg = cartResults.message;
      });

    } else {
      runInAction(() => {
        this.cartSession = cartResults.data.cart;
        this.priceCatalog = cartResults.data.catalog
        this.paymentConfig = cartResults.data.paymentConfig;
        this.networkData = cartResults.data.network;

        if (this.cartSession?.status === CartStatus.ERROR_GATEWAY_ERROR || this.cartSession?.status === CartStatus.PENDING_PROCESSING_PAYMENT) {
          this.pendingPaymentMsg = "Pickup where you left off";
        }

      });

    }
    runInAction(() => {
      this.initializingCartSession = false;
    });


  }

  @action
  async selectOffering(offering) {
    if (this.isLoading) return;
    this.isLoading = true;
    const cartResults = await this.transport.selectOffering(this.cartSession.id, offering);
    if (cartResults.isFailure) {
      this.cartErrorMsg = cartResults.message;
    } else {
      runInAction(() => {
        this.cartSession = cartResults.data.cart;
        this.networkData = cartResults.data.network;
        if (cartResults.data.paymentConfig)
          this.paymentConfig = cartResults.data.paymentConfig;
      });

    }
    runInAction(() => {
      this.isLoading = false;
    });

  }

  @action
  async submitBillingInfo(billingInfo: BillingAddressDto) {
    if (this.isBillingInfoLoading) return;
    this.setCartErrorMsg(null);
    this.isBillingInfoLoading = true;
    const cartResults = await this.transport.submitBillingInfo(this.cartSession.id, billingInfo);
    if (cartResults.isFailure) {
      this.cartErrorMsg = cartResults.message;
    } else {
      this.cartSession = cartResults.data.cart;
      this.paymentConfig = cartResults.data.paymentConfig;
    }
    this.isBillingInfoLoading = false;
  }

  async checkCartPendingPayment() {
    const cartResults = await this.transport.getCartPendingPayment();
    if (cartResults.isSuccess && cartResults.data) {
      runInAction(() => {
        this.cartSession = cartResults.data.cart;
        this.priceCatalog = cartResults.data.catalog
        this.paymentConfig = cartResults.data.paymentConfig;
        this.networkData = cartResults.data.network;
        this.network = cartResults.data.cart.networkId;
        if (this.cartSession?.status === CartStatus.ERROR_GATEWAY_ERROR)
          this.pendingPaymentMsg = "Pickup where you left off";
        else if (this.cartSession?.status === CartStatus.PENDING_PROCESSING_PAYMENT)
          this.pendingPaymentMsg = "Processing CC ...";
      });
    }
  }

  @action
  async confirmCartPendingItems() {
    if (this.isConfirmingNewItemsLoading) return;
    this.isConfirmingNewItemsLoading = true;
    const cartResults = await this.transport.confirmCartPendingItems(this.cartSession.id, this.paymentConfig?.paymentToken);
    if (cartResults.isFailure) {
      runInAction(() => {
        this.cartErrorMsg = cartResults.message;
      });
    } else {
      runInAction(() => {
        this.cartSession = cartResults.data;
        console.log(toJS(this.cartSession))
      });
    }
    runInAction(() => {
      this.isConfirmingNewItemsLoading = false;
    });

  }

  @action
  async markCartPendingPayment() {
    if (this.isLoading || this.isPendingPaymentProcessing) return;
    this.isLoading = true;
    await this.transport.markCartPendingPayment(this.cartSession.id);
    this.isLoading = false;
    await this.cartStatusPoll();
  }

  @action
  async markCartWithPaymentError(cartError: CartError) {
    await this.transport.markCartWithPaymentError(this.cartSession.id, cartError);
  }

  @action
  async cartStatusPoll() {
    if (this.isLoading) return;
    this.isLoading = true;
    const cartResults = await this.transport.getCart(this.cartSession.id);
    if (cartResults.isFailure) {
      this.cartErrorMsg = cartResults.message;
    } else {
      if (cartResults.data.status !== this.cartSession.status) {
        runInAction(() => {
          this.cartSession = cartResults.data;
        });

      }
    }

    this.isLoading = false;
    if (this.isPendingPaymentProcessing) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.cartStatusPoll();
    }

  }

  @action
  clearErrorMsg() {
    runInAction(() => {
      this.cartErrorMsg = null;
    });
  }

  setCartErrorMsg(msg) {
    runInAction(() => {
      this.cartErrorMsg = msg;
    });
  }

}