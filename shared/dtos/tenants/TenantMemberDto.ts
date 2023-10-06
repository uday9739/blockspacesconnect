import { TenantMemberStatus } from "../../models/tenants";
import { IUser } from "../../models/users";
import { UserProfileDto } from "../users";

export type TenantMemberProfileDto = Pick<UserProfileDto, "email" | "firstName" | "lastName">;

export class TenantMemberDto {
  memberUserId?: string;
  memberProfile: TenantMemberProfileDto;
  memberStatus: TenantMemberStatus;

  /**
  * Create a new {@link UserProfileDto} from a given user object
  * @returns a new UserProfileDto or null if the given user object is falsey
  */
  static fromUser(user: IUser, memberStatus: TenantMemberStatus): TenantMemberDto {
    if (!user) return null;

    const dto = new TenantMemberDto();
    dto.memberUserId = user.id;
    dto.memberProfile = UserProfileDto.fromUser(user);
    dto.memberStatus = memberStatus;

    return dto;
  }

  static fromTenantUser(email: string, memberStatus: TenantMemberStatus, userId?: string): TenantMemberDto {
    if (!email) return null;

    const dto = new TenantMemberDto();
    dto.memberUserId = userId || '';
    dto.memberProfile = {
      email: email,
      firstName: "",
      lastName: ""
    }
    dto.memberStatus = memberStatus;

    return dto;
  }

}

