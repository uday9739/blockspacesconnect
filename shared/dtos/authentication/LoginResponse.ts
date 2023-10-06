import { IUser } from "../../models/users";



/** Extend the IUser to add User properties not in the database. */
export interface ILoginResponse extends IUser {
  /** Snow Authentication */
  snow: {
    /** Email + Salt as SHA1 hash. */
    deUser: string,
    /** Glide SSO determines what Auth script to use in snow. */
    glideSSO: string 
  },
  gatewayUser?:{
    status:string,
    poktGatewayRelayUrlPart:string
  }
};
