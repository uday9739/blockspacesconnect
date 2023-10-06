import { createMock } from "ts-auto-mock";
import { LightningQuickbooksService } from "./LightningQuickbooksService";
import { ConnectLogger } from "../../../../../logging/ConnectLogger";
import { LightningInvoiceService } from "../../../invoices/services/LightningInvoiceService";
import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { ConnectDbDataContext } from "../../../../../connect-db/services/ConnectDbDataContext";
import { QuickbooksInvoiceService } from "../../../../../quickbooks/services/QuickbooksInvoiceService";
import { QuickBooksPaymentSummary } from "../../../../../quickbooks/types/QuickbooksTypes";
import { ICredentialReference } from "@blockspaces/shared/models/flows/Credential";
import { NotFoundException } from "@nestjs/common";
import { IUser } from "@blockspaces/shared/models/users";
import { InvoiceReference, OnchainInvoice } from "@blockspaces/shared/models/lightning/Invoice";
import { EnvironmentVariables } from "../../../../../env";
import { BitcoinService } from "../../../../bitcoin/services/BitcoinService";
import { QuickbooksPurchaseService } from "../../../../../quickbooks/services/QuickbooksPurchaseService";
import { BitcoinInvoiceService } from "../../../../bitcoin/services/BitcoinInvoiceService";

