import { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { SimplePublicObject } from "@hubspot/api-client/lib/codegen/crm/contacts";

export interface HubspotContact extends SimplePublicObject { }
export class HubspotContactResult extends ApiResultWithError<HubspotContact, string> { }

export interface HubspotForm {
  portalId: string,
  formGuid: string,
  formData: {
    fields: {
      name: string,
      value: string,
    }[],
    context: {
      pageUri: string,
      pageName: string
    }
  }
}