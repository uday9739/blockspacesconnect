import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { IResetPassword, TwoFactorSetupStatus, UnregisteredUser } from "@blockspaces/shared/models/users";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import logger from "@blockspaces/shared/loggers/bscLogger";
import { injectable } from "inversify";
import { AppIdService } from "../../app-id";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { IUser } from "@blockspaces/shared/models/users/User";
import { HydratedDocument } from "mongoose";
import { TenantService } from "../../tenants";
import { AppSettings } from "@blockspaces/shared/models/app-settings";
import { flatten } from 'flat';
import { JwtService } from "../../auth/services/JwtService";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { forwardRef, Inject } from "@nestjs/common";
import { EmailService } from "../../notifications/services";
import { RequestContext } from "nestjs-request-context";
import CookieName from "@blockspaces/shared/models/CookieName";

const thisModule = "dalUsers.ts";
const results: BscStatusResponse = {
  status: ApiResultStatus.Failed,
  data: []
};

@injectable()
/** Users Class. */
class UserDataService {

  constructor(
    private readonly appIdService: AppIdService,
    private readonly db: ConnectDbDataContext,
    @Inject(forwardRef(() => TenantService)) private readonly tenantDataService: TenantService,
    private readonly jwtService: JwtService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly emailService: EmailService

  ) { }

  /**
   * Creates a new user document for an unregistered user
   *
   * @returns the newly created document
   */
  async createUnregisteredUser(user: UnregisteredUser): Promise<HydratedDocument<UnregisteredUser>> {
    return await this.db.unregisteredUsers.create(user);
  }


  async findUnregistered(email: string): Promise<HydratedDocument<UnregisteredUser>> {
    return await this.db.unregisteredUsers.findOne({ email: email, registered: false });
  }

  /**
   * Finds a user with the given email address
   *
   * @returns the user document or null if no user is found with the given email
   */
  async findByEmail(email: string): Promise<HydratedDocument<IUser>> {
    // Task BSPLT-1658 User Loging email was not case-insensitive.
    return await this.db.users.findOne({ email: email }).collation({ locale: `en`, strength: 2 });
  }
  /**
   * Finds a user with stripeCustomerId
   *
   * @returns the user document or null if no user is found with the given email
   */
  async findByStripeCustomerId(stripeCustomerId: string): Promise<HydratedDocument<IUser>> {
    return await this.db.users.findOne({ 'billingDetails.stripe.customerId': stripeCustomerId });
  }

  /**
   * Finds a user with the given email address, but returning the data as an {@link UnregisteredUser} document
   *
   * WARNING: This operation is only meant to be used when needing to identify existing users during the registration process.
   * This operation will not filter data based on the `registered` property.
   * For a more general use operation, see {@link findByEmail}
   *
   * @returns the unregistered document or null if no user is found with the given email address
   */
  async findByEmailAsUnregisteredUser(email: string): Promise<HydratedDocument<UnregisteredUser>> {
    return await this.db.unregisteredUsers.findOne({ email });
  }

  /**
   * Finds a user based on the given user ID
   *
   * @returns the matching user object, or null if no user is found
   */
  async findById(userId: string): Promise<IUser> {
    return (await this.findDocumentById(userId))?.toObject();
  }

  /**
   * Finds a user document based on the given user ID
   *
   * @returns the matching user document, or null if no user is found
   */
  async findDocumentById(userId: string): Promise<HydratedDocument<IUser>> {
    return await this.db.users.findOne({ id: userId });
  }

  // #region Legacy Operations

  /** Create a new User */
  create = async (data: IUser): Promise<BscStatusResponse> => {

    // Create the new user document.
    try {
      const newUser = (await this.db.users.create(data)).toObject();
      results.status = ApiResultStatus.Success;
      results.data = newUser;
    } catch (err) {
      logger.error("Users.create", { module: thisModule }, { error: err.message || "Some error occurred while creating the User." });
      results.data = [err.message || "Some error occurred while creating the User."];
    }

    return results;
  };

