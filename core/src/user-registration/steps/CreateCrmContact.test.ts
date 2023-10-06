import { UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { UserRegistrationData } from "../types";

import { ServiceUnavailableException } from "../../exceptions/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import {HubSpotService} from "../../hubspot/services/HubSpotService";
import {CreateCrmContact} from "./CreateCrmContact";
import {HubspotContactResult} from "../../hubspot/types/HubSpotTypes";

describe(`${CreateCrmContact.name}`, () => {

  let mocks: {
    hubspotService: HubSpotService,
    logger: ConnectLogger,
  };

  let step: CreateCrmContact;
  let registrationData: UserRegistrationData;

  beforeEach(() => {
    mocks = {
      hubspotService: createMock<HubSpotService>(),
      logger: createMock<ConnectLogger>(),
    };

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        crmContactId: "",
        save: async () => registrationData.user
      })
    };

    step = new CreateCrmContact(mocks.hubspotService, mocks.logger);
  });

  it(`${CreateCrmContact.name} should execute and create a new Contact in CRM`, async () => {
    mocks.hubspotService.createContact = jest.fn().mockResolvedValue( <HubspotContactResult><unknown>{
      data: {
        id: "751",
        properties: {
          createdate: "2022-05-18T13:24:16.501Z",
          email: "joe@shmo.com",
          firstname: "Henry",
          hs_object_id: "751",
          lastmodifieddate: "2023-04-13T09:16:42.919Z",
          lastname: "Tester"
        },
        createdAt: "2022-05-18T13:24:16.501Z",
        updatedAt: "2023-04-13T09:16:42.919Z",
        archived: false
      },
      status: "success",
    });
    const stepResult = await step.run(registrationData);
    expect(stepResult.registrationData.user.crmContactId).toBe("751");
    expect(stepResult.success).toBe(true);
  });

  it(`${CreateCrmContact.name} should catch errors when a new Contact cannot be created in CRM`, async () => {
    mocks.hubspotService.createContact = jest.fn().mockImplementation(() => {
      let error = new Error('Unable to create contact');
      return HubspotContactResult.failure(error.message);
    });
    const stepResult = await step.run(registrationData);
    expect(stepResult.success).toBe(false);
    expect(stepResult.failureReason).toBe('Failed creating a new Contact for the User in the CRM');
  });

  it(`${CreateCrmContact.name} should execute and handle when the Contact is already in the CRM`, async () => {
    mocks.hubspotService.createContact = jest.fn().mockResolvedValue( <HubspotContactResult><unknown>{
      data: {id: "751"},
      status: "success",
    });
    const stepResult = await step.run(registrationData);
    expect(stepResult.registrationData.user.crmContactId).toBe("751");
    expect(stepResult.success).toBe(true);
  });

});