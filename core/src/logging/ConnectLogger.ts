import { logger } from "@blockspaces/shared/loggers/bscLogger";
import { RequestContext } from "nestjs-request-context";

/**
 * Implementation class that abstracts {@link logger}.
 */
export class ConnectLogger {
  private module: string;
  constructor();
  constructor(module: string)
  constructor(module?: string) {
    this.module = module || "ConnectLogger";
  }

  /**
   * Hack to override module name. 
   * The goal was to have the class defined as ConnectLogger<T> : where is T is the calling class and derive the name from T for module, 
   * but Typescript is still javascript under the hood and that doesn't work ;(
   * @param module 
   */
  setModule(module: string) {
    this.module = module;
  }

  trace(message: string): void;
  trace(message: string, error: Error): void
  trace(message: string, error: Error, data: any): void
  trace(message: string, error: Error, data: any, module: string): void
  trace(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('trace', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }

  info(message: string): void;
  info(message: string, error: Error): void
  info(message: string, error: Error, data: any): void
  info(message: string, error: Error, data: any, module: string): void
  info(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('warn', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }

  debug(message: string): void;
  debug(message: string, error: Error): void
  debug(message: string, error: Error, data: any): void
  debug(message: string, error: Error, data: any, module: string): void
  debug(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('debug', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }

  warn(message: string): void;
  warn(message: string, error: Error): void
  warn(message: string, error: Error, data: any): void
  warn(message: string, error: Error, data: any, module: string): void
  warn(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('warn', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }


  error(message: string): void;
  error(message: string, error: Error): void
  error(message: string, error: Error, data: any): void
  error(message: string, error: Error, data: any, module: string): void
  error(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('error', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }

  fatal(message: string): void;
  fatal(message: string, error: Error): void
  fatal(message: string, error: Error, data: any): void
  fatal(message: string, error: Error, data: any, module: string): void
  fatal(message: string, error?: Error, data?: any, module?: string): void {
    this.logMsg('fatal', message || error?.message, { error }, { stacktrace: error?.stack }, { module }, { data });
  }


  private logMsg(logLevel: 'trace' | 'warn' | 'debug' | 'info' | 'error' | 'fatal', message: unknown, ...rest: unknown[]): void {
    // we can always inject context here independent of how the calling developer used the log
    // and enforce uniform logs
    const request = RequestContext?.currentContext?.req;
    const paramsToLog = [...rest];
    const user = {
      userId: request?.user?.id,
      email: request?.user?.email,
      tenantId: request?.user?.activeTenant?.tenantId
    };
    const url = request?.originalUrl;
    const hasModule = paramsToLog.filter(x => x["module"]).length > 0;
    const hasUser = paramsToLog.filter(x => x["user"]).length > 0;
    const hasError = paramsToLog.filter(x => x["error"]).length > 0;
    const hasTrace = paramsToLog.filter(x => x["stacktrace"]).length > 0;
    const hasUri = paramsToLog.filter(x => x["url"]).length > 0;


    if (!hasUri) {
      paramsToLog.push({
        url: url
      });
    }

    if (!hasUser) {
      paramsToLog.push({
        user: user
      });
    }

    if (!hasModule) {
      paramsToLog.push({
        module: this.module
      });
    }

    if (request) {
      const body = { ...request?.body };
      delete body?.password; // just in-case remove password
      delete body?.verifyPassword; // just in-case remove password
      // check if body "type":"Buffer", 
      if (Buffer.isBuffer(request?.body) === false)
        paramsToLog.push({
          body: body
        });
    }

    if (logLevel === 'error' || logLevel === 'fatal') {
      let stacktrace: undefined;

      if (hasError) {
        const error = paramsToLog?.filter(x => x["error"])[0];
        if ((error as any)?.stack) {
          stacktrace = (error as any)?.stack;
        }
      }
      if (!hasTrace) {
        paramsToLog.push({
          stacktrace: stacktrace || Error("Common Logger Injected Stack!!").stack
        });
      }
    }

    logger[logLevel](message, ...paramsToLog);
  }

}