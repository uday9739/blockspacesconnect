import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { Client as HubSpotClient } from "@hubspot/api-client";
import { HubspotContact, HubspotContactResult, HubspotForm } from "../types/HubSpotTypes";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";
import { HttpStatus } from "@blockspaces/shared/types/http";

@Injectable()
export class HubSpotService {
  private readonly hubspotClient: HubSpotClient;
  constructor(
    private readonly httpClient: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {

    logger.setModule(this.constructor.name);
    this.hubspotClient = new HubSpotClient({ accessToken: env.hubspot.hubspotApiKey });
  }

  /**
   * Get Hubspot contact by contactId
   * @param hubspotContactId the contact's id in the Hubspot CRM
   * @returns HubspotContactResult Object
   */
  async getContactById(hubspotContactId: string): Promise<HubspotContactResult> {
    try {
      const contactResult = await this.hubspotClient.crm.contacts.basicApi.getById(hubspotContactId);
      return HubspotContactResult.success(contactResult as HubspotContact);
    } catch (error) {
      this.logger.error(error.message, error);
      return HubspotContactResult.failure(error.message);
    }
  }

  /**
   * Create a Hubspot contact
   * @param hubspotContact is an object of type HubspotContact
   * @returns HubspotContactResult Object
   */
  async createContact(hubspotContact: HubspotContact): Promise<HubspotContactResult> {
    try {
      const contactResult = await this.hubspotClient.crm.contacts.basicApi.create(hubspotContact)
      return HubspotContactResult.success(contactResult as HubspotContact);
    } catch (error) {
      if (error.body && error.body.message.includes("Contact already exists.")) {
        const match = error.body.message.match(/(\d+)$/);
        return HubspotContactResult.success({ id: match[0] } as unknown as HubspotContact, "Contact already exists.");
      } else {
        this.logger.error(error.message, error);
        return HubspotContactResult.failure(error.message);
      }
    }
  }

  async sendForm(hubspotForm: HubspotForm): AsyncApiResult<void> {
    try {
      const config = {
        method: "POST",
        baseURL: `${this.env.hubspot.hubspotFormsApiEndpoint}`,
        url: `/${hubspotForm.portalId}/${hubspotForm.formGuid}`,
        data: hubspotForm.formData,
        headers: {
          "Authorization": `Bearer ${this.env.hubspot.hubspotApiKey}`
        }
      }
      await this.httpClient.request(config)
    } catch (error) {
      this.logger.error(error.message, error);
      return ApiResult.failure(error.message);
    }
    return ApiResult.success();
  }


}