import { UserProfileDto } from '@blockspaces/shared/dtos/users';
import logger from '@blockspaces/shared/loggers/bscLogger';
import { Inject, Injectable } from '@nestjs/common';
import { ConnectLogger } from "../logging/ConnectLogger";
import { CustomerSupportService } from '../customer-support/customer-support.service';
import { DEFAULT_LOGGER_TOKEN } from '../logging/constants';
import { UserDataService } from '../users/services/UserDataService';

@Injectable()
export class UserProfileService {

  constructor(
    private readonly userDataService: UserDataService,
    private readonly customerService: CustomerSupportService,
    @Inject(DEFAULT_LOGGER_TOKEN) logger: ConnectLogger
  ) { }

  /**
   * Updates a user's profile based on the provided data
   */
  async updateUserProfile(userId: string, dto: UserProfileDto, syncWithCustomerSupport: boolean = true): Promise<void> {

    if (!userId || !dto) return;

    let userDoc = await this.userDataService.findDocumentById(userId);

    if (!userDoc) {
      logger.warn(`Attempted to update user profile for a non-existent user`, { userId }, { module: UserProfileService.name });
      return;
    }

    dto.mergeWithUser(userDoc);
    userDoc = await userDoc.save();

    if (syncWithCustomerSupport) {
      await this.customerService.updateCustomerUserProfile(userDoc);
    }
  }
}