  /** Update the User */
  update = async (data: IUser): Promise<BscStatusResponse> => {
    // Attempt to bind data to local object
    const validatedData: IUser = data;
    // Create the Update parameters for Mongoose.
    const filter = { id: validatedData.id }; // findOneAndUpdate search params
    const update: IUser = validatedData; // findOneAndUpdate updated document to save.
    const opts = { new: true, upsert: true }; // findOneAndUpdate MongoDB save and return options.
    // Update the document

    try {
      const updatedUser: IUser = await this.db.users.findOneAndUpdate(filter, { $set: update }, opts);
      const userWithTenant = await this.getUserById(updatedUser.id);
      results.status = ApiResultStatus.Success;
      results.data = userWithTenant;
    } catch (err) {
      logger.error("Users.update", { module: thisModule }, { error: err || "Cannot update User for id = " + update.id });
      results.data = err || "Cannot update User for id = " + update.id;
    }
    return results;
  };

  /** Update the User Settings */
  patchSettings = async (data: IUser, settings: AppSettings): Promise<BscStatusResponse> => {
    // Attempt to bind data to local object
    const validatedData: IUser = data;
    // Create the Update parameters for Mongoose.
    const filter = { id: validatedData.id }; // findOneAndUpdate search params
    const opts = { new: true, upsert: true }; // findOneAndUpdate MongoDB save and return options.
    const update = { appSettings: settings };

    // Update the document
    try {
      const updatedUser: IUser = await this.db.users.findOneAndUpdate(filter, { $set: flatten(update) }, opts);
      results.status = ApiResultStatus.Success;
      results.data = updatedUser;
    } catch (err) {
      logger.error("Users.update", { module: thisModule }, { error: err || "Cannot update User for id = " + data.id });
      results.data = err || "Cannot update User for id = " + data.id;
    }
    return results;
  };

  /** Get the User Details document */
  get = async (id: string): Promise<BscStatusResponse> => {
    try {
      const user: IUser = await this.db.users.findOne({ id: id });
      return { status: ApiResultStatus.Success, data: user };
    } catch (err) {
      logger.error("Users().get", { module: thisModule }, { error: err || "Did not find User for id = " + id });
      return { status: ApiResultStatus.Failed, data: err || "Did not find User for id = " + id };
    }
  };

  /** Delete a User from MongoDB */
  delete = async (id: string): Promise<BscStatusResponse> => {
    try {
      const user: IUser = await this.db.users.findOneAndDelete({ id: id });

      if (!user) {
        if (!user) {
          logger.error("deleteConnector", { module: thisModule }, { error: "Cannot delete User with id = " + id });
          return { status: ApiResultStatus.Failed, data: "Cannot delete User with id = " + id };
        }
      }

      return { status: ApiResultStatus.Success, data: "User was deleted successfully!" };
    } catch (err) {
      logger.error("deleteConnector", { module: thisModule }, { error: err.message || "Cannot delete User with id = " + id });
      return { status: ApiResultStatus.Failed, data: err.message || "Cannot delete User with id = " + id };
    }
  };

  /** Set the First Login Flag to false */
  setFirstLogin = async (id: string): Promise<BscStatusResponse> => {
    // Get the user document from MongoDB
    const user: BscStatusResponse = await this.get(id);
    if (user.status === ApiResultStatus.Failed) {
      logger.error("Users().isFirstLogin", { module: thisModule }, { error: user.data || "Unknown Error happened Gettting the User.firstLogin flag." });
      results.data = user.data || "Unknown Error happened Gettting the User.firstLogin flag.";
    } else {
      // flip the FirstLogin flag
      user.data.firstLogin = false;
      // Make sure the shape has not changed
      const validatedData: IUser = user.data;
      // Save the updated document.
      const updateUser: BscStatusResponse = await this.update(validatedData);
      if (updateUser.status === ApiResultStatus.Failed) {
        logger.error("Users().isFirstLogin", { module: thisModule }, { error: user.data || "Unknown Error happened Updating the User.firstLogin flag." });
        results.data = user.data || "Unknown Error happened Updating the User.firstLogin flag.";
      } else {
        results.status = ApiResultStatus.Success;
        results.data = updateUser.data;
      }
    }
    return results;
  };

