import { Injectable } from "@nestjs/common";
import { BadRequestException } from "../../exceptions/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";

@Injectable()
export class SystemFeatureFlagsService {
  constructor(
    public readonly db: ConnectDbDataContext,
  ) { }

  getSystemFeatureFlagsFromDb = async (): Promise<Array<any>> => {
    try {
      let response = await this.db.systemMaintenance.find();
      response = response.map((item) => {
        return item.toJSON();
      });
      return response as Array<any>;
    } catch (error) {
      throw new BadRequestException("Unable to retrieve list of system feature flags", { cause: error });
    }
  };
}
