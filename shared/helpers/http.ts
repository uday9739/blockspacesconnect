/*******************************
 * HTTP/Axios utility library
 *******************************/

import { HttpStatus } from "../types/http";

/** Returns true if the HTTP status code represents an error status */
export function isErrorStatus(status: number | HttpStatus) {
  return status >= 400;
}

/** Returns true if the HTTP status code represents a successful status */
export function isSuccessStatus(status: number | HttpStatus) {
  return status < 300;
}

/**
 * Creates an Axios status validator that will return true if HTTP status code for a response
 * is either a 2xx status or is one of the provided status codes.
 *
 * Use this method to prevent throwing exceptions in cases where specific non-200 status codes
 * are expected to be returned from an endpoint.
 *
 * This is primarily intended for use with the Axios `validateStatus` request config option
 * @see https://github.com/axios/axios#handling-errors
 *
 * @example
 * ```
 * axios.request({
 *   // this would prevent Axios from throwing when a 401 (unauthorized) status is returned
 *   validateStatus: validateStatusCodes(HttpStatus.UNAUTHORIZED),
 *
 *   // other config options...
 * })
 * ```
 */
export function validateStatusCodes(...otherStatusCodes: Array<number | HttpStatus>): HttpStatusCodeValidator {
  return (statusCode: number) => statusCode < 300 || otherStatusCodes.includes(statusCode)
}

/**
 * A function that returns true if HTTP responses with the given status code should be
 * considered valid (i.e. not result in an exception being thrown)
 */
export type HttpStatusCodeValidator = (statusCode: number | HttpStatus) => boolean