  /** Get the User Details document */
  getByEmail = async (email: string): Promise<BscStatusResponse> => {
    // Get the document from MongoDB
    try {
      const user = await this.db.users.findOne({ email: email });
      return { status: ApiResultStatus.Success, data: user };
    } catch (err) {
      logger.error("Users().getByEmail", { module: thisModule }, { error: err || "Did not find User for email = " + email });
      return { status: ApiResultStatus.Failed, data: err || "Did not find User for email = " + email };
    }
  };

  /** Set the First Login Flag to false */
  update2FAStatus = async (id: string, twoFAStatus: TwoFactorSetupStatus.Confirmed | TwoFactorSetupStatus.Pending = TwoFactorSetupStatus.Confirmed): Promise<BscStatusResponse> => {
    // Get the user document from MongoDB
    const user: BscStatusResponse = await this.get(id);
    if (user.status === ApiResultStatus.Failed) {
      logger.error("dalUsers.update2FAStatus", { module: thisModule }, { error: user.data || "Unknown Error happened Gettting the dalUsers.update2FAStatus flag." });
      results.data = user.data || "Unknown Error happened Gettting the dalUsers.update2FAStatus flag.";
    } else {
      user.data.twoFAStatus = twoFAStatus;
      // Make sure the shape has not changed
      const validatedData: IUser = user.data;
      // Save the updated document.
      const updateUser: BscStatusResponse = await this.update(validatedData);
      if (updateUser.status === ApiResultStatus.Failed) {
        logger.error("dalUsers.update2FAStatus", { module: thisModule }, { error: user.data || "Unknown Error happened Updating the dalUsers.update2FAStatus flag." });
        results.data = user.data || "Unknown Error happened Updating the dalUsers.update2FAStatus flag.";
      } else {
        results.status = ApiResultStatus.Success;
        results.data = updateUser.data;
      }
    }
    return results;
  };

  /** Update the user Term of Service flag. */
  acceptToS = async (id: string): Promise<BscStatusResponse> => {
    // Get the user document from MongoDB
    const user: BscStatusResponse = await this.get(id);
    if (user.status === ApiResultStatus.Failed) {
      logger.error("Users().updateToSDate", { module: thisModule }, { error: user.data || "Unknown Error happened Gettting the User.updateToSDate." });
      results.data = user.data || "Unknown Error happened Gettting the User Details.";
    } else {
      const tosDate: Date = new Date();
      user.data.tosDate = tosDate;
      // Make sure the shape has not changed
      const validatedData: IUser = user.data;
      // Save the updated document.
      const updateUser: BscStatusResponse = await this.update(validatedData);
      if (updateUser.status === ApiResultStatus.Failed) {
        logger.error("Users().updateToSDate", { module: thisModule }, { error: user.data || "Unknown Error happened Updating the User.updateToSDate." });
        results.data = user.data || "Unknown Error happened Updating the User.updateToSDate.";
      } else {
        results.status = ApiResultStatus.Success;
        results.data = updateUser.data;
      }
    }
    return results;
  };

  /**
   * When a new Quickbooks customer is created save the Quickbooks customer Id to user details in Mongo.
   *
   * @param id CoreUser user Id.
   * @param qboCustomerId Quickbooks newly created customer Id.
   * @returns BscStatusResponse
   */
  updateQboCustomerId = async (id: string, qboCustomerId: string): Promise<BscStatusResponse> => {
    // Get the user document from MongoDB
    const user: BscStatusResponse = await this.get(id);
    if (user.status === ApiResultStatus.Failed) {
      logger.error("Users().updateqboCustomerId", { module: thisModule }, { error: user.data || `Unknown Error happened Gettting the User details for User.qboCustomerId ${qboCustomerId}.` });
      results.data = user.data || `Unknown Error happened gettting the User Details for User.qboCustomerId ${qboCustomerId}.`;
    } else {
      user.data.qboCustomerId = qboCustomerId;
      const validatedData: IUser = user.data;
      // Update the user document from MongoDB.
      const updateUser: BscStatusResponse = await this.update(validatedData);
      if (updateUser.status === ApiResultStatus.Failed) {
        logger.error("Users().updateQboCustomerId", { module: thisModule }, { error: user.data || `Unknown Error happened Updating the User.qboCustomerId for ${qboCustomerId}.` });
        results.data = user.data || `Unknown Error happened Updating the User.qboCustomerId for ${qboCustomerId}.`;
      } else {
        results.status = ApiResultStatus.Success;
        results.data = updateUser.data;
      }
    }
    return results;
  };

