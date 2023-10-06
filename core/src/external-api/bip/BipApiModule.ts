import { Module } from '@nestjs/common';
import { LightningInvoicesModule } from '../../networks/lightning/invoices/LightningInvoicesModule';
import { BipApiController } from './controllers/BipApiController'

@Module({
  imports: [
    LightningInvoicesModule
  ],
  providers: [],
  controllers: [BipApiController]
})
export class BipApiModule { }
