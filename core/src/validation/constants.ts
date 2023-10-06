import { ValidationPipeOptions } from "@nestjs/common";

/**
 * Default validation pipe options
 */
export const DEFAULT_VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  transformOptions: {
    enableImplicitConversion: true
  }
};