import { Module } from '@nestjs/common';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { WishlistController } from './controllers/WishlistController';
import { WishlistService } from './services/WishlistService';
import { HubSpotModule } from '../hubspot';



@Module({
  imports: [ConnectDbModule, HubSpotModule],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [],
})
export class WishlistModule { }
