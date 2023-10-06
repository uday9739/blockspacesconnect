import { Body, Controller, Get, Post, UseGuards, UsePipes } from "@nestjs/common";
import { AllowAnonymous } from "../../../auth";
import { Tenant } from "../../../tenants/decorators/Tenant.decorator";
import { Tenant as ITenant } from "@blockspaces/shared/models/tenants"
import { ValidRoute } from "../../../validation";
import { GenerateBolt11Dto } from "@blockspaces/shared/dtos/lightning";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { AddInvoiceResponse } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { LndService } from "../../../networks/lightning/lnd/services/LndService";
import { returnErrorStatus } from "../../../exceptions/utils";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { AuthGuard } from "@nestjs/passport";
import { CustomValidationPipe, ServiceUnavailableException } from "../../../exceptions/common";
import { LightningInvoiceService } from "../../../networks/lightning/invoices/services/LightningInvoiceService";
import { InvoiceReference, QuoteReference, QuoteStatus, InvoiceState, PaymentStatus, PaymentReference, BalanceReference, AmountReference, ChannelActivityReference, ObjectsResponseReference, ChannelActivity } from "@blockspaces/shared/models/lightning/Invoice";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiSecurity, ApiTags, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { BipApiAmountReference, BipApiInvoiceRequest, BipApiInvoiceRequestResponse, BipApiInvoiceStatusRequest } from "../types";
import { DateTime } from "luxon";

@AllowAnonymous()
@UsePipes(new CustomValidationPipe())
@ApiBadRequestResponse({ description: "Request Failed" })
@ApiUnprocessableEntityResponse({ description: "Validation Failed or Lookup Failed" })
@ApiSecurity('ApiKey')
@ApiTags('Bitcoin Invoicing & Payments')
@Controller("/")
export class BipApiController {
  constructor(
    private readonly invoice: LightningInvoiceService
  ) {

  }

  /**
   * 
   * invoice - Generates a BOLT 11 invoice from a user's lightning node
   * 
   * @param body {@link GenerateBolt11Dto}
   * @returns Promise {string} - the Bolt11 invoice
   * @exception 503 {@link ServiceUnavialableException} - Error creating the Invoice
   * 
   */
  @ApiBody({ type: BipApiInvoiceRequest, description: 'Invoice' })
  @ApiCreatedResponse({ description: "Invoice created", type: BipApiInvoiceRequestResponse })
  @Post("invoice")
  async createInvoice(@Body() body: BipApiInvoiceRequest): AsyncApiResult<BipApiInvoiceRequestResponse> {
    let invoice: InvoiceReference;
    let quote: QuoteReference;
    let invoice_response: BipApiInvoiceRequestResponse = new BipApiInvoiceRequestResponse();
    invoice_response.amount = new BipApiAmountReference();
    let request = body;
    if (['btc', 'sat'].includes(request.currency.toLowerCase())) {
      let divisor = 1;
      if (request.currency === 'sat') {
        divisor = 100_000_000;
      }
      const todayDate: DateTime = DateTime.now();
      const today: number = todayDate.toMillis();
      const btcConversion = await this.invoice.getBtcConversion(today, 1);
      request.amount = ((request.amount / divisor) * btcConversion.exchangeRate);
      request.currency = 'usd';
    }

    try {
      invoice = await this.invoice.createInvoice(
        request.currency.toLowerCase(),
        request.amount,
        request.memo,
        request.tenant_id
      );
    } catch (error) {
      return returnErrorStatus(HttpStatus.SERVICE_UNAVAILABLE, ApiResult.failure(`Error received generating invoice: ${JSON.stringify(request)}`));
    }
    if (!invoice) {
      returnErrorStatus(HttpStatus.SERVICE_UNAVAILABLE, ApiResult.failure(`Failed to generate invoice: ${JSON.stringify(request)}`));
    }

    try {
      quote = await this.invoice.generateQuote(invoice.invoiceId, 300, request.tenant_id);
      Object.keys(invoice_response.amount).forEach(key => key in quote.amount ? invoice_response.amount[key] = quote.amount[key] : null);
      Object.keys(invoice_response).forEach(key => key in quote ? invoice_response[key] = quote[key] : null);
    } catch (error) {
      return returnErrorStatus(HttpStatus.SERVICE_UNAVAILABLE, ApiResult.failure(`Failed to generate payment request: ${JSON.stringify(request)}`));
    }
    return ApiResult.success(invoice_response);
  }

  /**
   * 
   * invoice - Generates a BOLT 11 invoice from a user's lightning node
   * 
   * @param body {@link BipApiInvoiceStatusRequest}
   * @returns Promise {string} - the Bolt11 invoice
   * @exception 503 {@link ServiceUnavialableException} - Error creating the Invoice
   * 
   */
  @ApiBody({ type: BipApiInvoiceStatusRequest, description: 'Invoice' })
  @ApiOkResponse({ description: "Invoice found", type: BipApiInvoiceRequestResponse })
  @Get("invoice")
  async getInvoiceStatus(@Body() body: BipApiInvoiceStatusRequest): AsyncApiResult<InvoiceReference> {
    let invoice: InvoiceReference;
    let quote: QuoteReference;
    try {
      invoice = await this.invoice.getInvoiceStatus(
        body.invoice_id,
        body.tenant_id
      );
    } catch (error) {
      return returnErrorStatus(HttpStatus.SERVICE_UNAVAILABLE, ApiResult.failure(`Error received getting invoice status: ${JSON.stringify(body)}`));
    }
    if (!invoice) {
      returnErrorStatus(HttpStatus.SERVICE_UNAVAILABLE, ApiResult.failure(`Failed to get invoice: ${JSON.stringify(body)}`));
    }

    return ApiResult.success(invoice);
  }

}