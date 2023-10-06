import { forwardRef, Module } from "@nestjs/common";
import { AppIdModule } from "../app-id/AppIdModule";
import { AuthorizationModule } from "../authorization/AuthorizationModule";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { UserRegistrationModule } from "../user-registration/UserRegistrationModule";
import { UsersModule } from "../users";
import { VaultModule } from "../vault/VaultModule";
import { TenantService, TenantMemberService, TenantController, TenantMemberController } from "./";
import { TenantPermissionsController } from "./controllers";
import { TenantPermissionsService } from "./services";

@Module({
  imports: [
    AuthorizationModule,
    VaultModule,
    AppIdModule,
    ConnectDbModule,
    // UserRegistrationModule,
  ],
  providers: [
    TenantService,
    TenantMemberService,
    TenantPermissionsService,
  ],
  exports: [
    TenantService,
    TenantMemberService,
    TenantPermissionsService,
  ],
  controllers: [
    TenantController,
    TenantMemberController,
    TenantPermissionsController,
  ]
})
export class TenantsModule { }
