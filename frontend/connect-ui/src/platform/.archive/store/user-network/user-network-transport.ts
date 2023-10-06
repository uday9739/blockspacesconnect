import ApiResult from '@blockspaces/shared/models/ApiResult';
import { AddUserNetworkRequest } from "@blockspaces/shared/dtos/user-network";
import { UserNetwork } from "@blockspaces/shared/models/networks";
import { getApiUrl } from "src/platform/utils";
import { BaseHttpTransport } from "src/platform/api";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { isErrorStatus } from "@blockspaces/shared/helpers/http";

export class UserNetworkTransport extends BaseHttpTransport {

  /** singleton instance of {@link UserTransport} */
  static readonly instance: UserNetworkTransport = new UserNetworkTransport();

  constructor() {
    super({ baseURL: getApiUrl("/user-network") });
  }

  /**
   * Adds UserNetwork data for the current user and the given NetworkId
   * @returns UserNetwork data that was added, or null if the relationship already exists
   */
  async addUserNetwork(networkId: string): Promise<UserNetwork> {
    const response = await this.httpService.post<ApiResult<UserNetwork>>(
      "",
      new AddUserNetworkRequest({ networkId }),
      { validErrorStatuses: [HttpStatus.BAD_REQUEST] }
    );

    if (isErrorStatus(response.status)) {
      return null;
    }

    return response.data.data;
  }
}