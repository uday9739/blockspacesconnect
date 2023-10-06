import { UserProfileDto } from '@blockspaces/shared/dtos/users';
import ApiResult from '@blockspaces/shared/models/ApiResult';
import { IUser } from '@blockspaces/shared/models/users';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { User } from "../users";
import { ValidRoute } from '../validation';
import { UserProfileService } from './user-profile.service';

@Controller('user-profile')
export class UserProfileController {

  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getUserProfile(@User() user: IUser) {
    const dto = UserProfileDto.fromUser(user);
    return ApiResult.success(dto);
  }

  @Patch()
  @ValidRoute()
  async updateUserProfile(@User() user: IUser, @Body() userProfile: UserProfileDto) {
    await this.userProfileService.updateUserProfile(user.id, userProfile);
  }
}
