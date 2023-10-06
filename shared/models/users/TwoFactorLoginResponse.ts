import { IUser } from "./User";
export interface TwoFactorLoginResponse {
  user: IUser,

  /** JWT access token that's returned after a successful login */
  accessToken: string
}