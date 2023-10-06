import { forwardRef, Module } from "@nestjs/common";
import { CartModule } from "../cart/CartModule";
import { ConnectSubscriptionModule } from "../connect-subscription/ConnectSubscriptionModule";
import { NotificationsModule } from "../notifications/NotificationsModule";
import { UsersModule } from "../users";
import { StripeController } from "./controllers/StripeController";
import { StripeService } from "./services/StripeService";

@Module({
  imports: [forwardRef(() => CartModule), forwardRef(() => ConnectSubscriptionModule),  forwardRef(() => UsersModule), NotificationsModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule { }
