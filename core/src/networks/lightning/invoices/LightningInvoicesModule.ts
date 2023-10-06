import { Module } from "@nestjs/common";
import { LightningInvoiceService } from "./services/LightningInvoiceService";
import { BitcoinModule } from "../../bitcoin/BitcoinModule";
import { LightningWalletModule } from "../wallet/LightningWalletModule";
import { LndModule } from "../lnd/LndModule";
import { LightningNodeModule } from "../node/LightningNodeModule";
import { ConnectDbModule } from "../../../connect-db/ConnectDbModule";
import { WebhookModule } from "../../../webhooks/WebhookModule";

// Contains functions that require an INVOICE macaroon
@Module({
  imports: [BitcoinModule, LightningWalletModule, LndModule, LightningNodeModule, ConnectDbModule, WebhookModule],
  providers: [LightningInvoiceService],
  exports: [LightningInvoiceService]
})
export class LightningInvoicesModule { }
