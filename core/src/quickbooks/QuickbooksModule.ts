import { forwardRef, Module } from "@nestjs/common";
import { SecretsModule } from "../secrets/SecretsModule";
import { HttpModule } from "../http";
import { QuickbooksService } from "./services/QuickbooksService";
import { QuickbooksClient } from "./clients/QuickbooksClient";
import { QuickbooksClientFactory } from "./clients/QuickbooksClientFactory";
import { QuickbooksController } from "./controllers/QuickbooksController";
import { QuickbooksInvoiceService } from "./services/QuickbooksInvoiceService";
import { LightningNodeModule } from "../networks/lightning/node/LightningNodeModule";
import { LightningQuickbooksService } from "../networks/lightning/integrations/quickbooks/services/LightningQuickbooksService";
import { LightningInvoicesModule } from "../networks/lightning/invoices/LightningInvoicesModule";
import { ConnectDbModule } from "../connect-db/ConnectDbModule";
import { QuickbooksCustomerService } from "./services/QuickbooksCustomerService";
import { QuickbooksLineItemService } from "./services/QuickbooksLineItemService";
import { UsersModule } from "../users";
import { QuickbooksAccountService } from "./services/QuickbooksAccountService";
import { QuickbooksPurchaseService } from "./services/QuickbooksPurchaseService";
import { BitcoinModule } from "../networks/bitcoin/BitcoinModule";

@Module({
  imports: [
    SecretsModule,
    HttpModule,
    LightningNodeModule,
    LightningInvoicesModule,
    ConnectDbModule,
    forwardRef(() => UsersModule),
    BitcoinModule
  ],
  controllers: [
    QuickbooksController
  ],
  providers: [
    LightningQuickbooksService,
    QuickbooksService,
    QuickbooksClient,
    QuickbooksClientFactory,
    QuickbooksInvoiceService,
    QuickbooksCustomerService,
    QuickbooksLineItemService,
    QuickbooksAccountService,
    QuickbooksPurchaseService
  ],
  exports: [QuickbooksCustomerService, QuickbooksInvoiceService, QuickbooksLineItemService, QuickbooksPurchaseService]
})

export class QuickbooksModule { }
