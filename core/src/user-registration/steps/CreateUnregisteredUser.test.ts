import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { IUser, UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { UserDataService } from "../../users/services/UserDataService";
import { UserRegistrationData } from "../types";
import { CreateUnregisteredUser } from "./CreateUnregisteredUser";

describe(CreateUnregisteredUser, () => {

  let mocks: {
    userDataService: UserDataService
  };

  let step: CreateUnregisteredUser;
  let registrationData: UserRegistrationData;

  beforeEach(() => {
    mocks = {
      userDataService: createMock<UserDataService>()
    };

    registrationData = createMock<UserRegistrationData>({
      formData: { email: "joe@shmo.com" }
    });

    step = new CreateUnregisteredUser(mocks.userDataService);
  });

  it("should create a new user document, if one doesn't exists", async () => {
    const expectedUserDoc = createMock<HydratedDocument<UnregisteredUser>>({ registered: false });

    mocks.userDataService.findByEmailAsUnregisteredUser = async () => null;
    mocks.userDataService.createUnregisteredUser = async () => expectedUserDoc;

    const result = await step.run(registrationData);
    const actualUserDoc = result?.registrationData?.user;

    expect(actualUserDoc).toBe(expectedUserDoc);
  });

  it("should use an existing user document, if one is found matching user-provided email", async () => {
    const expectedUserDoc = createMock<HydratedDocument<UnregisteredUser>>({ registered: false });

    mocks.userDataService.findByEmailAsUnregisteredUser = async () => expectedUserDoc;

    const result = await step.run(registrationData);
    const actualUserDoc = result?.registrationData?.user;

    expect(actualUserDoc).toBe(expectedUserDoc);
  });

  it.each([{registered: true}, {registered: undefined}])(
    'should fail if the user is already registered (%o)',
    async ({registered}) => {
      const registeredUser: IUser = createMock<IUser>({ registered });
      const expectedUserDoc = createMock<HydratedDocument<UnregisteredUser>>(registeredUser as UnregisteredUser);

      mocks.userDataService.findByEmailAsUnregisteredUser = async () => expectedUserDoc;

      const result = await step.run(registrationData);

      expect(result.success).toBe(false);
      expect(result.failureReason).toBe(UserRegistrationFailureReason.ALREADY_REGISTERED);
    }
  );
});