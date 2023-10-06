import { NetworkId, UserNetwork } from "@blockspaces/shared/models/networks";
import { Injectable } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { MongooseRepository } from "../../mongoose/services/MongooseRepository";

/**
 * CRUD operations for {@link UserNetwork} data
 */
@Injectable()
export class UserNetworkDataService {
  constructor(private readonly db: ConnectDbDataContext) { }

  /** Adds a new UserNetwork record to the DB */
  async addUserNetwork(userNetwork: UserNetwork): Promise<UserNetwork> {

    const newUserNetwork = await this.db.userNetworks.create(userNetwork);


    await this.db.users.model.updateOne({ id: userNetwork.userId }, { $push: { connectedNetworks: userNetwork.networkId } });

    return newUserNetwork;
  }


  /** Retrieves all UserNetwork data for a given user */
  async findByUserId<TNetworkData = any>(userId: string): Promise<UserNetwork<TNetworkData>[]> {
    return await this.db.userNetworks.find({ userId }, {}, { populate: ["billingCategory", "billingTier"] });
  }

  async findByUserAndNetwork<TNetworkData = any>(userId: string, networkId: string, billingCategoryId: string): Promise<UserNetwork<TNetworkData>> {
    return await this.db.userNetworks.findOne({ userId, networkId, billingCategory: billingCategoryId }, {}, { populate: ["billingCategory", "billingTier"] });
  }

  async update(userNetwork: UserNetwork) {
    return await this.db.userNetworks.updateByIdAndSave(userNetwork._id, userNetwork);
  }

  async deleteUserNetwork(userNetworkId: string) {
    return await this.db.userNetworks.findByIdAndDelete(userNetworkId);
  }
}