  /**
   * When a new Quickbooks customer is created save the Quickbooks customer Id to user details in Mongo.
   *
   * @param id CoreUser user Id.
   * @param qboCustomerId Quickbooks newly created customer Id.
   * @returns BscStatusResponse
   */
  updateQboAccountId = async (id: string, qboAccountId: string): Promise<BscStatusResponse> => {
    // Get the user document from MongoDB
    const user: BscStatusResponse = await this.get(id);
    if (user.status === ApiResultStatus.Failed) {
      logger.error("Users().updateqboAccountId", { module: thisModule }, { error: user.data || `Unknown Error happened Gettting the User details for User.qboAccountId ${qboAccountId}.` });
      results.data = user.data || `Unknown Error happened gettting the User Details for User.qboCustomerId ${qboAccountId}.`;
    } else {
      user.data.qboAccountId = qboAccountId;
      const validatedData: IUser = user.data;
      // Update the user document from MongoDB.
      const updateUser: BscStatusResponse = await this.update(validatedData);
      if (updateUser.status === ApiResultStatus.Failed) {
        logger.error("Users().updateQboAccountId", { module: thisModule }, { error: user.data || `Unknown Error happened Updating the User.qboAccountId for ${qboAccountId}.` });
        results.data = user.data || `Unknown Error happened Updating the User.qboCustomerId for ${qboAccountId}.`;
      } else {
        results.status = ApiResultStatus.Success;
        results.data = updateUser.data;
      }
    }
    return results;
  };


  /**
   * Get user data for the given ID
   *
   * @param userId User Id
   * @param accessToken Current Access Token
   * @returns user data for the given ID, or null if no data is found
   */
  getUserById = async (userId: string): Promise<IUser> => {
    const doc = await this.db.users.findOne({ id: userId });
    const request = RequestContext?.currentContext?.req;
    const cookie = request?.cookies[CookieName.ActiveTenant];

    if (!doc) {
      logger.error("dalUsers().getIUserData", { module: UserDataService.name }, { error: "Did not find User Details for id = " + userId });
      return null;
    }

    let user: IUser = doc.toObject();
    // handle legacy bad data issues with whmcs and serviceNow being wrong shape or undefined
    user = await this.verifyUserShape(user);

    const tenant = await this.tenantDataService.findByTenantId(cookie?.tenantId || user.activeTenant?.tenantId || user.tenants[0]);
    user.activeTenant = tenant;
    return user;
  };

  /**
   * Verify the shape (IUser) is correct. Some properties are required, but due to
   * changes in process, data may be in varying states
   *
   * @param user
   * @return user
   */
  verifyUserShape = async (user: IUser): Promise<IUser> => {

    if (!user) {
      return user;
    }

    user.whmcs = user.whmcs || { clientId: null, ownerId: null };
    user.whmcs = Array.isArray(user.whmcs) && user.whmcs.length ? user.whmcs.map(n => n).shift() : user.whmcs;
    user.whmcs = Array.isArray(user.whmcs) && !user.whmcs.length ? { clientId: null, ownerId: null } : user.whmcs;
    user.whmcs.clientId = user.whmcs.clientId || null;
    user.whmcs.ownerId = user.whmcs.ownerId || null;

    user.serviceNow = user.serviceNow || { sysId: "", account: "" };
    user.serviceNow = Array.isArray(user.serviceNow) && user.serviceNow.length ? user.serviceNow.map(n => n).shift() : user.serviceNow;
    user.serviceNow = Array.isArray(user.serviceNow) && !user.serviceNow.length ? { sysId: "", account: "" } : user.serviceNow;
    user.serviceNow.sysId = user.serviceNow.sysId || "";
    user.serviceNow.account = user.serviceNow.account || "";

    return user;
  };

