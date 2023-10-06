import { Module } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';

@Module({
  imports: [],
  providers: [CustomerSupportService],
  exports: [CustomerSupportService]
})
export class CustomerSupportModule { }
