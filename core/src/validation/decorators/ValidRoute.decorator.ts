import { UsePipes, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { DEFAULT_VALIDATION_PIPE_OPTIONS } from "../constants";

/**
 * Decorator that binds a validation pipe to the scope of a controller or controller method,
 * depending on its context.
 *
 * The default validation pipe options will be used ({@link DEFAULT_VALIDATION_PIPE_OPTIONS})
 *
 * When `@ValidRoute` is used at the controller level, the validation pipe will be
 * applied to every handler (method) in the controller.
 *
 * When `@ValidRoute` is used at the individual handler level, the pipe
 * will apply only to that specific method.
 *
 */
export function ValidRoute();

/**
 * Decorator that binds a validation pipe to the scope of a controller or controller method,
 * depending on its context.
 *
 * The given validation pipe options will be used ({@link DEFAULT_VALIDATION_PIPE_OPTIONS})
 *
 * When `@ValidRoute` is used at the controller level, the validation pipe will be
 * applied to every handler (method) in the controller.
 *
 * When `@ValidRoute` is used at the individual handler level, the pipe
 * will apply only to that specific method.
 *
 */
export function ValidRoute(options: ValidationPipeOptions);

export function ValidRoute(options?: ValidationPipeOptions) {
  return UsePipes(new ValidationPipe(options || DEFAULT_VALIDATION_PIPE_OPTIONS));
}