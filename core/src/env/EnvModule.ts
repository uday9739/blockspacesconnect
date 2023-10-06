import { Global, Module } from "@nestjs/common";
import { env, ENV_TOKEN } from "./env";

/**
 * This module provides global access to environment variables via the `ENV_TOKEN` injection token
 */
@Global()
@Module({
  providers: [
    {
      provide: ENV_TOKEN,
      useValue: env
    }
  ],
  exports: [ENV_TOKEN]
})
export class EnvModule {}