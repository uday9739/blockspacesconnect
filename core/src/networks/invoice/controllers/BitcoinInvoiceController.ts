import { CreateAnonymousQuoteDto, CreateInvoiceDto, GenerateQuoteDto } from "@blockspaces/shared/dtos/lightning";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { InvoiceReference, OnchainInvoice, OnchainQuote, QuoteReference } from "@blockspaces/shared/models/lightning/Invoice";
import { IUser } from "@blockspaces/shared/models/users";
import { Body, Controller, Get, HttpStatus, Patch, Post, Query, UseInterceptors } from "@nestjs/common";
import { DateTime } from "luxon";
import { AllowAnonymous } from "../../../auth";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { returnErrorStatus } from "../../../exceptions/utils";
import { TimeoutInterceptor } from "../../../middleware/services/TimeoutInterceptor";
import { User } from "../../../users";
import { ValidRoute } from "../../../validation";
import { BitcoinInvoiceService } from "../../bitcoin/services/BitcoinInvoiceService";
import { LightningInvoiceService } from "../../lightning/invoices/services/LightningInvoiceService";

@ValidRoute()
@Controller("/networks/bitcoin/invoice")
export class BitcoinInvoiceController {
  constructor(
    private readonly invoice: LightningInvoiceService,
    private readonly bitcoin: BitcoinInvoiceService,
    private readonly db: ConnectDbDataContext,
  ) { }

