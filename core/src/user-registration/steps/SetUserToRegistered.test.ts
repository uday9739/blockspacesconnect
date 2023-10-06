import { UserProfileDto, UserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { CountryCode } from "@blockspaces/shared/models/Countries";
import { StateAbbreviation } from "@blockspaces/shared/models/States";
import { IUser, UnregisteredUser, User } from "@blockspaces/shared/models/users";
import { HydratedDocument, Models, Query } from "mongoose";
import { createMock } from "ts-auto-mock";
import { string } from "yargs";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables } from "../../env";
import { TenantMemberService, TenantService } from "../../tenants";
import { UserDataService } from "../../users/services/UserDataService";
import { UserRegistrationData } from "../types";
import { SetUserToRegistered } from "./SetUserToRegistered";

describe(SetUserToRegistered, () => {
  let mocks: {
    connectDb: ConnectDbDataContext,
    tenantService: TenantService,
    tenantMemberService: TenantMemberService,
    userDataService: UserDataService,
    env: EnvironmentVariables
  };

  let registrationData: UserRegistrationData;
  let step: SetUserToRegistered;


  beforeEach(() => {
    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        save: async () => registrationData.user
      })

    };

    mocks = {
      connectDb: createMock<ConnectDbDataContext>(),
      tenantService: createMock<TenantService>(),
      tenantMemberService: createMock<TenantMemberService>(),
      userDataService: createMock<UserDataService>(),
      env: createMock<EnvironmentVariables>()
    };

    step = new SetUserToRegistered(mocks.connectDb, mocks.tenantService, mocks.tenantMemberService, mocks.userDataService, mocks.env);
  });

  it.skip('should verify save executed', async () => {
    // getting a timeout error trying to mock the document objects when the test runs
    let updatedUser = false;
    const userDoc = createMock<HydratedDocument<IUser>>({
      // email:"foo@bar.com",
      // twoFAStatus: "PENDING",
      // firstName: "foo",
      // lastName: "bar",
      // phone: "2223334455",
      // companyName: "Foo",
      save: async () => userDoc,
    });

    // mocks.connectDb.users.findOne =  async () => userDoc;

    await step.run(registrationData);
    expect(userDoc.email).toBeInstanceOf(string);
  });
});