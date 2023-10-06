import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Request } from "express";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { LOGGING_DISABLED_KEY } from "../utils";

/** A global catch-all exception filter for the entire application */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly httpAdapterHost: HttpAdapterHost
  ) {
    logger.setModule(GlobalExceptionFilter.name);
  }

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    let skipLog = false;
    const ctx = host.switchToHttp();
    const url = ctx.getRequest<Request>().originalUrl;
    const isHttpException = exception instanceof HttpException;
    const request = ctx.getRequest();

    const httpStatus =
      isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: string = exception?.message || "BlockSpaces encountered an unexpected error";

    if (!exception) {
      this.logger.error(message, null, { url });
      httpAdapter.reply(ctx.getResponse(), ApiResult.failure(message), httpStatus);
      return;
    }

    const stack: string = exception.stack || `${exception.toString()}\n    No stack trace available`;

    let responseData: any;

    if (isHttpException) {
      const exceptionJson = exception.getResponse();

      if (typeof exceptionJson === "object") {
        responseData = { ...ApiResult.failure(message), ...exceptionJson };
      } else {
        responseData = ApiResult.failure(message);
      }
    } else {
      responseData = ApiResult.failure(message);
    }

    switch (exception?.name) {
      case "ValidationException":
      case "NotFoundException":
      case "ForbiddenException":
      case "UnauthorizedException": {
        skipLog = true;
        this.logger.warn(message, exception);
        break;
      }
    }
    if (httpStatus === 500) {
      this.logger.fatal(message, exception);
    }
    else if (!skipLog && !exception[LOGGING_DISABLED_KEY]) {
      this.logger.error(message, exception);
    }

    httpAdapter.reply(ctx.getResponse(), responseData, httpStatus);
  }

}