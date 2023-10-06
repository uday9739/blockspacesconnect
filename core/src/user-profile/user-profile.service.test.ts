import { UserProfileDto } from '@blockspaces/shared/dtos/users';
import { IUser } from '@blockspaces/shared/models/users';
import { Logger } from 'log4js';
import { HydratedDocument } from 'mongoose';
import { createMock } from "ts-auto-mock";
import { CustomerSupportService } from "../customer-support/customer-support.service";
import { ConnectLogger } from '../logging/ConnectLogger';
import { UserDataService } from "../users/services/UserDataService";
import { UserProfileService } from "./user-profile.service";

describe(UserProfileService, () => {

  let userProfileService: UserProfileService;

  let mocks: {
    userDataService: UserDataService,
    customerSupService: CustomerSupportService,
    logger: ConnectLogger
  };

  beforeEach(() => {
    mocks = {
      userDataService: createMock<UserDataService>(),
      customerSupService: createMock<CustomerSupportService>(),
      logger: createMock<ConnectLogger>()
    };

    userProfileService = new UserProfileService(
      mocks.userDataService,
      mocks.customerSupService,
      mocks.logger
    );
  });

  describe(UserProfileService.prototype.updateUserProfile, () => {

    it('should save user data', async () => {
      let wasSaved = false;

      const userDoc = createMock<HydratedDocument<IUser>>({
        async save() { wasSaved = true; return userDoc; }
      });
      mocks.userDataService.findDocumentById = async () => userDoc;

      await userProfileService.updateUserProfile("abc123", createMock<UserProfileDto>());

      expect(wasSaved).toBe(true);
    });


    it.each([true, false])(
      'should or should not sync with CS system based on flag (flag = %s)',
      async (shouldSync) => {
        let didSync: boolean = false;
        let userUsedForSync: IUser;

        const userDoc = createMock<HydratedDocument<IUser>>({
          save: () => userDoc
        });
        mocks.userDataService.findDocumentById = async () => userDoc;

        mocks.customerSupService.updateCustomerUserProfile = async (user) => {
          didSync = true;
          userUsedForSync = user;
        };

        await userProfileService.updateUserProfile("abc123", createMock<UserProfileDto>(), shouldSync);

        expect(didSync).toBe(shouldSync);

        if (shouldSync) {
          expect(userUsedForSync).toBe(userDoc);
        }
      }
    );
  });
});