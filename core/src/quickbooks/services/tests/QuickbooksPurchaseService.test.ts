import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { createMock } from "ts-auto-mock";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { QuickbooksClient } from "../../clients/QuickbooksClient";
import {
  QuickbooksCreateInvoice,
  QuickbooksCreatePurchase,
  QuickbooksInvoice,
  QuickbooksInvoiceStatus,
  QuickbooksOAuthClientToken,
  QuickBooksPayment
} from "../../types/QuickbooksTypes";
import { QuickbooksPurchaseService } from "../QuickbooksPurchaseService";
import { SecretService } from "../../../secrets/services/SecretService";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";

describe("Get data from QuickbooksService.", () => {
  let _quickbooksPurchaseService: QuickbooksPurchaseService;

  let mockServices: {
    httpService: HttpService;
    qbClient: QuickbooksClient;
    secretService: SecretService;
    db: ConnectDbDataContext;
  };
  let mockRequests: {
    purchaseData: QuickbooksCreatePurchase;
    customerId: String;
    tenantId: String;
    accessToken: String;
    quickBooksPayment: QuickBooksPayment;
  };
  let mockResponses: {
    createInvoice: QuickbooksInvoice;
    getInvoices: QuickbooksInvoice[];
    getInvoiceStatus: QuickbooksInvoiceStatus;
    oAuthClientToken: QuickbooksOAuthClientToken;
  };

  beforeAll(async () => {

    mockRequests = {
      purchaseData: createMock<QuickbooksCreatePurchase>(),
      customerId: createMock<String>(),
      tenantId: createMock<String>(),
      accessToken: createMock<String>(),
      quickBooksPayment: createMock<QuickBooksPayment>()
    };
    mockResponses = {
      createInvoice: createMock<QuickbooksInvoice>(),
      getInvoices: createMock<QuickbooksInvoice[]>(),
      getInvoiceStatus: createMock<QuickbooksInvoiceStatus>(),
      oAuthClientToken: createMock<QuickbooksOAuthClientToken>(),
    };
    mockServices = {
      httpService: createMock<HttpService>(),
      qbClient: createMock<QuickbooksClient>({
        getOAuthClientToken(): Promise<QuickbooksOAuthClientToken> {
          return Promise.resolve(mockResponses.oAuthClientToken);
        },
      }),
      secretService: createMock<SecretService>(),
      db: createMock<ConnectDbDataContext>()
    };
    _quickbooksPurchaseService = new QuickbooksPurchaseService(mockServices.httpService, mockServices.qbClient, mockServices.secretService, mockServices.db);
  });

  it(`${QuickbooksPurchaseService.name} should be defined`, () => {
    expect(_quickbooksPurchaseService).toBeDefined();
  });

  it(`${QuickbooksPurchaseService.name} should create a Purchase`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          "Purchase": {
            "AccountRef": {
              "value": "91",
              "name": "Bitcoin Invoicing & Payments"
            },
            "PaymentType": "Cash",
            "TotalAmt": 1,
            "PurchaseEx": {
              "any": [
                {
                  "name": "{http://schema.intuit.com/finance/v3}NameValue",
                  "declaredType": "com.intuit.schema.finance.v3.NameValue",
                  "scope": "javax.xml.bind.JAXBElement$GlobalScope",
                  "value": {
                    "Name": "TxnType",
                    "Value": "54"
                  },
                  "nil": false,
                  "globalScope": true,
                  "typeSubstituted": false
                }
              ]
            },
            "domain": "QBO",
            "sparse": false,
            "Id": "163",
            "SyncToken": "0",
            "MetaData": {
              "CreateTime": "2022-11-23T19:49:41-08:00",
              "LastUpdatedTime": "2022-11-23T19:49:41-08:00"
            },
            "CustomField": [],
            "TxnDate": "2022-11-23",
            "CurrencyRef": {
              "value": "USD",
              "name": "United States Dollar"
            },
            "Line": [
              {
                "Id": "1",
                "Amount": 1,
                "DetailType": "AccountBasedExpenseLineDetail",
                "AccountBasedExpenseLineDetail": {
                  "AccountRef": {
                    "value": "10",
                    "name": "Dues & Subscriptions"
                  },
                  "BillableStatus": "NotBillable",
                  "TaxCodeRef": {
                    "value": "NON"
                  }
                }
              }
            ]
          },
          "time": "2022-11-23T19:49:40.778-08:00"
        }
      };
    const response = await _quickbooksPurchaseService.createPurchase(mockRequests.purchaseData, mockRequests.customerId.toString(), mockRequests.tenantId.toString(), mockRequests.accessToken.toString());
    expect(response.Purchase.AccountRef.value).toBe("91");
  }, 10000);

});
