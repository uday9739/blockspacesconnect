import { Query, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { DEFAULT_VALIDATION_PIPE_OPTIONS } from "../constants";

/**
 * Route handler parameter decorator. Extracts the entire `query`
 * object from the `req` object and passes it through a validation pipe
 * using the default options ({@link DEFAULT_VALIDATION_PIPE_OPTIONS}).
 *
 * If the query object is valid, the decorated parameter is populated using the values
 * from the query object
 */
export function ValidQuery();

/**
 * Route handler parameter decorator. Extracts a single property from the `query`
 * object property of the `req` object and passes it through a validation pipe
 * using the default options ({@link DEFAULT_VALIDATION_PIPE_OPTIONS}).
 *
 * If the property is valid, the decorated parameter is set to its value
 */
export function ValidQuery(property: string);

/**
 * Route handler parameter decorator. Extracts the entire `query`
 * object from the `req` object and passes it through a validation pipe
 * using the given options.
 *
 * If the query object is valid, the decorated parameter is populated using the values
 * from the query object
 */
export function ValidQuery(options: ValidationPipeOptions);

/**
 * Route handler parameter decorator. Extracts a single property from the `query`
 * object property of the `req` object and passes it through a validation pipe
 * using the given options.
 *
 * If the property is valid, the decorated parameter is set to its value
 */
export function ValidQuery(property: string, options: ValidationPipeOptions);

export function ValidQuery(propertyOrOptions?: string | ValidationPipeOptions, options?: ValidationPipeOptions) {

  // ValidQuery()
  if (!propertyOrOptions) {
    return Query(new ValidationPipe(DEFAULT_VALIDATION_PIPE_OPTIONS));
  }

  if (typeof propertyOrOptions === "string") {
    if (options) {
      // ValidQuery(property: string, options: ValidationPipeOptions)
      return Query(propertyOrOptions, new ValidationPipe(options));
    }

    // ValidQuery(property: string)
    return Query(propertyOrOptions, new ValidationPipe(DEFAULT_VALIDATION_PIPE_OPTIONS));
  }

  // ValidQuery(options: ValidationPipeOptions)
  return Query(new ValidationPipe(propertyOrOptions))
}