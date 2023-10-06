import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { AmountReference, InvoiceReference, QuoteReference } from "@blockspaces/shared/models/lightning/Invoice";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { BadRequestException, HttpException } from "@nestjs/common/exceptions";
import { createMock } from "ts-auto-mock";
import { LightningInvoiceService } from "../../../networks/lightning/invoices/services/LightningInvoiceService";
import { BipApiAmountReference, BipApiInvoiceRequest, BipApiInvoiceRequestResponse, BipApiInvoiceStatusRequest } from "../types";
import { BipApiController } from "./BipApiController";

describe(BipApiController, () => {

  let controller: BipApiController;

  let mocks: {
    lightning: LightningInvoiceService,
    invoice_request: BipApiInvoiceRequest,
    invoice_reference: InvoiceReference,
    invoice_request_response: BipApiInvoiceRequestResponse,
    invoice_status_request: BipApiInvoiceStatusRequest,
    amount_reference: AmountReference,
  } = {
    lightning: createMock<LightningInvoiceService>(),
    invoice_request: createMock<BipApiInvoiceRequest>(),
    invoice_reference: createMock<InvoiceReference>(),
    invoice_request_response: createMock<BipApiInvoiceRequestResponse>(),
    invoice_status_request: createMock<BipApiInvoiceStatusRequest>(),
    amount_reference: createMock<AmountReference>(),
  }
  mocks.invoice_request.amount = 0.01;
  mocks.invoice_request.currency = 'usd';
  mocks.invoice_request.memo = 'memo';
  mocks.invoice_request.tenant_id = '1234';

  mocks.invoice_reference.amount.fiatValue = 0.01;
  mocks.invoice_reference.amount.currency = 'usd';
  mocks.invoice_reference.tenantId = '1234';

  mocks.invoice_request_response.amount = createMock<BipApiAmountReference>();

  mocks.amount_reference.currency = 'usd';
  mocks.amount_reference.fiatValue = 100;
  mocks.amount_reference.btcValue = 0.0044177;
  mocks.amount_reference.exchangeRate = 22639.17;

  controller = new BipApiController(mocks.lightning);
  beforeEach(() => {
  })

  it('should succeed create a new invoice', async () => {
    mocks.lightning.createInvoice = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.generateQuote = jest.fn().mockResolvedValueOnce(mocks.invoice_request_response);
    const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
    expect(invoice_create_response.status).toEqual(ApiResultStatus.Success);
    expect(invoice_create_response.data.amount.fiatValue).toEqual(0);
  })

  it('should succeed create a new invoice with btc', async () => {
    mocks.invoice_request.amount = 0.01;
    mocks.invoice_request.currency = 'btc';
    mocks.amount_reference.currency = 'usd';
    mocks.amount_reference.fiatValue = 226.3619;
    mocks.amount_reference.btcValue = 0.01;
    mocks.amount_reference.exchangeRate = 22639.17;
    mocks.lightning.getBtcConversion = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.createInvoice = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.generateQuote = jest.fn().mockResolvedValueOnce(mocks.invoice_request_response);
    const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
    expect(invoice_create_response.status).toEqual(ApiResultStatus.Success);
    expect(invoice_create_response.data.amount.fiatValue).toEqual(0);
  })

  it('should succeed create a new invoice with satoshis', async () => {
    mocks.invoice_request.amount = 10000;
    mocks.invoice_request.currency = 'sat';
    mocks.amount_reference.currency = 'usd';
    mocks.amount_reference.fiatValue = 226.3619;
    mocks.amount_reference.btcValue = 0.01;
    mocks.amount_reference.exchangeRate = 22639.17;
    mocks.lightning.getBtcConversion = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.createInvoice = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.generateQuote = jest.fn().mockResolvedValueOnce(mocks.invoice_request_response);
    const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
    expect(invoice_create_response.status).toEqual(ApiResultStatus.Success);
    expect(invoice_create_response.data.amount.fiatValue).toEqual(0);
  })

  it('should fail creating a new invoice with a service unavailble', async () => {
    mocks.invoice_request.amount = 0;
    mocks.lightning.createInvoice = () => { throw new BadRequestException('error') };
    mocks.lightning.generateQuote = jest.fn().mockResolvedValueOnce(mocks.invoice_request_response);
    try {
      const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
      expect(1).toBe(2);
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  })

  it('should fail creating a new invoice and no invoice returned', async () => {
    mocks.lightning.createInvoice = jest.fn().mockResolvedValueOnce(null);
    mocks.lightning.generateQuote = jest.fn().mockResolvedValueOnce(mocks.invoice_request_response);
    try {
      const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
      expect(1).toBe(2);
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  })

  it('should fail creating a new invoice with a service unavailble', async () => {
    mocks.invoice_reference.invoiceId = '1234';
    mocks.lightning.createInvoice = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    mocks.lightning.generateQuote = () => { throw new BadRequestException('error') };
    try {
      const invoice_create_response = await controller.createInvoice(mocks.invoice_request);
      expect(1).toBe(2);
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  })

  it('should succeed getting the invoice status', async () => {
    mocks.lightning.getInvoiceStatus = jest.fn().mockResolvedValueOnce(mocks.invoice_reference);
    try {
      const invoice_status_response = await controller.getInvoiceStatus({ invoice_id: '1234', tenant_id: '1234' });
      expect(invoice_status_response.data.invoiceId).toBe('1234');
    } catch (err) {
      const error = err as HttpException;
      expect(1).toBe(2)
    }
  })

  it('should fail getting the invoice status when there is an error retrieving the invoice', async () => {
    mocks.lightning.getInvoiceStatus = () => { throw new BadRequestException('error') };
    try {
      const invoice_status_response = await controller.getInvoiceStatus({ invoice_id: '1234', tenant_id: '1234' });
      expect(1).toBe(2)
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  })

  it('should fail getting the invoice status when an invoice is not returned', async () => {
    mocks.lightning.getInvoiceStatus = jest.fn().mockResolvedValueOnce(null);
    try {
      const invoice_status_response = await controller.getInvoiceStatus({ invoice_id: '1234', tenant_id: '1234' });
      expect(1).toBe(2)
    } catch (err) {
      const error = err as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  })

});
