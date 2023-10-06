import { forwardRef, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { returnErrorStatus } from "../../../../../exceptions/utils";
import { DEFAULT_LOGGER_TOKEN } from "../../../../../logging/constants";
import { ConnectLogger } from "../../../../../logging/ConnectLogger";
import { LightningInvoiceService } from "../../../invoices/services/LightningInvoiceService";
import { ConnectDbDataContext } from "../../../../../connect-db/services/ConnectDbDataContext";
import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { QuickbooksInvoiceService } from "../../../../../quickbooks/services/QuickbooksInvoiceService";
import { QuickbooksCreatePurchase, QuickBooksPayment, QuickBooksPaymentSummary, QuickbooksPurchase } from "../../../../../quickbooks/types/QuickbooksTypes";
import { InvoiceReference, PaymentReference, TypeOfInvoice, PaymentSource, PaymentStatus, OnchainInvoice } from "@blockspaces/shared/models/lightning/Invoice";
import { Integration, IntegrationTransactionReference, IntegrationTransactionType } from "@blockspaces/shared/models/lightning/Integration";
import { EnvironmentVariables, ENV_TOKEN } from "../../../../../env";
import { QuickbooksPurchaseService } from "../../../../../quickbooks/services/QuickbooksPurchaseService";
import { DateTime } from "luxon"
import { BitcoinService } from "../../../../bitcoin/services/BitcoinService";
import { BitcoinInvoiceService } from "../../../../bitcoin/services/BitcoinInvoiceService";

/**
 * * QuickBooks Service
 * Gets invoices, creates mongo invoices for quotes, and posts invoices as paid.
 * TODO: Add token refresh with Nest guard
 */
@Injectable()
export class LightningQuickbooksService {
  constructor(
    private readonly lightningInvoice: LightningInvoiceService,
    private readonly bitcoinInvoice: BitcoinInvoiceService,
    private readonly bitcoinService: BitcoinService,
    @Inject(forwardRef(() => ConnectDbDataContext))
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly quickbooksInvoiceService: QuickbooksInvoiceService,
    private readonly quickbooksPurchaseService: QuickbooksPurchaseService,
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Checks if the user document has a `qboCustomerId`. If we do, they have connected to quickbooks.
   *
   * @param tenantId for the logged in User
   * @returns boolean flag
   */
  getConnectionStatus = async (tenantId: string): Promise<boolean> => {
    const user = await this.db.users.findOne({ tenants: tenantId });
    if (!user || !user.qboCustomerId) {
      this.logger.warn(`Could not find QuickBooks Customer Id for tenant ${tenantId}`);
      return false;
    }
    return true;
  };

  /**
   * {@link getInvoice} gets a requested Quickbooks Invoice based on a provided Invoice Id
   *
   * @param  {string} tenantId - the Tenant ID
   * @param  {string} invoiceId - the Invoice ID
   * @returns Promise of an {@link InvoiceSummary}
   */
  getInvoice = async (tenantId: string, invoiceId: string, accessToken?: string): Promise<QuickBooksInvoiceSummary> => {
    try {
      // Get the node data for a tenant id to grab the `quickbooksSecretId`
      const userSecret = await this.db.userSecrets.findOne({ tenantId: tenantId, label: "QuickBooks" });
      if (!userSecret) {
        return null;
      }
      const response: QuickBooksInvoiceSummary = await this.quickbooksInvoiceService.getInvoice(invoiceId, userSecret.credentialId, tenantId, accessToken);
      return response;
    } catch (e) {
      this.logger.error("No Invoice was Found.", e, { data: { tenantId: tenantId, invoiceId: invoiceId } });
      return null;
    }
  };

  /**
   * Check if the invoice has <= $0 balance.
   * @param invoice QuickBooks invoice
   * @returns boolean
   */
  checkInvoicePaid = (invoice: QuickBooksInvoiceSummary): boolean => {
    if (invoice.Balance <= 0) return true
    return false
  }

  /**
   *
   * @param tenantId
   * @param invoiceId
   * @param accessToken
   * @returns
   */
  createInvoice = async (tenantId: string, invoiceId: string, accessToken?: string): Promise<{ quickbooksInvoice: QuickBooksInvoiceSummary; lightningInvoice: InvoiceReference, onchainInvoice: OnchainInvoice, markAsPaid: boolean }> => {
    try {
      // Step 1: Get the invoice from QuickBooks.
      const quickbooksInvoice: QuickBooksInvoiceSummary = await this.getInvoice(tenantId, invoiceId, accessToken);
      if (!quickbooksInvoice) {
        returnErrorStatus(HttpStatus.NOT_FOUND, "Could not find QuickBooks invoice.", { log: false });
      }

      // Check if there is any balance on the invoice.
      const markAsPaid = this.checkInvoicePaid(quickbooksInvoice)

      // Step 2: Check if the invoice is already stored in MongoDB.
      const lightningInvoiceExists: InvoiceReference = await this.db.lightningInvoices.findOne({ "integrations.integrationId": quickbooksInvoice.DocNumber });
      const onchainInvoiceExists: OnchainInvoice = await this.db.bitcoinInvoices.findOne({ "erpMetadata.value": quickbooksInvoice.DocNumber })

      // If we find invoice grab the QuickBooks invoice and return.
      if (lightningInvoiceExists && onchainInvoiceExists ) {
        const invoice = await this.getInvoice(tenantId, invoiceId, accessToken);
        const returnData = {
          quickbooksInvoice: invoice,
          lightningInvoice: lightningInvoiceExists,
          onchainInvoice: onchainInvoiceExists,
          markAsPaid: markAsPaid
        };
        return returnData;
      }

      const integrationUrl = this.env.quickbooks.environment === 'sandbox' ? `https://app.sandbox.qbo.intuit.com/app/invoice?txnId=${quickbooksInvoice.Id}` : `https://app.sandbox.qbo.intuit.com/app/invoice?txnId=${quickbooksInvoice.Id}`
      const integrationObject: IntegrationTransactionReference = {
        integrationId: invoiceId,
        integration: Integration.QuickBooks, // In the future get the installed integration from mongo
        transactionType: IntegrationTransactionType.Invoice,
        url: integrationUrl
      }

      // Step 3: Create a Lightning invoice with the QuickBooks invoice information.
      const { CurrencyRef, TotalAmt, CustomerMemo } = quickbooksInvoice;
      const lightningInvoice = await this.lightningInvoice.createInvoice(String(CurrencyRef.value).toLowerCase(), TotalAmt, CustomerMemo?.value || `QuickBooks invoice ${invoiceId}. Customer ${quickbooksInvoice.CustomerRef.name}`, tenantId, integrationObject);
      const onchainInvoice = await this.bitcoinInvoice.createInvoice(String(CurrencyRef.value).toLowerCase(), TotalAmt, CustomerMemo?.value || `QuickBooks invoice ${invoiceId}. Customer ${quickbooksInvoice.CustomerRef.name}`, tenantId, [{dataType: "erpInvoiceId", domain: "QBO", value: invoiceId}])
      const invoiceData = {
        quickbooksInvoice: quickbooksInvoice,
        lightningInvoice: lightningInvoice,
        onchainInvoice: onchainInvoice,
        markAsPaid: markAsPaid
      };
      return invoiceData;
    } catch (e) {
      this.logger.error(e.message, e, { data: { tenantId: tenantId, invoiceId: invoiceId } });
      return null;
    }
  };

  /**
   * {@link postPayment} posts a payment to Quickbooks for a tenant's requested Quickbooks Invoice ID
   *
   * @param  {string} tenantId - the CoreUser.tenantId
   * @param  {string} invoiceId - the  Quickbooks Invoice ID
   * @param  {string} accessToken - the CoreUser.accessToken
   */
  postPayment = async (tenantId: string, invoiceId: string, accessToken: string): Promise<QuickBooksPaymentSummary> => {
    try {
      // Step 2: Grab the QuickBooks invoice by `DocNumber` to get all invoice information.
      const userSecret = await this.db.userSecrets.findOne({ tenantId: tenantId, label: "QuickBooks" });
      const invoice: QuickBooksInvoiceSummary = await this.quickbooksInvoiceService.getInvoice(invoiceId, userSecret.credentialId, tenantId, accessToken);
      // Step 3: Build the request data for querying the invoice for payment.
      const data: QuickBooksPayment = {
        CustomerRef: { value: Number(invoice.CustomerRef.value) },
        TotalAmt: invoice.TotalAmt,
        Line: [
          {
            Amount: invoice.TotalAmt,
            LinkedTxn: [
              {
                TxnId: Number(invoice.Id),
                TxnType: "Invoice"
              }
            ]
          }
        ]
      };
      // Step 4: Make the invoice payment request.
      const payment: QuickBooksPaymentSummary = await this.quickbooksInvoiceService.payInvoice(data, userSecret.credentialId, tenantId, accessToken);
      return payment;
    } catch (e) {
      this.logger.error("Quickbooks Post Payment Failed.", e, { data: { tenantId: tenantId, invoiceId: invoiceId } });
      return null;
    }

  };

  /**
   *
   * {@link postPayment} posts an unapplied payment to Quickbooks for a tenant's requested PoS sale.
   *
   * @param  {string} tenantId - the Tenant ID
   * @param  {string} invoiceId - the MongoDB Lightning Invoice ID
   * @param  {number} accessToken - CocreUser accessToken
   */
  makeUnappliedPayment = async (tenantId: string, invoiceId: string, accessToken: string, type: TypeOfInvoice): Promise<QuickBooksPaymentSummary> => {
    try {
      // Step 1: Get the secret from Vault.
      const userSecret = await this.db.userSecrets.findOne({ tenantId: tenantId, label: "QuickBooks" });
      // Step 2: Get the Lightning invoice information.
      let invoice: OnchainInvoice | InvoiceReference
      if (type === "offchain") {
        invoice = await this.lightningInvoice.getInvoiceStatus(invoiceId, tenantId)
      } else {
        invoice = await this.bitcoinInvoice.getInvoiceStatus(invoiceId, tenantId)
      }
      // Step 3: Get user QB customer id
      const user = await this.db.users.findOne({ tenants: tenantId });
      const data = {
        Line: [],
        Description: "Bitcoin Invoicing & Payments",
        CustomerRef: { value: user.qboCustomerId },
        TotalAmt: invoice.amount.fiatValue, DepositToAccountRef: { value: user.qboAccountId }
      };

      // Step 3: Make the unapplied payment in QuickBooks.
      const payment: QuickBooksPaymentSummary = await this.quickbooksInvoiceService.makeUnappliedPayment(data, userSecret.credentialId, tenantId, accessToken);
      const salesReceiptUrl = this.env.quickbooks.environment === "sandbox" ? `https://app.sandbox.qbo.intuit.com/app/salesreceipt?txnId=${payment.Id}` : `https://app.qbo.intuit.com/app/salesreceipt?txnId=${payment.Id}`
      await this.db.lightningInvoices.findOneAndUpdate({ invoiceId: invoiceId }, { integrations: { integrationId: payment.Id, integration: Integration.QuickBooks, transactionType: IntegrationTransactionType.SalesReceipt, url: salesReceiptUrl } }).catch(_ => {
        this.logger.warn('Failed to update invoice doc');
      });
      return payment;
    } catch (e) {
      this.logger.error("Quickbooks unapplied Payment Failed.", e, { data: { tenantId: tenantId, invoiceId: invoiceId } });
      return null;
    }
  };

  createPurchase = async (data: QuickbooksCreatePurchase, payment: any, userId: string, tenantId: string, accessToken: string) => {
    const purchase = await this.quickbooksPurchaseService.createPurchase(data, userId, tenantId, accessToken);
    const paymentHash = payment.payment_hash
    const channelId = payment.htlcs[0].route.hops[0].chan_id;
    const settleTime = DateTime.now().toMillis();
    const purchaseUrl =
      this.env.quickbooks.environment === "sandbox"
        ? `https://app.sandbox.qbo.intuit.com/app/expense?txnId=${purchase.Purchase.Id}`
        : `https://app.qbo.intuit.com/app/expense?txnId=${purchase.Purchase.Id}`;
    const amount = await this.bitcoinService.getBtcConversion(settleTime, payment.value_sat + payment.fee);
    const paymentObj: PaymentReference = {
      paymentHash: paymentHash,
      tenantId: tenantId,
      channelId: channelId,
      settleTimestamp: settleTime,
      status: PaymentStatus.SUCCEEDED,
      amount: amount,
      integrations: [{ integrationId: purchase.Purchase.Id, integration: Integration.QuickBooks, transactionType: IntegrationTransactionType.Purchase, url: purchaseUrl }]
    };
    await this.db.lightningPayments.create(paymentObj).catch(_ => {
      this.logger.warn('Failed to update invoice doc');
    });

    return purchase;
  };
}