  /**
   * Fire off an Email from AppId with the CONTEXT Id to reset the password.
   *
   * @param email Users appId registered email
   * @returns Success or Failed based on AppId response.
   */
  forgotPassword = async (email: string): Promise<ApiResult> => {
    const response = await this.appIdService.forgotPassword(email);
    return response.isSuccess ? ApiResult.success() : ApiResult.failure();
  };

  /**
   * GET UUID from AppId
   *
   * @param context Value of the AppId value to retrieve the uuid.
   * @returns UUID for changePassword method.
   */
  forgotPasswordConfirmResult = async (context: string): Promise<BscStatusResponse> => {
    const response = await this.appIdService.forgotPasswordConfirmResult(context);
    if (response.isSuccess) {
      const _uuid = response.data.uuid;
      results.status = ApiResultStatus.Success;
      results.data = _uuid;
    } else {
      let msg: string = "context is not valid";
      if (response.message) {
        msg = response.message;
      }
      logger.error("dalUsers().forgotPasswordConfirmResult", { module: thisModule }, { error: msg });
      results.status = ApiResultStatus.Failed;
      results.data = msg;
    }
    return results;
  };

  /**
   * Change the users AppId password.
   *
   * @param data IResetPassword shaped json.
   * @returns Success or Fail with AppId response.
   */
  changePassword = async (data: IResetPassword, ip: string): Promise<BscStatusResponse> => {
    // Get the AppId uuid for password change.
    const confirmResult = await this.appIdService.forgotPasswordConfirmResult(data.context);
    if (confirmResult.isFailure) {
      let msg: string = "context is not valid";
      if (confirmResult.message) {
        msg = confirmResult.message;
      }
      logger.error("Users().changePassword myAppID.forgotPasswordConfirmResult", { module: thisModule }, { error: msg });
      results.data = msg;
    } else {
      if (confirmResult.data.uuid) {
        // Change the AppId password.
        const response = await this.appIdService.changePassword(data.password, confirmResult.data.uuid, ip);
        if (response.status !== ApiResultStatus.Success) {
          logger.error("Users().changePassword", { module: thisModule }, { error: response.message || "Unknown myAppID.changePassword() Fail" });
          results.data = response.message || "Unknown myAppID.changePassword() Fail";
        } else {
          results.status = ApiResultStatus.Success;
          results.data = response.status;
        }
      } else {
        logger.error("Users().changePassword", { module: thisModule }, { error: confirmResult.message || "Unknown myAppID.changePassword() Fail" });
        results.data = confirmResult.message || "Unknown myAppID.forgotPasswordConfirmResult Fail";
      }
    }
    return results;
  };

  /**
   * Sets the {@link IUser.viewedWelcome} flag for a user.
   *
   * A failed result will be returned if no user was found
   */
  setViewedWelcome = async (userId: string, viewedWelcome: boolean): Promise<ApiResult> => {
    const getUserResult = await this.get(userId);

    if (getUserResult.status === ApiResultStatus.Failed) {
      logger.error("Users().setViewedWelcome", { module: thisModule }, { error: getUserResult.data });
      return ApiResult.failure(getUserResult.data);
    }

    const user = getUserResult.data as IUser;
    user.viewedWelcome = viewedWelcome;

    const updateResult = await this.update(user);

    return updateResult.status === ApiResultStatus.Success ? ApiResult.success() : ApiResult.failure(updateResult.data);
  };

  // #endregion

  async sendEmailVerification(user: IUser) {
    const getJwtResponse = await this.jwtService.get2faJwt(user.id, user.email, (24 * 60));
    const jwt = getJwtResponse.jwtEncoded;
    const uri = `https://${this.env.cyclr.callbackBaseUrl}/auth?screen=verify-email&uuid=${user.id}&token=${jwt}`;
    const emailTemplateId = "d-2e8ebd95fb074041ae715f998d2936d2";
    const emailTemplateData = {
      uri,
      expiresInStr: "24 hours"
    };

    const emailConfig = {
      user_id: user.id,
      email_id: user.email,
      dynamic_email_data: emailTemplateData,
      dynamic_email_template_id: emailTemplateId,
      title: `Thanks for signing-up!`,
      message: `Please Verify Your Email Address.`,
      action_url: uri
    };
    await this.emailService.sendEmail(emailConfig);
  }
}

export { UserDataService };
