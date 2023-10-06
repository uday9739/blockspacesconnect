import { Module } from "@nestjs/common";
import { LightningModule } from "./lightning/LightningModule";
import { BitcoinModule } from "./bitcoin/BitcoinModule";
import { PoktModule } from "./pokt/PoktModule";
import { PoktGatewayModule } from "./poktGateway/PoktGatewayModule";
import { InvoiceModule } from "./invoice/InvoiceModule";


/**
 * This module encapsulates all modules that contain resources related to blockchain networks (i.e. Pokt, Lightning, etc)
 */
@Module({
  imports: [
    LightningModule,
    BitcoinModule,
    PoktModule,
    PoktGatewayModule,
    InvoiceModule
  ]
})
export class NetworksModule {}
