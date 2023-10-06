import { Module } from '@nestjs/common';
import { ConnectDbModule } from '../../connect-db/ConnectDbModule';
import { BitcoinModule } from '../../networks/bitcoin/BitcoinModule';
import { ExternalBitcoinController } from './controllers/ExternalBitcoinController';

@Module({
  imports: [ConnectDbModule, BitcoinModule],
  controllers: [ExternalBitcoinController]
})
export class ExternalBitcoinModule {}
