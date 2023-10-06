import { NewAddressDto, NewAddressResultDto, WalletBalanceResponse } from "@blockspaces/shared/dtos/lightning";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { Controller, Get, HttpStatus, NotFoundException, Query } from "@nestjs/common";
import { LightningWalletService } from "../services/LightningWalletService";
import { User } from "../../../../users";
import { IUser } from "@blockspaces/shared/models/users";
import { ValidRoute } from "../../../../validation";
import { returnErrorStatus } from "../../../../exceptions/utils";

@ValidRoute()
@Controller("/networks/lightning/wallet")
export class LightningWalletController {
  constructor(private readonly wallet: LightningWalletService) {}

  @Get("/new-address")
  async getNewAddress(@User() user: IUser, @Query() query: NewAddressDto): AsyncApiResult<NewAddressResultDto> {
    const request = {
      type: query.type,
      account: query.account
    };
    const address = await this.wallet.getNewAddress(request, user.activeTenant?.tenantId);
    if (!address) {
      const apiResult = ApiResult.failure("Could not retrieve a new bitcoin deposit address.")
      throw new NotFoundException(apiResult)
    }
    return ApiResult.success(address);
  }


  @Get("/balance")
  async getWalletBalance(@User() user: IUser): AsyncApiResult<WalletBalanceResponse> {
    const balance = await this.wallet.getWalletBalance(user.activeTenant?.tenantId);
    if (!balance) {
      throw new NotFoundException(ApiResult.failure(`Failed to get wallet balance: ${user.activeTenant?.tenantId}`))
    }
    return ApiResult.success(balance)
  }

}
