import { logger } from "@blockspaces/shared/loggers/bscLogger";
import { BadGatewayException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common/exceptions";


const data = {
  val1: "val1",
  val2: "val2",
  val3: "val3"
};

describe.skip(`Logger`, () => {
  
  beforeAll(async () => {});

  it(`Logger Log Levels (GOOD)`, async () => {
    // https://www.tutorialspoint.com/log4j/log4j_logging_levels.htm
    // Designates fine-grained informational events that are most useful to debug an application.
    logger.debug("Testing message: debug (GOOD)",{module: "module name"},{data: data});
    // Designates finer-grained informational events than the DEBUG.
    logger.trace("Testing message: trace (GOOD)",{module: "module name"},{data: data});
    // Designates informational messages that highlight the progress of the application at coarse-grained level.
    logger.info("Testing message: info (GOOD)",{module: "module name"},{data: data});
    // Designates potentially harmful situations.
    logger.warn("Testing message: warn (GOOD)",{module: "module name"},{data: data});
  }, 10000);

  it(`Logger Log Levels (BAD)`, async () => {
    // https://www.tutorialspoint.com/log4j/log4j_logging_levels.htm
    // Designates fine-grained informational events that are most useful to debug an application.
    logger.debug("Testing message (BAD): debug");
    // Designates finer-grained informational events than the DEBUG.
    logger.trace("Testing message (BAD): trace");
    // Designates informational messages that highlight the progress of the application at coarse-grained level.
    logger.info("Testing message (BAD): info");
    // Designates potentially harmful situations.
    logger.warn("Testing message (BAD): warn");
    // Designates error events that might still allow the application to continue running.
    logger.error("Testing message (BAD): error");
    // Designates very severe error events that will presumably lead the application to abort.
    logger.fatal("Testing message (BAD): fatal");
  }, 10000);

  it(`Logger Catch Error (GOOD)`, async () => {
    try {
      throw new Error('Testing Catch Error');
    } catch (e) {
      // Designates error events that might still allow the application to continue running.
      logger.error(`${e} (GOOD)`,{stacktrace: e.stack},{data: "data"});
      // Designates very severe error events that will presumably lead the application to abort.
      logger.fatal(`${e} (GOOD)`,{stacktrace: e.stack},{data: "data"});
    }
  }, 10000);

  it(`Logger Catch Error (BAD)`, async () => {
    try {
      throw new Error('Testing Catch Error(BAD)');
    } catch (e) {
      // Designates error events that might still allow the application to continue running.
      logger.error("Some message(BAD)",{error: e.message});
      // Designates very severe error events that will presumably lead the application to abort.
      logger.fatal(e.message );
      // Designates error events that might still allow the application to continue running.
      logger.error("Some message(BAD)");
    }
  }, 10000);

  it(`Logger capture nest BadGatewayException with string (BETTER)`, async () => {
    try {
      throw new BadGatewayException('Catch Bad Gateway Exception');
    } catch (e) {
      logger.fatal("Testing Fatal Message (BETTER)",{error: e},{stacktrace: e.stack},{data: data});
      logger.error("Testing Testing error Message (BETTER)",{error: e},{stacktrace: e.stack},{data: data});
    }
  }, 10000);
 
  it(`Logger capture nest BadGatewayException with string (BAD)`, async () => {
    try {
      throw new BadGatewayException();
    } catch (e) {
      logger.fatal("Testing Fatal Message(BAD)");
      logger.error(`${e.message}(BAD)`);
    }
  }, 10000);

  it(`Logger Capture nest InternalServerErrorException with simple object (BETTER)`, async () => {
    try {
      throw new InternalServerErrorException(data);
    } catch (e) {
      logger.fatal("Fatal Message (BETTER)",{error: e},{stacktrace: e.stack});
      logger.error("Testing error Message (BETTER)",{error: e},{stacktrace: e.stack});
    }
  }, 10000);

  it(`Logger Capture nest InternalServerErrorException with Array (BETTER)`, async () => {
    try {
      throw new InternalServerErrorException([data,data,data]);
    } catch (e) {
      logger.fatal("Fatal Message (BETTER)",{error: e},{stacktrace: e.stack});
      logger.error("Testing error Message (BETTER)",{error: e},{stacktrace: e.stack});
    }
  }, 10000);

  it(`Logger Capture nest UnauthorizedException with Array (BEST)`, async () => {
    try {
      throw new UnauthorizedException(["Custom Message",{val: "email@email.com"},data]);
    } catch (e) {
      logger.fatal("Fatal Message (BEST)",{error: e},{stacktrace: e.stack});
      logger.error("Testing error Message (BEST)",{error: e},{stacktrace: e.stack});
    }
  }, 10000);
});