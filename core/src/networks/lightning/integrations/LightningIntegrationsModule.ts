import { Module } from '@nestjs/common';
import { LightningQuickbooksModule } from './quickbooks/LightningQuickbooksModule';

@Module({
  imports: [ LightningQuickbooksModule, ],
})
export class LightningIntegrationsModule { }
