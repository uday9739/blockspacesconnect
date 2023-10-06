import { forwardRef, Module } from '@nestjs/common';
import { ConnectDbModule } from '../connect-db/ConnectDbModule';
import { CyclrModule } from '../cyclr/CyclrModule';
import { ConnectorsController } from './controllers/ConnectorsController';
import { ConnectorsService } from './services/ConnectorsService';

@Module({
  imports: [
    ConnectDbModule, CyclrModule
  ],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
  exports: []
})
export class ConnectorsCatalogModule { };