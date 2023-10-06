import { Module } from "@nestjs/common";
import { HttpModule } from "../../../../http";
import { LightningInvoicesModule } from "../../invoices/LightningInvoicesModule";
import { SecretsModule } from "../../../../secrets/SecretsModule";
import { LightningQuickbooksService } from "./services/LightningQuickbooksService";
import { ConnectDbModule } from "../../../../connect-db/ConnectDbModule";
import { env } from "../../../../env";
import { LightningNodeModule } from "../../node/LightningNodeModule";
import { QuickbooksInvoiceService } from "../../../../quickbooks/services/QuickbooksInvoiceService";
import { QuickbooksClient } from "../../../../quickbooks/clients/QuickbooksClient";
import { QuickbooksClientFactory } from "../../../../quickbooks/clients/QuickbooksClientFactory";
import { QuickbooksPurchaseService } from "../../../../quickbooks/services/QuickbooksPurchaseService";
import { LndService } from "../../lnd/services/LndService";
import { LndModule } from "../../lnd/LndModule";
import { BitcoinModule } from "../../../bitcoin/BitcoinModule";

@Module({
  imports: [
    HttpModule.register({ baseURL: env.quickbooks.apiBaseUrl }),
    SecretsModule,
    LightningInvoicesModule,
    ConnectDbModule,
    LightningNodeModule,
    LndModule,
    BitcoinModule
  ],
  providers: [
    QuickbooksClient,
    QuickbooksClientFactory,
    QuickbooksInvoiceService,
    QuickbooksPurchaseService,
    LightningQuickbooksService,
    LndService
  ]
})
export class LightningQuickbooksModule {}
