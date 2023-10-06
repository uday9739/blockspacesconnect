import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { HubspotContact } from "../../hubspot/types/HubSpotTypes";
import { HubSpotService} from "../../hubspot/services/HubSpotService";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

@Injectable()
export class CreateCrmContact extends BaseRegistrationStep {

  constructor(
    private readonly hubspotService: HubSpotService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
  ) {
    logger.setModule(CreateCrmContact.name);
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    try {
      if (registrationData.formData.email) {
        const newContact = {
          properties: {
            lifecyclestage: "customer",
            email: registrationData.formData.email
          }
        };
        // create contact in CRM with name and email
        let result = await this.hubspotService.createContact(newContact as unknown as HubspotContact);
        this.logger.trace(`result.data.id ${result.data.id}`)
        registrationData.user.crmContactId = result.data.id;
        registrationData.user = await registrationData.user.save();
      }
      return StepExecutionResult.success(registrationData);
    } catch (error) {
      this.logger.error('Error creating Contact in CRM', error);
      return StepExecutionResult.failure(UserRegistrationFailureReason.CREATE_CRM_CONTACT_FAILED);
    }
  }









}