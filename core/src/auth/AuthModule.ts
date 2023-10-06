import { forwardRef, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { BlockSpacesJwtStrategy } from "./strategies/BlockSpacesJwtStrategy";
import { AuthController } from "./controllers/AuthController";
import { LoginService } from "./services/LoginService";
import { JwtService } from "./services/JwtService";
import { AppIdModule } from "../app-id/AppIdModule";
import { JwtLibraryWrapper } from "./services/JwtLibraryWrapper";
import { TwoFactorAuthController } from "./controllers/TwoFactorAuthController";
import { TwoFactorAuthService } from "./services/TwoFactorAuthService";
import { VaultModule } from "../vault/VaultModule";
import { UsersModule } from "../users";
import { AuthorizationModule } from "../authorization/AuthorizationModule";
import { TenantsModule } from "../tenants/TenantsModule";
import { BlockSpacesApiKeyStrategy } from "./strategies/BlockSpacesApiKeyStrategy";
import { ApiKeyService } from "./services/ApiKeyService";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";

@Module({
  imports: [
    PassportModule,
    AppIdModule,
    VaultModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TenantsModule),
    ConnectDbModule,
    AuthorizationModule],
  providers: [
    BlockSpacesJwtStrategy,
    BlockSpacesApiKeyStrategy,
    JwtService,
    JwtLibraryWrapper,
    LoginService,
    ApiKeyService,
    TwoFactorAuthService
  ],
  controllers: [AuthController, TwoFactorAuthController],
  exports: [JwtService, ApiKeyService]
})
export class AuthModule { }
