import { Inject, Injectable } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { Wishlist } from "@blockspaces/shared/models/wishlist";
import { IUser } from "@blockspaces/shared/models/users";
import { HubspotForm } from "../../hubspot/types/HubSpotTypes";
import { HubSpotService } from "../../hubspot/services/HubSpotService";
import { ENV_TOKEN, EnvironmentVariables } from "../../env";

@Injectable()
export class WishlistService {

  /**
   *
   */
  constructor(
    private readonly db: ConnectDbDataContext,
    private readonly hubspot: HubSpotService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
  ) {
  }
  async create(user: IUser, wishlist: Wishlist): Promise<Wishlist> {
    const connector = wishlist.connectorId ? await this.db.connectors.findById(wishlist.connectorId) : { name: wishlist.networkId || '' };
    let wishlistHubspotForm: HubspotForm = {
      portalId: this.env.hubspot.hubspotPortalId,
      formGuid: this.env.hubspot.hubspotWishlistFormsGuid,
      formData: {
        fields: [
          {
            name: "email",
            value: user.email
          },
          {
            name: "firstname",
            value: user.firstName
          },
          {
            name: "lastname",
            value: user.lastName
          },
          {
            name: "company",
            value: user.companyName || ''
          },
          {
            name: "bip",
            value: connector.name || ''
          }
        ],
        context: {
          pageUri: 'https://app.blockspaces.com',
          pageName: wishlist.networkId || 'Unknown'
        }
      }
    }
    await this.hubspot.sendForm(wishlistHubspotForm);
    return await this.db.wishlist.create({ ...wishlist, userId: user.id });
  }

  async wishlistByUser(userId: string): Promise<Wishlist[]> {
    return this.db.wishlist.find({ userId });
  }
}