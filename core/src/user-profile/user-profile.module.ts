import { Module } from '@nestjs/common';
import { CustomerSupportModule } from '../customer-support/customer-support.module';
import { UsersModule } from '../users';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [UsersModule, CustomerSupportModule],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule {};