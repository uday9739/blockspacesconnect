import { HubSpotService } from "./HubSpotService";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { createMock } from "ts-auto-mock";
import { EnvironmentVariables } from "../../env";
import { Client as HubSpotClient } from "@hubspot/api-client";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { HubspotContact, HubspotForm } from "../types/HubSpotTypes";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@nestjs/common";

describe(`${HubSpotService.name}`, () => {
  let service: HubSpotService;

  const mockHttpClient: HttpService = createMock<HttpService>();
  const mockHubSpotClient: HubSpotClient = createMock<HubSpotClient>();
  const mockLogger: ConnectLogger = createMock<ConnectLogger>();
  const mockEnv: EnvironmentVariables = createMock<EnvironmentVariables>({
    hubspot: {
      hubspotApiKey: "pat-na1-9c183fcd-6f5c-4952-b967-045fe1d63132"
    }
  });

  beforeEach(() => {
    service = new HubSpotService(mockHttpClient, mockEnv, mockLogger);
    (service as any).hubspotClient = mockHubSpotClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it(`${HubSpotService.prototype.getContactById.name} should be defined`, async () => {
    expect(service.getContactById).toBeDefined();
  });

  it(`${HubSpotService.prototype.getContactById.name} should fetch a contact by id`, async () => {
    const mockContact = {
      id: "751",
      properties: {
        createdate: "2022-05-18T13:24:16.501Z",
        email: "henry-test@aph.xyz",
        firstname: "Test",
        hs_object_id: "751",
        lastmodifieddate: "2023-04-13T09:16:42.919Z",
        lastname: "Test Last Name"
      },
      createdAt: "2022-05-18T13:24:16.501Z",
      updatedAt: "2023-04-13T09:16:42.919Z",
      archived: false
    };
    mockHubSpotClient.crm.contacts.basicApi.getById = jest.fn().mockResolvedValueOnce(mockContact);
    const result = await service.getContactById(mockContact.id);
    expect(result).toBeInstanceOf(ApiResult);
    expect(result.data.id).toEqual(mockContact.id);
  });

  it(`${HubSpotService.prototype.getContactById.name} should handle errors`, async () => {
    const mockError = new Error("HubSpotClient error");
    mockHubSpotClient.crm.contacts.basicApi.getById = jest.fn().mockRejectedValueOnce(mockError);
    const loggerSpy = jest.spyOn(mockLogger, "error");
    const result = await service.getContactById("test-id");

    expect(result.message).toEqual(mockError.message);
    expect(mockHubSpotClient.crm.contacts.basicApi.getById).toHaveBeenCalledWith("test-id");
    expect(loggerSpy).toHaveBeenCalledWith(mockError.message, mockError);
  });

  it(`${HubSpotService.prototype.createContact.name} should be defined`, async () => {
    expect(service.getContactById).toBeDefined();
  });

  it(`${HubSpotService.prototype.createContact.name} should create a new contact`, async () => {
    const mockContactObject = {
      id: "770001",
      properties: {
        firstname: "test firstname",
        lastname: "test lastname",
        lifecyclestage: "lead",
        email: "test@blockspaces.com"
      }
    };

    mockHubSpotClient.crm.contacts.basicApi.create = jest.fn().mockResolvedValueOnce(mockContactObject);
    const result = await service.createContact(mockContactObject as unknown as HubspotContact);
    expect(result).toBeInstanceOf(ApiResult);
    expect(result.data.id).toEqual("770001");
    expect(result.data.properties.email).toEqual(mockContactObject.properties.email);
  });

  it(`${HubSpotService.prototype.createContact.name} should handle condition when contact exists`, async () => {
    const mockContactObject = {
      properties: {
        firstname: "test firstname",
        lastname: "test lastname",
        lifecyclestage: "lead",
        email: "test@blockspaces.com"
      }
    };

    const mockError = {
      code: 409,
      body: {
        status: 'error',
        message: 'Contact already exists. Existing ID: 770001',
        correlationId: 'bde1e8ed-d2a1-469d-bb81-18a7831fee56',
        category: 'CONFLICT'
      }
    };

    mockHubSpotClient.crm.contacts.basicApi.create = jest.fn().mockRejectedValueOnce(mockError);
    const result = await service.createContact(mockContactObject as unknown as HubspotContact);

    expect(result.data.id).toEqual("770001");
    expect(result.message).toEqual("Contact already exists.");
  });

  it(`${HubSpotService.prototype.createContact.name} should handle errors`, async () => {
    const mockContactObject = {
      properties: {
        firstname: "test firstname",
        lastname: "test lastname",
        lifecyclestage: "lead",
        email: "test@blockspaces.com"
      }
    };

    const mockError = new Error("HubSpotClient error");

    mockHubSpotClient.crm.contacts.basicApi.create = jest.fn().mockRejectedValueOnce(mockError);
    const result = await service.createContact(mockContactObject as unknown as HubspotContact);

    expect(result.message).toEqual("HubSpotClient error");
  });




  it(`${HubSpotService.prototype.sendForm.name} should be defined`, async () => {
    expect(service.sendForm).toBeDefined();
  });

  it(`${HubSpotService.prototype.sendForm.name} should create a new contact`, async () => {
    const mockFormObject = createMock<HubspotForm>();

    mockHttpClient.request = jest.fn().mockResolvedValue(Promise.resolve())

    const result = await service.sendForm(mockFormObject);
    expect(result).toBeInstanceOf(ApiResult);
  });

  it(`${HubSpotService.prototype.sendForm.name} should handle error`, async () => {
    const mockFormObject = createMock<HubspotForm>();

    const mockError = createMock<HttpResponse>();
    mockError.status = HttpStatus.BAD_REQUEST;
    mockError.statusText = 'Error'
    mockHttpClient.request = jest.fn().mockRejectedValueOnce(mockError);
    const result = await service.sendForm(mockFormObject);
    expect(result.status).toEqual("failed");
  });


});