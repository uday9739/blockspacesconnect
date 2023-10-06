import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from "@nestjs/common";
import { Observable, throwError, TimeoutError, timeout, catchError } from "rxjs";

/**
 * Timout Interceptor. If a request that comes in takes more than 5 seconds, a `408 Request Timeout` will be thrown.
 * {@link} https://docs.nestjs.com/interceptors#more-operators
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMillis: number = 5000) { }

  // TODO figure out why this line was errant
 // intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
 //  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
 //    return next.handle().pipe(
 //      timeout(this.timeoutMillis),
 //      catchError(err => {
 //        if (err instanceof TimeoutError) {
 //          return throwError(() => new RequestTimeoutException())
 //        }
 //        return throwError(() => err)
 //      })
 //    )
 //  }
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any | never> {
    return next.handle().pipe(
      timeout(this.timeoutMillis),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(new RequestTimeoutException());
        }
        return throwError(err);
      })
    );
  }
}