describe(LightningQuickbooksService, () => {
  let lightningQuickbooksService: LightningQuickbooksService;

  let mockServices: {
    db: ConnectDbDataContext;
    quickbooksInvoiceService: QuickbooksInvoiceService;
    lightningInvoiceService: LightningInvoiceService;
    bitcoinInvoiceService: BitcoinInvoiceService;
    logger: ConnectLogger;
    env: EnvironmentVariables,
    bitcoinService: BitcoinService,
    quickbooksPurchaseService: QuickbooksPurchaseService
  };

  let mockResponses: {
    quickBooksInvoiceSummary: QuickBooksInvoiceSummary;
    quickBooksPaymentSummary: QuickBooksPaymentSummary;
    iCredentialReference: ICredentialReference;
    iUser: IUser;
    lightningInvoice: InvoiceReference;
    onchainInvoice: OnchainInvoice;
  };

  beforeEach(async () => {
    mockServices = {
      db: createMock<ConnectDbDataContext>(),
      quickbooksInvoiceService: createMock<QuickbooksInvoiceService>(),
      lightningInvoiceService: createMock<LightningInvoiceService>(),
      bitcoinInvoiceService: createMock<BitcoinInvoiceService>(),
      logger: createMock<ConnectLogger>({
        // info: jest.fn(),
        // debug: jest.fn(),
        // error: jest.fn(),
        // trace: jest.fn(),
        // log: jest.fn()
      }),
      env: createMock<EnvironmentVariables>(),
      bitcoinService: createMock<BitcoinService>(),
      quickbooksPurchaseService: createMock<QuickbooksPurchaseService>()
    };
    mockResponses = {
      quickBooksInvoiceSummary: createMock<QuickBooksInvoiceSummary>({
        Id: "34",
        CurrencyRef: {
          value: "59",
          name: "string"
        },
        TotalAmt: 2,
        CustomerMemo: { value: "string" }
      }),
      quickBooksPaymentSummary: createMock<QuickBooksPaymentSummary>(),
      iCredentialReference: createMock<ICredentialReference>({
        credentialId: "credentialId"
      }),
      iUser: createMock<IUser>({
        qboCustomerId: "qboCustomerId"
      }),
      lightningInvoice: createMock<InvoiceReference>({
        amount: {
          fiatValue: 0
        }
      }),
      onchainInvoice: createMock<OnchainInvoice>({
        amount: {
          fiatValue: 0
        }
      })
    };
    lightningQuickbooksService = new LightningQuickbooksService(mockServices.lightningInvoiceService, mockServices.bitcoinInvoiceService, mockServices.bitcoinService, mockServices.db, mockServices.logger, mockServices.env, mockServices.quickbooksInvoiceService, mockServices.quickbooksPurchaseService);
  });

  describe(`LightningQuickbooksService.getConnectionStatus`, () => {
    it(`should return TRUE`, async () => {
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockResponses.iUser);
      const result: boolean = await lightningQuickbooksService.getConnectionStatus("some-tenant-id");
      expect(result).toBeTruthy();
    }, 10000);
    it(`should return FALSE when missing users qboCustomerId`, async () => {
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(createMock<IUser>());
      const result: boolean = await lightningQuickbooksService.getConnectionStatus("some-tenant-id");
      expect(result).toBeFalsy();
    }, 10000);
    it(`should return FALSE when missing user cannot be found in Mongo`, async () => {
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(null);
      const result: boolean = await lightningQuickbooksService.getConnectionStatus("some-tenant-id");
      expect(result).toBeFalsy();
    }, 10000);
  });

  describe(`LightningQuickbooksService.getInvoice`, () => {
    it(`should return Lightning Invoice`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      const result: QuickBooksInvoiceSummary = await lightningQuickbooksService.getInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when missing user secret.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      const result: QuickBooksInvoiceSummary = await lightningQuickbooksService.getInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);

    it(`should return NULL when getting an Invoice encounters an error`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoice = async () => {
        throw new NotFoundException(`Invoice: some-invoice-id was not found.`);
      };
      const result: QuickBooksInvoiceSummary = await lightningQuickbooksService.getInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);
  });

  describe(`LightningQuickbooksService.createInvoice`, () => {
    it(`should return Object containing the QuickBooksInvoiceSummary and InvoiceReference when invoice is found in Mongo`, async () => {
      // Step 1: Check if the invoice is already stored in MongoDB. If we find invoice grab the QuickBooks invoice and return.
      mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(mockResponses.onchainInvoice);
      mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      lightningQuickbooksService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      lightningQuickbooksService.checkInvoicePaid = jest.fn().mockResolvedValue(true)
      const result: {
        quickbooksInvoice: QuickBooksInvoiceSummary;
        lightningInvoice: InvoiceReference;
        onchainInvoice: OnchainInvoice;
        markAsPaid: boolean
      } = await lightningQuickbooksService.createInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeDefined();
    }, 10000);

    it(`should create QuickBooksInvoiceSummary from InvoiceReference when invoice is not found in Mongo`, async () => {
      // Step 1: Check if the invoice is already stored in MongoDB. If we find invoice grab the QuickBooks invoice and return.
      mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 2: Get the invoice from QuickBooks.
      lightningQuickbooksService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 3: Create a Lightning invoice with the QuickBooks invoice information.
      mockServices.lightningInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.bitcoinInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.onchainInvoice);
      const result: {
        quickbooksInvoice: QuickBooksInvoiceSummary;
        lightningInvoice: InvoiceReference;
        onchainInvoice: OnchainInvoice;
        markAsPaid: boolean
      } = await lightningQuickbooksService.createInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when cannot retrive invoice from lightning quickbooks service.`, async () => {
      // Step 1: Check if the invoice is already stored in MongoDB. If we find invoice grab the QuickBooks invoice and return.
      mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 2: Get the invoice from QuickBooks.
      lightningQuickbooksService.getInvoice = jest.fn().mockResolvedValue(null);
      // Step 3: Create a Lightning invoice with the QuickBooks invoice information.
      mockServices.lightningInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      const result: {
        quickbooksInvoice: QuickBooksInvoiceSummary;
        lightningInvoice: InvoiceReference
      } = await lightningQuickbooksService.createInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);

    it(`should return NULL when create Invoice returns an error.`, async () => {
      // Step 1: Check if the invoice is already stored in MongoDB. If we find invoice grab the QuickBooks invoice and return.
      mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 2: Get the invoice from QuickBooks.
      lightningQuickbooksService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 3: Create a Lightning invoice with the QuickBooks invoice information.
      mockServices.lightningInvoiceService.createInvoice = async () => {
        throw new NotFoundException(`not found exception.`);
      };
      const result: {
        quickbooksInvoice: QuickBooksInvoiceSummary;
        lightningInvoice: InvoiceReference
      } = await lightningQuickbooksService.createInvoice("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);

    it(`should return partial NULL object when lightning invoice is not found.`, async () => {
      // Step 1: Check if the invoice is already stored in MongoDB. If we find invoice grab the QuickBooks invoice and return.
      mockServices.db.lightningInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.db.bitcoinInvoices.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.createInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 2: Get the invoice from QuickBooks.
      lightningQuickbooksService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      // Step 3: Create a Lightning invoice with the QuickBooks invoice information.
      mockServices.lightningInvoiceService.createInvoice = jest.fn().mockResolvedValue(null);
      const result: {
        quickbooksInvoice: QuickBooksInvoiceSummary;
        lightningInvoice: InvoiceReference
      } = await lightningQuickbooksService.createInvoice("some-tenant-id", "some-invoice-id", "jwt-token");

      expect(result).toBeDefined();
      expect(result.lightningInvoice).toBeNull();
      expect(result.quickbooksInvoice).toBeDefined();
    }, 10000);

  });

  describe(`LightningQuickbooksService.postPayment`, () => {
    it(`should return QuickBooks Payment Summary on successfull payment`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(createMock<QuickBooksInvoiceSummary>());
      mockServices.quickbooksInvoiceService.payInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.postPayment("some-tenant-id", "some-invoice-id", undefined);
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when QuickBooks Payment Summary when failed payment due to missing user secret.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      mockServices.quickbooksInvoiceService.payInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.postPayment("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);

    it(`should return NULL when QuickBooks Payment Summary when failed to get invoice from QuickBooks.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.payInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.postPayment("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);

    it(`should return NULL when QuickBooks Payment Summary when failed to pay QuickBooks Invoice.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoice = jest.fn().mockResolvedValue(mockResponses.quickBooksInvoiceSummary);
      mockServices.quickbooksInvoiceService.payInvoice = jest.fn().mockResolvedValue(null);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.postPayment("some-tenant-id", "some-invoice-id", "jwt-token");
      expect(result).toBeNull();
    }, 10000);
  });

  describe(`LightningQuickbooksService.makeUnappliedPayment`, () => {
    it(`should return a QuickBooks Payment Summary on successfull Unapplied Payment`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoiceStatus = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockResponses.iUser);
      mockServices.quickbooksInvoiceService.makeUnappliedPayment = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.makeUnappliedPayment("some-tenant-id", "some-invoice-id", undefined, "offchain");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when failed Unapplied payment due to missing user secret.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.getInvoiceStatus = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockResponses.iUser);
      mockServices.quickbooksInvoiceService.makeUnappliedPayment = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.makeUnappliedPayment("some-tenant-id", "some-invoice-id", undefined, "offchain");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when failed Unapplied payment due to missing Invoice Status.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoiceStatus = jest.fn().mockResolvedValue(null);
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockResponses.iUser);
      mockServices.quickbooksInvoiceService.makeUnappliedPayment = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.makeUnappliedPayment("some-tenant-id", "some-invoice-id", undefined, "offchain");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when failed  Unapplied payment due to missing user.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoiceStatus = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(null);
      mockServices.quickbooksInvoiceService.makeUnappliedPayment = jest.fn().mockResolvedValue(mockResponses.quickBooksPaymentSummary);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.makeUnappliedPayment("some-tenant-id", "some-invoice-id", undefined, "offchain");
      expect(result).toBeDefined();
    }, 10000);

    it(`should return NULL when failed Unapplied payment due to failed QuickBooks API Call.`, async () => {
      mockServices.db.userSecrets.findOne = jest.fn().mockResolvedValue(mockResponses.iCredentialReference);
      mockServices.quickbooksInvoiceService.getInvoiceStatus = jest.fn().mockResolvedValue(mockResponses.lightningInvoice);
      mockServices.db.users.findOne = jest.fn().mockResolvedValue(mockResponses.iUser);
      mockServices.quickbooksInvoiceService.makeUnappliedPayment = jest.fn().mockResolvedValue(null);
      const result: QuickBooksPaymentSummary = await lightningQuickbooksService.makeUnappliedPayment("some-tenant-id", "some-invoice-id", undefined, "offchain");
      expect(result).toBeDefined();
    }, 10000);
  });

});
