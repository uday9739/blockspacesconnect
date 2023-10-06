import { AuthorizationModule } from "../authorization/AuthorizationModule";
import { forwardRef, Module } from "@nestjs/common";
import { AppIdModule } from "../app-id/AppIdModule";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { TenantsModule } from "../tenants";
import { VaultModule } from "../vault/VaultModule";
import { UserController } from "./controllers/UserController";
import { UserDataService } from "./services/UserDataService";
import { HttpModule } from "../http";
import { ConnectSubscriptionModule } from "../connect-subscription/ConnectSubscriptionModule";
import { AuthModule } from "../auth";


@Module({
  imports: [
    HttpModule,
    ConnectDbModule,
    TenantsModule,
    AuthorizationModule,

    // TODO AppIdModule should probably not be used here directly; instead, other services/modules should provide more general functionality that uses AppId behind the scenes
    AppIdModule,

    // TODO Vault module should probably not be used here; instead, a more general module like "SecretModule" should be used
    VaultModule,

    forwardRef(() => ConnectSubscriptionModule),

    forwardRef(() => AuthModule)
  ],
  providers: [
    UserDataService
  ],
  controllers: [UserController],
  exports: [UserDataService]
})
export class UsersModule { }
