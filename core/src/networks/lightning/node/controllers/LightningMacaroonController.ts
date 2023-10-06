import { Controller, Get, Post, Body } from "@nestjs/common";
import { LightningMacaroonService } from "../services/LightningMacaroonService";
import { MacaroonSecretDto } from "@blockspaces/shared/dtos/lightning";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { User } from "../../../../users";
import { IUser } from "@blockspaces/shared/models/users";

@Controller("/networks/lightning/auth")
export class LightningMacaroonController {
  constructor(private readonly authService: LightningMacaroonService) {}

  /**
   * Stores a given encrypted macaroon in the Vault.
   *
   * @param user The current logged in user making the request.
   * @param macaroon The encrypted macaroon to store.
   * @returns The `macaroonId` that is stored in the MongoDB node collection.
   */
  @Post()
  async storeMacaroon(@User() user: IUser, @Body() macaroon: MacaroonSecretDto): Promise<ApiResult<string>> {
    const secret = await this.authService.storeMacaroon(macaroon, user.activeTenant?.tenantId, user.id, user.accessToken);
    if (!secret) {
      return ApiResult.failure("Did not store secret.");
    }
    return ApiResult.success(secret);
  }

  /**
   * Gets the encrypted macaroon from Vault.
   *
   * @param user The current logged in user making the request.
   * @returns The encrypted macaroon stored in vault.
   */
  @Get()
  async getMacaroon(@User() user: IUser): Promise<ApiResult<MacaroonSecretDto>> {
    const secret = await this.authService.getMacaroon(user.activeTenant?.tenantId, user.accessToken);
    if (!secret) {
      return ApiResult.failure("Could not retrieve macaroon.");
    }
    return ApiResult.success(secret);
  }
}
