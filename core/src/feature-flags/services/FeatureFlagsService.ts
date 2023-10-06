import {Injectable} from "@nestjs/common";
import {IFeatureFlags, getDefaultFeatureFlags} from "@blockspaces/shared/models/feature-flags/FeatureFlags";
import {BadRequestException} from "../../exceptions/common";
import {SystemFeatureFlagsService} from "./SystemFeatureFlagsService";

@Injectable()
export class FeatureFlagsService {
  constructor(
    public readonly sysFlags: SystemFeatureFlagsService
  ) { }

  getFeatureFlagList = async (): Promise<Array<string>> => {
    try {
      const featureFlags: IFeatureFlags = getDefaultFeatureFlags();
      return Object.keys(featureFlags);
    } catch (error) {
      throw new BadRequestException("Unable to retrieve list of feature flags", { cause: error });
    }
  };

  getSystemFeatureFlagList = async (): Promise<Array<any>> => {
    try {
      return await this.sysFlags.getSystemFeatureFlagsFromDb();
    } catch (error) {
      throw new BadRequestException("Unable to retrieve list of system feature flags", { cause: error });
    }
  };

}
