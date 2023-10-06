import { forwardRef, Module } from "@nestjs/common";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { NetworkCatalogModule } from "../network-catalog/NetworkCatalogModule";
import { ConnectSubscriptionModule } from "../connect-subscription/ConnectSubscriptionModule";
import { StripeModule } from "../stripe/StripeModule";
import { UserNetworksModule } from "../user-network/UserNetworkModule";
import { UsersModule } from "../users/UsersModule";
import { CartController } from "./controllers/CartController";
import { CartService } from "./services/CartService";


@Module({
  imports: [forwardRef(() => UsersModule),
    ConnectDbModule, 
    forwardRef(() => NetworkCatalogModule),  
    forwardRef(() => StripeModule), 
    forwardRef(() => ConnectSubscriptionModule),
    UserNetworksModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule { }
