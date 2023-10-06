import { forwardRef, Module } from '@nestjs/common';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { QuickbooksModule } from '../quickbooks/QuickbooksModule';
import { StripeModule } from '../stripe/StripeModule';
import { NetworkCatalogController } from './controllers/NetworkCatalogController';
import { NetworkCatalogDataService } from './services/NetworkCatalogDataService';
import { NetworkCuratedResourcesDataServices } from './services/NetworkCuratedResourcesDataServices';

@Module({
  imports: [
    ConnectDbModule, forwardRef(() => StripeModule),
    QuickbooksModule,
  ],
  controllers: [NetworkCatalogController],
  providers: [NetworkCatalogDataService, NetworkCuratedResourcesDataServices],
  exports: [NetworkCatalogDataService, NetworkCuratedResourcesDataServices]
})
export class NetworkCatalogModule { };