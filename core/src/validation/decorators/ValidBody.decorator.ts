import { Body, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { DEFAULT_VALIDATION_PIPE_OPTIONS } from "../constants";

/**
 * Route handler parameter decorator. Extracts the entire `body`
 * object from the `req` object and passes it through a validation pipe
 * using the default options ({@link DEFAULT_VALIDATION_PIPE_OPTIONS}).
 *
 * If the body is valid, the decorated parameter is populated using the values
 * from the request body
 */
export function ValidBody();

/**
 * Route handler parameter decorator. Extracts a single property from the `body`
 * object property of the `req` object and passes it through a validation pipe
 * using the default options ({@link DEFAULT_VALIDATION_PIPE_OPTIONS}).
 *
 * If the property is valid, the decorated parameter is set to its value
 */
export function ValidBody(property: string);

/**
 * Route handler parameter decorator. Extracts the entire `body`
 * object from the `req` object and passes it through a validation pipe
 * using the given options.
 *
 * If the body is valid, the decorated parameter is populated using the values
 * from the request body
 */
export function ValidBody(options: ValidationPipeOptions);

/**
 * Route handler parameter decorator. Extracts a single property from the `body`
 * object property of the `req` object and passes it through a validation pipe
 * using the given options.
 *
 * If the property is valid, the decorated parameter is set to its value
 */
export function ValidBody(property: string, options: ValidationPipeOptions);

export function ValidBody(propertyOrOptions?: string | ValidationPipeOptions, options?: ValidationPipeOptions) {

  // ValidBody()
  if (!propertyOrOptions) {
    return Body(new ValidationPipe(DEFAULT_VALIDATION_PIPE_OPTIONS));
  }

  if (typeof propertyOrOptions === "string") {
    if (options) {
      // ValidBody(property: string, options: ValidationPipeOptions)
      return Body(propertyOrOptions, new ValidationPipe(options));
    }

    // ValidBody(property: string)
    return Body(propertyOrOptions, new ValidationPipe(DEFAULT_VALIDATION_PIPE_OPTIONS));
  }

  // ValidBody(options: ValidationPipeOptions)
  return Body(new ValidationPipe(propertyOrOptions))
}