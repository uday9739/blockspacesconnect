import { PartialDeep } from "type-fest";
import { IUser } from "./User";

/**
 * Represents a user that has not completed registration
 *
 * All properties are optional, so that user data can be progressively constructed
 * during the registration process
 */
//export type UnregisteredUser = PartialDeep<IUser> & { registered?: false };
export interface UnregisteredUser extends PartialDeep<IUser> {
  email: string;
  registered?: false;
  gaScore?: number;
}