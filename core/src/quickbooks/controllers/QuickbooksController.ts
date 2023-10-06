import { Controller, Get, Post, Req, HttpStatus, Redirect, Body, NotFoundException, Param, Query } from "@nestjs/common";
import { Request } from "express";
import { AllowAnonymous } from "../../auth";
import { returnErrorStatus } from "../../exceptions/utils";
import { StoreCredentialsDto } from "@blockspaces/shared/dtos/quickbooks";
import { User } from "../../users";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import {
  AccountCreateQuickbooksRequestDto,
  AccountListQuickbooksDto,
  AccountQuickbooksDto,
  CreateQuickBooksInvoice,
  CustomerCreateQuickbooksRequestDto,
  CustomerListQuickbooksDto,
  CustomerQuickbooksDto,
  PaymentQuickBooksDto,
  PurchaseQuickbooksDto
} from "@blockspaces/shared/dtos/lightning";
import { QuickbooksService } from "../services/QuickbooksService";
import { QuickbooksCreatePurchase, QuickbooksOAuthClientToken, QuickBooksPaymentSummary } from "../types/QuickbooksTypes";
import { LightningQuickbooksService } from "../../networks/lightning/integrations/quickbooks/services/LightningQuickbooksService";
import { QuickbooksCustomerService } from "../services/QuickbooksCustomerService";
import { SaveCustomerRequestDto } from "@blockspaces/shared/dtos/lightning/quickbooks-customer";
import { IUser } from "@blockspaces/shared/models/users";
import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { InvoiceReference } from "@blockspaces/shared/models/lightning/Invoice";
import { QuickbooksAccountService } from "../services/QuickbooksAccountService";
import { QuickbooksPurchaseService } from "../services/QuickbooksPurchaseService";
import { CreatePurchaseDto } from "@blockspaces/shared/dtos/lightning/quickbooks-account";

@Controller("/quickbooks")
export class QuickbooksController {
  constructor(
    private readonly qbLigthningService: LightningQuickbooksService,
    private readonly quickbooksService: QuickbooksService,
    private readonly quickbooksCustomerService: QuickbooksCustomerService,
    private readonly quickbooksAccountService: QuickbooksAccountService,
    private readonly quickbooksPurchaseService: QuickbooksPurchaseService,
  ) { }

  /**
   * Checks if the user document has a `qboCustomerId`. If we do, they have connected to quickbooks.
   * 
   * @param userId The users ID.
   * @returns boolean flag
   */
  @AllowAnonymous()
  @Get("/status")
  async getConnectionStatus(@Query("tenantId") tenantId: string) {
    const result = await this.qbLigthningService.getConnectionStatus(tenantId);
    return ApiResult.success(result);
  }

  /**
   * Gets the authorization link for beginning the on-boarding flow.
   * @param user Current logged in user.
   */
  @Get("/auth-uri")
  @Redirect()
  async getAuthUri(@User() user: IUser) {
    return { url: await this.quickbooksService.authorizeUri(user.activeTenant?.tenantId) };
  }

  /**
   * Callback from QuickBooks online with the code for authentication. Redirect to front end to get access token.
   */
  @Get("/callback")
  // Allow anonymous because redirect throwing 401?
  @AllowAnonymous()
  @Redirect("/multi-web-app/lightning/quickbooks/auth")
  async callback(@Req() req: Request) {
    // Redirect to frontend to
    return { url: `/multi-web-app/lightning/connections?modal=finalizeConnection&qbUrl=${req.originalUrl}&step=syncing` };
  }

  /**
   * Retrieves a token from QuickBooks and stores it in the vault.
   * @param user User object for the access token and user id.
   * @param body Contains the url, realm id, and state to get a token from QuickBooks
   * @returns
   */
  @Post("/store-credentials")
  async storeCredentials(@User() user: IUser, @Body() body: StoreCredentialsDto): Promise<ApiResult<QuickbooksOAuthClientToken>> {
    const newToken: QuickbooksOAuthClientToken = await this.quickbooksService.storeClientToken(
      body,
      user.id,
      user.activeTenant?.tenantId,
      user.accessToken
    );
    return ApiResult.success(newToken, "QuickBooks authentication created and stored successfully.");
  }

