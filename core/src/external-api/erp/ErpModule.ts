import { Module } from '@nestjs/common';
import { ConnectDbModule } from '../../connect-db/ConnectDbModule';
import { ErpAccountsController } from './controllers/ErpAccountsController';
import { ErpInvoicesController } from './controllers/ErpInvoicesController';
import { ErpPaymentsController } from './controllers/ErpPaymentsController';
import { ErpSalesReceiptsController } from './controllers/ErpSalesReceiptsController';
import { ErpAccountsService } from './services/ErpAccountsService';
import { ErpInvoicesService } from './services/ErpInvoicesService';
import { ErpPaymentsService } from './services/ErpPaymentsService';
import { ErpSalesReceiptsService } from './services/ErpSalesReceiptsService';
import { ErpPurchasesService } from './services/ErpPurchasesService';
import { ErpPurchasesController } from './controllers/ErpPurchasesController';

@Module({
  imports: [ConnectDbModule],
  providers: [ErpPaymentsService, ErpPurchasesService, ErpAccountsService, ErpInvoicesService, ErpSalesReceiptsService],
  controllers: [ErpAccountsController, ErpPurchasesController, ErpInvoicesController, ErpSalesReceiptsController, ErpPaymentsController]
})
export class ErpModule {}
