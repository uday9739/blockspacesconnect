import { Module } from '@nestjs/common';
import { HttpModule } from '../http';
import { AppIdService } from './services/AppIdService';

@Module({
  imports: [
    HttpModule
  ],
  providers: [AppIdService],
  exports: [AppIdService]
})
export class AppIdModule {}
