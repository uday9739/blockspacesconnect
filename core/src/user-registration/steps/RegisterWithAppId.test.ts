import { UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { TwoFactorSetupStatus, UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { AppIdService } from "../../app-id";
import { UserRegistrationData } from "../types";
import { RegisterWithAppId } from "./RegisterWithAppId";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { AppIdUserData } from "../../app-id/models";

describe(RegisterWithAppId, () => {

  let mocks: {
    appIdService: AppIdService,
    logger: ConnectLogger
  };

  let step: RegisterWithAppId;
  let registrationData: UserRegistrationData;

  beforeEach(() => {
    mocks = {
      appIdService: createMock<AppIdService>(),
      logger: createMock<ConnectLogger>()
    };

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        save: async () => registrationData.user
      })
    };

    step = new RegisterWithAppId(mocks.appIdService, mocks.logger);
  });


  it('should set Connect UserId using ProfileId from AppId', async () => {
    const appIdUserData = createMock<AppIdUserData>({ active: true, profileId: "54321" });

    mocks.appIdService.registerNewUser = async () => ApiResult.success(appIdUserData);

    const stepResult = await step.run(registrationData);
    expect(stepResult.registrationData.user.id).toBe(appIdUserData.profileId);
  });

  it('should save user document', async () => {
    let saved = false;
    const appIdUserData = createMock<AppIdUserData>({ profileId: "54321" });
    registrationData.user.save = async () => {
      saved = true;
      return registrationData.user;
    };

    mocks.appIdService.registerNewUser = async () => ApiResult.success(appIdUserData);

    await step.run(registrationData);
    expect(saved).toBe(true);
  });

  it.each([true, false])(
    'should indicate if the user was already registered in App ID',
    async (isNewAppIdUser) => {
      const appIdUserData = createMock<AppIdUserData>({ profileId: "54321", isNew: isNewAppIdUser });

      mocks.appIdService.registerNewUser = async () => ApiResult.success(appIdUserData);

      const stepResult = await step.run(registrationData);
      expect(stepResult.registrationData.newAppId).toBe(isNewAppIdUser);
    }
  );

  it('should return failed result if App Id registration is not successful', async () => {
    mocks.appIdService.registerNewUser = async () => ApiResult.failure();

    const stepResult = await step.run(registrationData);
    expect(stepResult.success).toBe(false);
    expect(stepResult.failureReason).toBe(UserRegistrationFailureReason.APP_ID_ERROR);
  });

  it("should update user's 2FA status based on custom attribute value from App ID", async () => {
    registrationData.user.twoFAStatus = TwoFactorSetupStatus.Pending;

    const appIdUserData = createMock<AppIdUserData>({
      attributes: { twofastatus: TwoFactorSetupStatus.Confirmed }
    });

    mocks.appIdService.registerNewUser = async () => ApiResult.success(appIdUserData);

    const stepResult = await step.run(registrationData);
    expect(stepResult.registrationData.user.twoFAStatus).toBe(appIdUserData.attributes.twofastatus);
  });
});