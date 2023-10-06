import { QuickBooksInvoiceSummary } from "@blockspaces/shared/models/quickbooks";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { createMock } from "ts-auto-mock";
import { HttpService, HttpResponse } from "@blockspaces/shared/services/http";
import { QuickbooksClient } from "../../clients/QuickbooksClient";
import {
  QuickbooksCreateInvoice,
  QuickbooksInvoice,
  QuickbooksInvoiceStatus,
  QuickbooksOAuthClientToken,
  QuickBooksPayment
} from "../../types/QuickbooksTypes";
import { QuickbooksInvoiceService } from "../QuickbooksInvoiceService";

describe("Get data from QuickbooksService.", () => {
  let _quickbooksInvoiceService: QuickbooksInvoiceService;

  let mockServices: {
    httpService: HttpService;
    qbClient: QuickbooksClient;
  };
  let mockRequests: {
    invoiceData: QuickbooksCreateInvoice;
    customerId: String;
    invoiceId: String;
    quickBooksPayment: QuickBooksPayment;
  };
  let mockResponses: {
    createInvoice: QuickbooksInvoice;
    getInvoices: QuickBooksInvoiceSummary[];
    getInvoiceStatus: QuickbooksInvoiceStatus;
    oAuthClientToken: QuickbooksOAuthClientToken;
  };

  beforeAll(async () => {

    mockRequests = {
      invoiceData: createMock<QuickbooksCreateInvoice>(),
      customerId: createMock<String>(),
      invoiceId: createMock<String>(),
      quickBooksPayment: createMock<QuickBooksPayment>()
    };
    mockResponses = {
      createInvoice: createMock<QuickbooksInvoice>(),
      getInvoices: createMock<QuickBooksInvoiceSummary[]>([createMock<QuickBooksInvoiceSummary>()]),
      getInvoiceStatus: createMock<QuickbooksInvoiceStatus>(),
      oAuthClientToken: createMock<QuickbooksOAuthClientToken>(),
    };
    mockServices = {
      httpService: createMock<HttpService>(),
      qbClient: createMock<QuickbooksClient>({
        getOAuthClientToken(): Promise<QuickbooksOAuthClientToken> {
          return Promise.resolve(mockResponses.oAuthClientToken);
        },
      })
    };
    _quickbooksInvoiceService = new QuickbooksInvoiceService(mockServices.httpService, mockServices.qbClient);
  });

  it(`${QuickbooksInvoiceService.name} should be defined`, () => {
    expect(_quickbooksInvoiceService).toBeDefined();
  });

  it(`${QuickbooksInvoiceService.name} should get Invoice Status`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          QueryResponse: {
            Invoice: mockResponses.getInvoiceStatus
          }
        }
      };
    const response = await _quickbooksInvoiceService.getInvoiceStatus(mockRequests.invoiceId.toString());
    expect(response).toBeDefined();
  }, 10000);

  it(`${QuickbooksInvoiceService.name} should get Invoice`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          QueryResponse: {
            Invoice: mockResponses.getInvoices
          }
        }
      };
    const response: QuickBooksInvoiceSummary = await _quickbooksInvoiceService.getInvoice(mockRequests.invoiceId.toString());
    expect(response).toBeDefined();
  }, 10000);

  it(`${QuickbooksInvoiceService.name} should get Customers Invoices`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          QueryResponse: {
            Invoice: mockResponses.getInvoices
          },
          response: {
            Fault: null
          }
        }
      };
    const response: QuickBooksInvoiceSummary[] = await _quickbooksInvoiceService.getCustomersInvoices(mockRequests.customerId.toString());
    expect(response).toBeDefined();
  }, 10000);

  it(`${QuickbooksInvoiceService.name} should create Invoice`, async () => {
    mockServices.httpService.request = async () => <HttpResponse>{
      status: HttpStatus.OK,
      data: {
        Invoice: mockResponses.createInvoice,
        response: {
          Fault: null
        }
      }};
    const response: QuickbooksInvoice = await _quickbooksInvoiceService.createInvoice(mockRequests.invoiceData);
    expect(response).toBeDefined();
  }, 10000);

  it(`${QuickbooksInvoiceService.name} should Pay an Invoice`, async () => {
    mockServices.httpService.request = async () =>
      <HttpResponse>{
        status: HttpStatus.OK,
        data: {
          Payment: {
            Invoice: mockResponses.getInvoices,
            response: {
              Fault: null
            }
          }
        }
      };
    const response = await _quickbooksInvoiceService.payInvoice(mockRequests.quickBooksPayment);
    expect(response).toBeDefined();
  }, 10000);
});
