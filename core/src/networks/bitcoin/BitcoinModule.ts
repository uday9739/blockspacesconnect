import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../../connect-db/ConnectDbModule";
import { HttpModule } from "../../http";
import { WebhookModule } from "../../webhooks/WebhookModule";
import { LndModule } from "../lightning/lnd/LndModule";
import { BitcoinController } from "./controllers/BitcoinController";
import { BitcoinInvoiceService } from "./services/BitcoinInvoiceService";
import { BitcoinService } from "./services/BitcoinService";

@Module({
  imports: [HttpModule, ConnectDbModule, LndModule, WebhookModule],
  controllers: [BitcoinController],
  providers: [BitcoinService, BitcoinInvoiceService],
  exports: [BitcoinService, BitcoinInvoiceService]
})
export class BitcoinModule {}