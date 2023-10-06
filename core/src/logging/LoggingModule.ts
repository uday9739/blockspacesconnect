import { forwardRef, Global, Inject, Injectable, Module, Scope } from "@nestjs/common";
import { transactionLogger } from "@blockspaces/shared/loggers/bscLogger";
import * as constants from "./constants";
import { ConnectLogger } from "./ConnectLogger";
import { RequestContextModule } from "nestjs-request-context";

/**
 * Module providing logging related functionality for the app
 */
@Global()
@Module({
  imports: [RequestContextModule],
  providers: [
    {
      provide: constants.DEFAULT_LOGGER_TOKEN,
      /**
       * {@link ConnectLogger} is an implementation class that abstracts {@link logger}
       */
      useClass: ConnectLogger,
      /**
       * {@link Scope.TRANSIENT} allows us to have a unique instance every time {@link DEFAULT_LOGGER_TOKEN} is injected
       * this allows us to call {@link ConnectLogger.setModule} from the controller allowing us to override the module name
       */
      scope: Scope.TRANSIENT
    },
    {
      provide: constants.TRANSACTION_LOGGER_TOKEN,
      useValue: transactionLogger
    }
  ],
  exports: [constants.DEFAULT_LOGGER_TOKEN, constants.TRANSACTION_LOGGER_TOKEN]
})
export class LoggingModule { }