import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Tenant, TenantType } from "../../models/tenants";
import { TenantMemberDto, TenantMemberProfileDto } from "./TenantMemberDto";

/**
 * The Profile data provided for the user 
 */
export class TenantDto {
  @IsString()
  @IsOptional()
  tenantId: string;

  @IsString()
  @IsNotEmpty({ message: "Tenant Name is required" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Owner ID is required" })
  ownerId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tenantType: TenantType

  @IsOptional()
  @IsArray()
  members?: TenantMemberDto[]

  static fromTenant(tenant: Tenant): TenantDto {
    if (!tenant) return null;

    const dto = new TenantDto();
    dto.tenantId = tenant.tenantId;
    dto.name = tenant.name;
    dto.ownerId = tenant.ownerId;
    dto.description = tenant.description;
    dto.tenantType = tenant.tenantType;
    dto.members = tenant.users.map((user) => {
      return TenantMemberDto.fromTenantUser(user.email, user.memberStatus, user.userId)
    })

    return dto;
  }
};