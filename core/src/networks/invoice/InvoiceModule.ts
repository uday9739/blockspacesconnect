import { Module } from "@nestjs/common";
import { ConnectDbModule } from "../../connect-db/ConnectDbModule";
import { BitcoinModule } from "../bitcoin/BitcoinModule";
import { LightningInvoicesModule } from "../lightning/invoices/LightningInvoicesModule";
import { BitcoinInvoiceController } from './controllers/BitcoinInvoiceController';

@Module({
  imports: [
    BitcoinModule,
    LightningInvoicesModule,
    ConnectDbModule
  ],
  controllers: [ BitcoinInvoiceController ]
})
export class InvoiceModule { }
