import { Body, Controller, Get, Post } from "@nestjs/common";
import { WishlistService } from "../services/WishlistService";
import { Wishlist } from "@blockspaces/shared/models/wishlist";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { IUser } from "@blockspaces/shared/models/users";
import { User } from "../../users/decorators/User.decorator";

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Get('mine')
  async data(@User() user: IUser) {
    return ApiResult.success(await this.wishlistService.wishlistByUser(user.id));
  }
  @Post('create')
  async create(@User() user: IUser, @Body() data: Wishlist) {
    return ApiResult.success(await this.wishlistService.create(user, data));
  }
}