import { Injectable } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";


@Injectable()
export class ConnectorsService {
  constructor(private readonly db: ConnectDbDataContext) {
  }

  async getAllActive() {
    const data = await this.db.connectors.find({ active: true }, {}, { lean: true }).sort({ name: "asc" });
    return data.sort((a, b) => Number(b.isFeatured || null) - Number(a.isFeatured || null));
  }

  async getById(id) {
    return await this.db.connectors.findOne({ _id: id }, {}, { lean: true });
  }

  async getActiveForNetwork(networkId: string) {
    // const network = await this.db.networks.findById(networkId);
    return await this.db.networkConnectorIntegrations.find({ active: true, network: networkId }, {}, { lean: true, populate: ["network", "connector"] });
  }
}