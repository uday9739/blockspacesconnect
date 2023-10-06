import {logger,transactionLogger,Logger} from "../src/services/bscLogger";
import {jest} from "@jest/globals";

//Make the console quite for testing
logger.info = jest.fn();
logger.debug = jest.fn();
logger.error = jest.fn();
logger.trace = jest.fn();
logger.log = jest.fn();
//Make the console quite for testing
transactionLogger.info = jest.fn();
transactionLogger.debug = jest.fn();
transactionLogger.error = jest.fn();
transactionLogger.trace = jest.fn();
transactionLogger.log = jest.fn();

describe("bscLogger should generate log output", () => {

  const myTestLogger = new Logger();

  it("Logger class should construct", () => {
    expect(myTestLogger).toBeInstanceOf(Logger);
  });


  const spytransactionLogger = jest.spyOn(transactionLogger,'debug');
  transactionLogger.level = "debug";
  transactionLogger.debug("This is a test transaction log.");
  it("logger should log", () => {
    expect(spytransactionLogger).toHaveBeenCalledTimes(1);
  });


  const spylogger = jest.spyOn(logger,'info');
  logger.info(`This is a test log`);

  it("logger should log", () => {
    expect(spylogger).toHaveBeenCalledTimes(1);
  });

});
