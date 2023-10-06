import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { Request } from "express";
import ApiResult from '@blockspaces/shared/models/ApiResult';

//https://docs.nestjs.com/exception-filters#catch-everything
@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {
    logger.setModule(this.constructor.name); }

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const message: string = exception?.message || "BlockSpaces encountered an unexpected error";
    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let results: ApiResult = ApiResult.failure();
    let errorData: any = null;
    const stack: string = exception.stack || `${exception.toString()}\n    No stack trace available`;
    let shouldLogError = true;
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    switch (httpStatus) {
      case HttpStatus.INTERNAL_SERVER_ERROR: {
        /*
        * this is for generic and/or unhandled exception, we will not have access to exception.getResponse()
        */
        errorData = responseBody;
        break;
      }
      default: {
        // getResponse() is only part of classes that have a base class of HttpException
        errorData = exception.getResponse();
      }
    }

    results = ApiResult.failure(message, errorData);


    switch (exception?.name) {
      case "ValidationException": {
        shouldLogError = false;
        break;
      }
    }


    if (shouldLogError) this.logger.error(message);

    httpAdapter.reply(ctx.getResponse(), results, httpStatus);
  }
}