  @AllowAnonymous()
  @Post('onchain')
  async createOnchainInvoice(@Body() body: CreateInvoiceDto): Promise<ApiResult<InvoiceReference>> {
    const invoice = await this.bitcoin.createInvoice(body.currency, body.amount, body.memo, body.tenantId, body.erpMetadata, body.source);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to create invoice for ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }
  @AllowAnonymous()
  @Post()
  async createCanonicalInvoice(@Body() body: CreateInvoiceDto): Promise<ApiResult<{onchain: OnchainInvoice, offchain: InvoiceReference}>> {
    const invoice = await this.invoice.createCanonicalInvoice(body.currency, body.amount, body.memo, body.tenantId, null, body.erpMetadata, body.source);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to create invoice for ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @Post('lightning')
  async createInvoice(@Body() body: CreateInvoiceDto): Promise<ApiResult<InvoiceReference>> {
    const invoice = await this.invoice.createInvoice(body.currency, body.amount, body.memo, body.tenantId, null, body.erpMetadata, body.source);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to create invoice for ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @UseInterceptors(new TimeoutInterceptor())
  @Get('onchain')
  async getOnchainInvoiceStatus(@Query("invoiceId") invoiceId: string, @Query("tenantId") tenantId: string): Promise<ApiResult<InvoiceReference>> {
    const user = await this.db.users.findOne({ tenants: tenantId });
    const invoice = await this.bitcoin.getInvoiceStatus(invoiceId, tenantId, user);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to find status for invoice: ${invoiceId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @UseInterceptors(new TimeoutInterceptor())
  @Get()
  async getCanonicalInvoiceStatus(@Query("offchainInvoiceId") offchainInvoiceId: string, @Query("onchainInvoiceId") onchainInvoiceId: string, @Query("tenantId") tenantId: string): Promise<ApiResult<{onchain: OnchainInvoice, offchain: InvoiceReference}>> {
    const user = await this.db.users.findOne({ tenants: tenantId });
    const invoice = await this.invoice.getCanonicalInvoiceStatus(onchainInvoiceId, offchainInvoiceId, tenantId, user);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to find status for onchain invoice: ${onchainInvoiceId}, and offchain invoice ${offchainInvoiceId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @UseInterceptors(new TimeoutInterceptor())
  @Get('lightning')
  async getInvoiceStatus(@Query("invoiceId") invoiceId: string, @Query("tenantId") tenantId: string): Promise<ApiResult<InvoiceReference>> {
    const user = await this.db.users.findOne({ tenants: tenantId });
    const invoice = await this.invoice.getInvoiceStatus(invoiceId, tenantId, user);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to find status for invoice: ${invoiceId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @Post("quote/lightning/anon")
  async createAnonQuote(@Body() body: CreateAnonymousQuoteDto): Promise<ApiResult<QuoteReference>> {
    const invoice = await this.invoice.generateAnonQuote(body.tenantId, body.expirationInSecs, body.currency, body.amount, body.memo);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to create Anon quote for ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @UseInterceptors(new TimeoutInterceptor())
  @Post("quote/lightning")
  async generateQuote(@Body() body: GenerateQuoteDto): Promise<ApiResult<QuoteReference>> {
    // TODO, fetch invoice mac from mongo
    const invoice = await this.invoice.generateQuote(body.invoiceId, body.expirationInSecs, body.tenantId);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to generate a quote for: Invoice ${body.invoiceId} and Tenant ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @AllowAnonymous()
  @UseInterceptors(new TimeoutInterceptor())
  @Post("quote/onchain")
  async generateOnchainQuote(@Body() body: GenerateQuoteDto): Promise<ApiResult<OnchainQuote>> {
    // TODO, fetch invoice mac from mongo
    const invoice = await this.bitcoin.generateQuote(body.invoiceId, body.expirationInSecs, body.tenantId);
    if(!invoice){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to generate a quote for: Invoice ${body.invoiceId} and Tenant ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(invoice);
  }

  @Patch('lightning')
  async cancelInvoice(@User() user: IUser, @Query("invoiceId") invoiceId: string, @Query("tenantId") tenantId: string): Promise<ApiResult<InvoiceReference>> {
    if (!user.tenants.includes(tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const invoice = await this.invoice.cancelInvoice(invoiceId, tenantId);

    return ApiResult.success(invoice);
  }

  @Patch('onchain')
  async cancelOnchainInvoice(@User() user: IUser, @Query("invoiceId") invoiceId: string, @Query("tenantId") tenantId: string): Promise<ApiResult<InvoiceReference>> {
    if (!user.tenants.includes(tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const invoice = await this.bitcoin.cancelInvoice(invoiceId, tenantId);

    return ApiResult.success(invoice);
  }

  @Post("refresh")
  async refreshAllObjects(@User() user: IUser, @Body() body: { tenantId: string }): Promise<ApiResult> {
    // TODO, fetch invoice mac from mongo
    if (!user.tenants.includes(body.tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const objects = await this.invoice.refreshAllObjects(body.tenantId, user);
    if(!objects){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to refresh objects for ${body.tenantId}`),{log: false});
    }
    return ApiResult.success(objects);
  }

  @Get("history")
  async getPaidHistory(
    @User() user: IUser,
    @Query("tenantId") tenantId: string,
    @Query("start") start: number = DateTime.now().minus({days: 7}).toMillis(),
    @Query("end") end: number = DateTime.now().toMillis(),
  ): Promise<ApiResult> {
    // TODO, fetch invoice mac from mongo
    if (!user.tenants.includes(tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const { invoices } = await this.invoice.refreshAllObjects(tenantId, user);
    if(!invoices){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to get paid history for ${tenantId}`),{log: false});
    }
    return ApiResult.success(await invoices.filter(x => x.settleTimestamp >= start && x.settleTimestamp <= end));
  }

  @Get("payment/lightning")
  async getOutboundPayments(@User() user: IUser, @Query("tenantId") tenantId: string, @Query("start") start?: number, @Query("end") end?: number): Promise<ApiResult> {
    // TODO, fetch invoice mac from mongo
    if (!user.tenants.includes(tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const { payments } = await this.invoice.refreshAllObjects(tenantId, user);
    if(!payments){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to find outbound payments for ${tenantId}`),{log: false});
    }
    return ApiResult.success(payments.filter(x => (!start || x.settleTimestamp >= start) && (!end || x.settleTimestamp <= end)));
  }

  @Post("history")
  async getChartData(
    @User() user: IUser,
    @Body("tenantId") tenantId: string,
    @Body("interval") interval: NetworkDataInterval,
    @Body("fiat") fiat?: boolean,
    @Body("timezone") timezone: string = 'America/New_York',
    @Body("start") start: number = DateTime.now().setZone(timezone).minus({days: 7}).toMillis(), 
    @Body("end") end: number = DateTime.now().setZone(timezone).toMillis()
  ): Promise<ApiResult> {
    // TODO, fetch invoice mac from mongo
    if (!user.tenants.includes(tenantId)) {
      returnErrorStatus(HttpStatus.FORBIDDEN, ApiResult.failure("Invalid tenantId"),{log: false});
    }
    const invoices = await this.invoice.getInvoiceChartData(tenantId, interval, start, end, fiat, timezone, user);
    if(!invoices){
      returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`Unable to retrieve Lightning chart data for ${tenantId}`),{log: false});
    }
    return ApiResult.success(invoices);
  }


}