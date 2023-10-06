import { Module } from '@nestjs/common';
import { BipApiModule } from './bip/BipApiModule';
import { ExternalBitcoinModule } from './bitcoin/ExternalBitcoinModule';
import { ErpModule } from './erp/ErpModule';

@Module({
  imports: [ ErpModule, ExternalBitcoinModule, BipApiModule ],
})
export class ExternalApiModule { }
