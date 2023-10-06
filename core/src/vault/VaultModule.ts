import { Module } from '@nestjs/common';
import { HttpModule } from '../http';
import { VaultService } from './services/VaultService';

/**
 * Module providing services for interacting with the Hashicorp Vault system
 */
@Module({
  imports: [HttpModule],
  providers: [VaultService],
  exports: [VaultService]
})
export class VaultModule {}
