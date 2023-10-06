import { Module } from '@nestjs/common';
import { AuthController } from './auth/AuthController';
import { AuthService } from './auth/AuthService';
import { EnvModule } from './env/EnvModule';
import { GlobalExceptionFilter } from './filters/GlobalExceptionFilter';
import { JwtStrategy } from './auth/JwtStrategy';
import { JwtAuthGuard } from './auth/JwtAuthGuard';
import { JwtModule } from '@nestjs/jwt';
import { LoggingModule } from './logging/LoggingModule';
import { HttpModule } from './http';
import { LightningModule } from './lightning/LightningModule';
import { ProductionDbModule } from './connect-db/ProductionDbModule';
import { AdminDbModule } from './connect-db/AdminDbModule';
import { StagingDbModule } from './connect-db/StagingDbModule';
import { DatabaseModule } from './database/DatabaseModule';
import { MongooseModule } from '@nestjs/mongoose';
import { firstDbConnection, secondDbConnection } from './database/services/mongoose.providers';
import { DataContextModule } from './datacontext/DataContextModule';
import { LndModule } from './lnd/LndModule';
@Module({
  imports: [
    JwtModule,
    EnvModule,
    LoggingModule,
    ProductionDbModule,
    StagingDbModule,
    HttpModule,
    MongooseModule,
    LightningModule,
    DatabaseModule,
    DataContextModule,
    LndModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: "APP_GUARD",
      useClass: JwtAuthGuard
    },
    {
      provide: "APP_FILTER",
      useClass: GlobalExceptionFilter
    }
  ],
})
export class AppModule { }