  @Post("revoke")
  async revoke(@Body() body: QuickbooksOAuthClientToken): Promise<ApiResult<QuickbooksOAuthClientToken>> {
    // Get access token from vault and revoke access
    const result = await this.quickbooksService.revoke(body);
    if (!result) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`${result}`));
    }
    return ApiResult.success(result, "Revoked token.");
  }

  @AllowAnonymous()
  @Get('invoice')
  async getQuickBooksInvoice(@Query() query): Promise<ApiResult<QuickBooksInvoiceSummary>> {
    const invoice: QuickBooksInvoiceSummary = await this.qbLigthningService.getInvoice(query.tenantId, query.invoiceId, undefined);
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Failed to get QuickBooks invoice: ${query}`));
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @Post("invoice")
  async createQuickbooksInvoice(@Body() body: CreateQuickBooksInvoice): Promise<ApiResult<{ quickbooksInvoice: QuickBooksInvoiceSummary, lightningInvoice: InvoiceReference }>> {
    const invoice = await this.qbLigthningService.createInvoice(body.tenantId, body.invoiceId, undefined);
    if (!invoice) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure("Failed to create QuickBooks invoice"));
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @Post("invoice/payment")
  async makeQuickbooksPayment(@Body() body: PaymentQuickBooksDto): Promise<ApiResult<QuickBooksPaymentSummary>> {
    const payment: QuickBooksPaymentSummary = await this.qbLigthningService.postPayment(body.tenantId, body.invoiceId, undefined);
    if (!payment) {
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure("Failed to make QuickBooks payment."));
    }
    return ApiResult.success(payment);
  }

  @AllowAnonymous()
  @Post("payment")
  async makeUnappliedPayments(@Body() body: PaymentQuickBooksDto): Promise<ApiResult<QuickBooksPaymentSummary>> {
    const payment = await this.qbLigthningService.makeUnappliedPayment(body.tenantId, body.invoiceId, undefined, body.type);
    if (!payment) {
      throw new NotFoundException("Could not make QuickBooks payment.");
    }
    return ApiResult.success(payment);
  }

  /**
   * Create a new Quickbooks customer
   *
   * @param user {@link IUser}
   * @param body {@link CustomerCreateQuickbooksRequestDto}
   * @returns CustomerQuickbooksDto
   */
  @Post("create-customer")
  async createCustomer(@User() user: IUser, @Body() body: CustomerCreateQuickbooksRequestDto): Promise<ApiResult<CustomerQuickbooksDto>> {
    const result: CustomerQuickbooksDto = await this.quickbooksCustomerService.createCustomer(body, user);
    return ApiResult.success(result);
  };

  /**
   * Store a QuickBooks customer id in the user details
   *
   * @param userId The callers user id
   * @param customerId The customer in QuickBooks to store in the user details object.
   * @returns
   */
  @Post("save-customer")
  async saveCustomerId(@User() user: IUser, @Body() body: SaveCustomerRequestDto): Promise<ApiResult<IUser>> {
    const result: IUser = await this.quickbooksCustomerService.saveCustomerId(user.id, body.id);
    return ApiResult.success(result);
  }

  /**
   * List all Quickbooks customers.
   *
   * @param user {@link IUser}
   * @returns CustomerListQuickbooksDto List
   */
  @Get("customers")
  async listCustomer(@User() user: IUser): Promise<ApiResult<CustomerListQuickbooksDto[]>> {
    const result: CustomerListQuickbooksDto[] = await this.quickbooksCustomerService.listCustomer(user);
    return ApiResult.success(result);
  };

  /**
   * Get the Quickbooks customer details by id.
   *
   * @param user {@link IUser}
   * @param customerId {@link string} Quickbooks customer id.
   * @returns  CustomerQuickbooksDto
   */
  @Get("customer/:customerId")
  async getCustomer(@User() user: IUser, @Param("customerId") customerId: string): Promise<ApiResult<CustomerQuickbooksDto>> {
    const result: CustomerQuickbooksDto = await this.quickbooksCustomerService.getCustomer(user, customerId);
    return ApiResult.success(result);
  };

  /**
   * Create a new Quickbooks billing account
   *
   * @param user {@link IUser}
   * @param body {@link CustomerCreateQuickbooksRequestDto}
   * @returns CustomerQuickbooksDto
   */
  @Post("account")
  async createAccount(@User() user: IUser, @Body() body: AccountCreateQuickbooksRequestDto): Promise<ApiResult<AccountQuickbooksDto>> {
    const result: AccountQuickbooksDto = await this.quickbooksAccountService.createAccount(body, user);
    return ApiResult.success(result);
  };

  /**
   * List Quickbooks billing accounts by type
   *
   * @param user {@link IUser}
   * @returns CustomerListQuickbooksDto List
   */
  @Get("accounts/:type")
  async listAccounts(@User() user: IUser, @Param('type') type: string): Promise<ApiResult<AccountListQuickbooksDto[]>> {
    let result: AccountListQuickbooksDto[] = [];
    if (type === 'expense') {
      result = await this.quickbooksAccountService.listExpenseAccounts(user);
    } else if (type === 'revenue') {
      result = await this.quickbooksAccountService.listRevenueAccounts(user);
    } else {
      result = await this.quickbooksAccountService.listAssetAccounts(user);
    }
    return ApiResult.success(result);
  };

  /**
  * Make a QuickBooks purchase
  *
  * @param user {@link IUser}
  * @param expenseCategory string - QuickBooks Chart of Accounts Account of type Expense
  * @param amount number - The amount of the expense
  * 
  * @returns expense List
  * 
  */
  @Post("purchase")
  async createPurchase(@User() user: IUser, @Body() body: CreatePurchaseDto): Promise<ApiResult<PurchaseQuickbooksDto>> {
    const data: QuickbooksCreatePurchase = {
      AccountRef: {
        value: user.qboAccountId
      },
      PaymentType: "Cash",
      Line: [
        {
          Amount: body.amount,
          DetailType: "AccountBasedExpenseLineDetail",
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: body.expenseCategoryId,
              name: body.expenseCategoryName
            }
          }
        }
      ]
    };
    const result = await this.qbLigthningService.createPurchase(data, body.payment, user.id, user.activeTenant?.tenantId, user.accessToken);
    return ApiResult.success(result);
  };
}
