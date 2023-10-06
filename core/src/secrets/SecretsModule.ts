import { Module } from '@nestjs/common';
import { SecretService } from './services/SecretService';
import { VaultModule } from '../vault/VaultModule';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';

@Module({
  imports: [
    VaultModule,
    ConnectDbModule,
  ],
  providers: [SecretService],
  exports: [SecretService],
})
export class SecretsModule {}
