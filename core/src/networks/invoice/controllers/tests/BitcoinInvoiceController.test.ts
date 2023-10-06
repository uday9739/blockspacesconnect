import { CreateAnonymousQuoteDto, CreateInvoiceDto, GenerateQuoteDto, LightningChartData } from "@blockspaces/shared/dtos/lightning";
import { NetworkDataInterval } from "@blockspaces/shared/dtos/networks/data-series";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { InvoiceReference, ObjectsResponseReference, OnchainInvoice, OnchainQuote, PaymentReference, QuoteReference } from "@blockspaces/shared/models/lightning/Invoice";
import { IUser } from "@blockspaces/shared/models/users";
import { HttpException, HttpStatus } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { BitcoinInvoiceService } from "../../../bitcoin/services/BitcoinInvoiceService";
import { LightningInvoiceService } from "../../../lightning/invoices/services/LightningInvoiceService";
import { BitcoinInvoiceController } from "../BitcoinInvoiceController";

const start = 1658424252884;
const end = 1659029052884;
describe(BitcoinInvoiceController, () => {
  let invoiceController: BitcoinInvoiceController;
  let mockServices: {
    invoice: LightningInvoiceService,
    bitcoin: BitcoinInvoiceService,
    db: ConnectDbDataContext
  };
  type Both = {
    onchain: OnchainInvoice,
    offchain: InvoiceReference
  }
  let mockObjects: {
    iUser: IUser,
    objectsResponseReference: ObjectsResponseReference;
    both: Both
  };

  beforeEach(() => {
    mockServices = {
      invoice: createMock<LightningInvoiceService>(),
      bitcoin: createMock<BitcoinInvoiceService>(),
      db: createMock<ConnectDbDataContext>()
    };
    mockObjects = {
      iUser:createMock<IUser>({
        tenants: [`some-tenant-id`]
      }),
      objectsResponseReference: createMock<ObjectsResponseReference>({
        invoices: [createMock<InvoiceReference>({
          settleTimestamp: start
        }),createMock<InvoiceReference>({
          settleTimestamp: end
        }),createMock<InvoiceReference>({
          settleTimestamp: start - 100
        })],
        payments: [createMock<PaymentReference>({
          settleTimestamp: start
        }),createMock<PaymentReference>({
          settleTimestamp: end
        }),createMock<PaymentReference>({
          settleTimestamp: start - 100
        })]
      }),
      both: {
        offchain: createMock<InvoiceReference>(),
        onchain: createMock<OnchainInvoice>()
      }

    };
    mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockObjects.iUser);

    invoiceController = new BitcoinInvoiceController(mockServices.invoice, mockServices.bitcoin, mockServices.db);
  });
  describe(`refreshAllObjects`, () => {
    it("should refresh All Objects for the tenant Id passed into the body.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockResolvedValue(mockObjects.objectsResponseReference);
      const response = await invoiceController.refreshAllObjects(mockObjects.iUser,{tenantId: `some-tenant-id`});
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match Body TenantId.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(mockObjects.objectsResponseReference);
      try{
        await invoiceController.refreshAllObjects(mockObjects.iUser,{tenantId: `some-other-tenant-id`});
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe('Invalid tenantId');
      }
    }, 10000);
    it("should return NOT_FOUND when User is not found in Mongo.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(null);
      try{
        await invoiceController.refreshAllObjects(mockObjects.iUser,{tenantId: `some-tenant-id`});
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to refresh objects for some-tenant-id');
      }
    }, 10000);
  }); // END refreshAllObjects

  describe(`getPaidHistory`, () => {
    it("should return the Paid History for the given query objects.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockResolvedValue(mockObjects.objectsResponseReference);
      const response = await invoiceController.getPaidHistory(mockObjects.iUser,`some-tenant-id`,start,end);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match Body TenantId.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(mockObjects.objectsResponseReference);
      try{
        await invoiceController.getPaidHistory(mockObjects.iUser,`some-other-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe('Invalid tenantId');
      }
    }, 10000);
    it("should return NOT_FOUND when Invoices are found in Mongo.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(createMock<ObjectsResponseReference>({
        invoices: null
      }));
      try{
        await invoiceController.getPaidHistory(mockObjects.iUser,`some-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to get paid history for some-tenant-id');
      }
    }, 10000);
    it("should return TypeError when refresh ALL objects is NULL.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(null);
      try{
        await invoiceController.getPaidHistory(mockObjects.iUser,`some-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toBe('Cannot destructure property \'invoices\' of \'(intermediate value)\' as it is null.');
      }
    }, 10000);
  }); // END getPaidHistory
  
  describe(`getOutboundPayments`, () => {
    it("should return Outbound Payments for the given query objects.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockResolvedValue(mockObjects.objectsResponseReference);
      const response = await invoiceController.getOutboundPayments(mockObjects.iUser,`some-tenant-id`,start,end);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match TenantId.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(mockObjects.objectsResponseReference);
      try{
        await invoiceController.getOutboundPayments(mockObjects.iUser,`some-other-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe('Invalid tenantId');
      }
    }, 10000);
    it("should return NOT_FOUND when Payments are not found in Mongo.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(createMock<ObjectsResponseReference>({
        payments: null
      }));
      try{
        await invoiceController.getOutboundPayments(mockObjects.iUser,`some-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to find outbound payments for some-tenant-id');
      }
    }, 10000);
    it("should return TypeError when refresh ALL objects is NULL.", async () => {
      mockServices.invoice.refreshAllObjects = jest.fn().mockReturnValue(null);
      try{
        await invoiceController.getOutboundPayments(mockObjects.iUser,`some-tenant-id`,start,end);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toBe('Cannot destructure property \'payments\' of \'(intermediate value)\' as it is null.');
      }
    }, 10000);
  }); // END getOutboundPayments

  describe(`getChartData`, () => {
    it("should return Chart Data for the given required query objects.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      const response = await invoiceController.getChartData(mockObjects.iUser,`some-tenant-id`,NetworkDataInterval.DAILY);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<LightningChartData>());

    }, 10000);
    it("should return Chart Data for the given required query objects  FIAT true.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      const response = await invoiceController.getChartData(mockObjects.iUser,`some-tenant-id`,NetworkDataInterval.DAILY,true);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<LightningChartData>());
    }, 10000);
    it("should return Chart Data for the given required query objects FIAT true and timezone passed in.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      const response = await invoiceController.getChartData(mockObjects.iUser,`some-tenant-id`,NetworkDataInterval.DAILY,true,'America/New_York');
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<LightningChartData>());
    }, 10000);
    it("should return Chart Data for the given required query objects FIAT true and timezone and Start passed in.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      const response = await invoiceController.getChartData(
        mockObjects.iUser,
        `some-tenant-id`,
        NetworkDataInterval.DAILY,true,
        'America/New_York',
        start);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<LightningChartData>());
    }, 10000);
    it("should return Chart Data for the given required query objects FIAT true and timezone and Start and End passed in.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      const response = await invoiceController.getChartData(
        mockObjects.iUser,
        `some-tenant-id`,
        NetworkDataInterval.DAILY,true,
        'America/New_York',
        start,
        end);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<LightningChartData>());
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match TenantId.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(createMock<LightningChartData>());
      try{
        await invoiceController.getChartData(mockObjects.iUser,`some-other-tenant-id`,NetworkDataInterval.DAILY);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe('Invalid tenantId');
      }
    }, 10000);
    it("should return NOT_FOUND when Payments are not found in Mongo.", async () => {
      mockServices.invoice.getInvoiceChartData = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.getChartData(mockObjects.iUser,`some-tenant-id`,NetworkDataInterval.DAILY);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to retrieve Lightning chart data for some-tenant-id');
      }
    }, 10000);
  }); // END getChartData

  describe(`generateQuote`, () => {
    it("should return Generate a Quote Reference.", async () => {
      mockServices.invoice.generateQuote = jest.fn().mockResolvedValue(createMock<QuoteReference>());
      const response = await invoiceController.generateQuote(createMock<GenerateQuoteDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<QuoteReference>());
    }, 10000);
    it("should return NOT_FOUND when Payments are not found in Mongo.", async () => {
      mockServices.invoice.generateQuote = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.generateQuote(createMock<GenerateQuoteDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to generate a quote for: Invoice  and Tenant ');
      }
    }, 10000);
  }); // END generateQuote

  describe(`generateOnchainQuote`, () => {
    it("should return Generate a Quote Reference.", async () => {
      mockServices.bitcoin.generateQuote = jest.fn().mockResolvedValue(createMock<OnchainQuote>());
      const response = await invoiceController.generateOnchainQuote(createMock<GenerateQuoteDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<OnchainQuote>());
    }, 10000);
    it("should return NOT_FOUND when Payments are not found in Mongo.", async () => {
      mockServices.bitcoin.generateQuote = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.generateOnchainQuote(createMock<GenerateQuoteDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to generate a quote for: Invoice  and Tenant ');
      }
    }, 10000);
  }); // END generateQuote

  describe(`createAnonQuote`, () => {
    it("should return Generates quote WITHOUT an invoice.", async () => {
      mockServices.invoice.generateAnonQuote = jest.fn().mockResolvedValue(createMock<QuoteReference>());
      const response = await invoiceController.createAnonQuote(createMock<CreateAnonymousQuoteDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<QuoteReference>());
    }, 10000);
    it("should return NOT_FOUND when generating the Quote returns NULL.", async () => {
      mockServices.invoice.generateAnonQuote = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.createAnonQuote(createMock<CreateAnonymousQuoteDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to create Anon quote for ');
      }
    }, 10000);
  }); // END createAnonQuote

  describe(`createInvoice`, () => {
    it("should return Creates an \'Invoice\' entry in Mongo DB for a specified FIAT amount.", async () => {
      mockServices.invoice.createInvoice = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
      const response = await invoiceController.createInvoice(createMock<CreateInvoiceDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<InvoiceReference>());
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.invoice.createInvoice = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.createInvoice(createMock<CreateInvoiceDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to create invoice for ');
      }
    }, 10000);
  }); // END createInvoice

  describe(`createOnchainInvoice`, () => {
    it("should return Creates an \'OnchainInvoice\' entry in Mongo DB for a specified FIAT amount.", async () => {
      mockServices.bitcoin.createInvoice = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      const response = await invoiceController.createOnchainInvoice(createMock<CreateInvoiceDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.bitcoin.createInvoice = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.createOnchainInvoice(createMock<CreateInvoiceDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to create invoice for ');
      }
    }, 10000);
  }); // END createInvoice

  describe(`createCanonicalInvoice`, () => {
    it("should return Creates an \'Invoice\' entry in Mongo DB for a specified FIAT amount.", async () => {

      mockServices.invoice.createCanonicalInvoice = jest.fn().mockResolvedValue(createMock<Both>());
      const response = await invoiceController.createCanonicalInvoice(createMock<CreateInvoiceDto>());
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(mockObjects.both);
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.invoice.createCanonicalInvoice = jest.fn().mockResolvedValue(createMock<Both>());
      try{
        await invoiceController.createCanonicalInvoice(createMock<CreateInvoiceDto>());
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to create invoice for ');
      }
    }, 10000);
  }); // END createInvoice

  describe(`getInvoiceStatus`, () => {
    it("should return Creates an \'Invoice\' entry in Mongo DB for a specified FIAT amount.", async () => {
      mockServices.invoice.getInvoiceStatus = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
      const response = await invoiceController.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<InvoiceReference>());
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.invoice.getInvoiceStatus = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.getInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to find status for invoice: some-invoice-id');
      }
    }, 10000);
  }); // END getInvoiceStatus

  describe(`getOnchainInvoiceStatus`, () => {
    it("should return Creates an \'OnchainInvoice\' entry in Mongo DB for a specified FIAT amount.", async () => {
      mockServices.bitcoin.getInvoiceStatus = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      const response = await invoiceController.getOnchainInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.bitcoin.getInvoiceStatus = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.getOnchainInvoiceStatus(`some-invoice-id`, `some-tenant-id`);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to find status for invoice: some-invoice-id');
      }
    }, 10000);
  }); // END getInvoiceStatus
  describe(`getCanonicalInvoiceStatus`, () => {
    it("should return Creates an \'Invoice\' entry in Mongo DB for a specified FIAT amount.", async () => {
      mockServices.invoice.getCanonicalInvoiceStatus = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
      const response = await invoiceController.getCanonicalInvoiceStatus(`some-invoice-id`, `some-invoice-id`, `some-tenant-id`);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<InvoiceReference>());
    }, 10000);
    it("should return NOT_FOUND when creation of an Invoice returns NULL.", async () => {
      mockServices.invoice.getCanonicalInvoiceStatus = jest.fn().mockResolvedValue(null);
      try{
        const response = await invoiceController.getCanonicalInvoiceStatus(`some-invoice-id`, `some-invoice-id`, `some-tenant-id`);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Unable to find status for onchain invoice: some-invoice-id, and offchain invoice some-invoice-id');
      }
    }, 10000);
  }); // END getInvoiceStatus

  describe(`cancelInvoice`, () => {
    it(`should return update invoice in mongo to \'CANCELLED\'`, async () => {
      mockServices.invoice.cancelInvoice = jest.fn().mockResolvedValue(createMock<InvoiceReference>());
      const response = await invoiceController.cancelInvoice(mockObjects.iUser,`some-invoice-id`, `some-tenant-id`);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<InvoiceReference>());
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match Body TenantId.", async () => {
      mockServices.invoice.cancelInvoice = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.cancelInvoice(mockObjects.iUser, `some-invoice-id`, `some-other-tenant-id`);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe("Invalid tenantId");
      }
    }, 10000);
  }); // END cancelInvoice

  describe(`cancelOnchainInvoice`, () => {
    it(`should return update invoice in mongo to \'CANCELLED\'`, async () => {
      mockServices.bitcoin.cancelInvoice = jest.fn().mockResolvedValue(createMock<OnchainInvoice>());
      const response = await invoiceController.cancelOnchainInvoice(mockObjects.iUser,`some-invoice-id`, `some-tenant-id`);
      expect(response).toBeInstanceOf(ApiResult);
      expect(response.isSuccess).toBeTruthy();
      expect(response.data).toMatchObject(createMock<OnchainInvoice>());
    }, 10000);
    it("should return FORBIDDEN when IUser tenantId does not match Body TenantId.", async () => {
      mockServices.bitcoin.cancelInvoice = jest.fn().mockResolvedValue(null);
      try{
        await invoiceController.cancelInvoice(mockObjects.iUser, `some-invoice-id`, `some-other-tenant-id`);
      } catch (error) {
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe("Invalid tenantId");
      }
    }, 10000);
  }); // END cancelInvoice
});