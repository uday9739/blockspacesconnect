// types related to user registration

import { UserRegistrationDto, QuickUserRegistrationDto, InviteUserRegistrationDto } from "@blockspaces/shared/dtos/users";
import { Tenant } from "@blockspaces/shared/models/tenants";
import { UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";

/**
 * Data accumulated during the registration process, used to communicate the state of the process
 */
export interface UserRegistrationData {
  formData: UserRegistrationDto | QuickUserRegistrationDto | InviteUserRegistrationDto,
  user?: HydratedDocument<UnregisteredUser>,
  defaultTenant?: HydratedDocument<Tenant>;
  newAppId?: boolean,
}