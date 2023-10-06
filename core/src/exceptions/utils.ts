/* eslint-disable no-redeclare */
import { HttpException } from "@nestjs/common";

/**
 * Creates a new NestJS {@link HttpException} with the given status and error message
 */
export function newHttpException(status: number, message: string, options?: NewHttpExceptionOptions);

/**
 * Creates a new NestJS {@link HttpException} with the given status and error data
 */
export function newHttpException(status: number, data: Record<string, any>, options?: NewHttpExceptionOptions);

/**
 * Creates a new NestJS {@link HttpException} with the given status and error message or data
 */
export function newHttpException(status: number, messageOrData: string | Record<string, any>, options: NewHttpExceptionOptions = DEFAULT_OPTIONS) {
  let exception = new HttpException(messageOrData, status);

  if (!options.log) {
    exception = errorWithoutLogging(exception);
  }

  return exception;
}


/** Returns an error result from a controller with the given HTTP status code and message */
export function returnErrorStatus(status: number, message: string, options?: NewHttpExceptionOptions);

/** Returns an error result from a controller with the given HTTP status code and data */
export function returnErrorStatus(status: number, data: Record<string, any>, options?: NewHttpExceptionOptions);

/** Returns an error result from a controller with a given message or data */
export function returnErrorStatus(status: number, messageOrData: string | Record<string, any>, options = DEFAULT_OPTIONS) {

  if (typeof messageOrData === "string") {
    throw newHttpException(status, messageOrData, options);
  }

  throw newHttpException(status, messageOrData, options);
}



/** the key that will indicate if logging should be disabled */
export const LOGGING_DISABLED_KEY = "loggingDisabled";

/**
 * Adds a flag to an error object that will keep it from being logged by the global exception handler.
 * Typically, this method should be used via {@link newHttpException} and {@link returnErrorStatus}, and not called directly.
 *
 * @example
 * ```
 * throw errorWithoutLogging(new NotFoundException("no data was found"))
 * ```
 */
export function errorWithoutLogging<T extends Error>(err: T): T {

  if (!err) return err;

  const actualError = err;
  (actualError as any)[LOGGING_DISABLED_KEY] = true;
  return actualError;
}

export interface NewHttpExceptionOptions {

  /** if true, the error will be logged by the global exception handler */
  log: boolean
}

const DEFAULT_OPTIONS: NewHttpExceptionOptions = {
  log: true
};