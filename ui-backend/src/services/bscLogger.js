import log4js from "log4js";
import jsonLayout from "./jsonLayout.js";

const log4jsJsonLayout = {
  type: "json",
  static: {},
  dynamic: {
    module: function (module) {
      return module;
    },
    event: function (event) {
      return event;
    },
    action: function (action) {
      return action;
    },
    context: function (context) {
      return context;
    },
    error: function (error) {
      return error;
    },
    user: function (user) {
      return user;
    },
    billing: function (billing) {
      return billing;
    },
    response: function (response) {
      return response;
    },
  },
  include: ["timeStamp", "timeUnix", "level", "category", "message", "module", "event", "action", "context", "error", "user", "billing", "response", "pid"],
};

const LOG4JS_CONFIG = {
  appenders: {
    bscLogfile: {
      type: "file",
      filename: "./logs/bsc.log",
      layout: {
        type: "json",
        separator: ",",
      },
    },
    stdout: {
      type: "stdout",
      layout: {
        type: "json",
        separator: ",",
      },
    },
    stderr: {
      type: "stderr",
      layout: {
        type: "json",
        separator: ",",
      },
    },
    bscTransactionLogfile: {
      type: "file",
      filename: "./logs/bscTransaction.log",
      layout: {
        type: "json",
        separator: ",",
      },
    },
  },
  categories: {
    default: {
      appenders: ["stdout", "bscLogfile"],
      level: "debug",
    },
    transaction: {
      appenders: ["bscTransactionLogfile","bscLogfile"],
      level: "info",
    },
    all: {
      appenders: ["stdout", "stderr", "bscLogfile"],
      level: "all",
    },
  },
};

/** Class representing Logger. */

class Logger {
  /** Create a Logger. */
  constructor() {
    this.logger = log4js;
    this.logger.addLayout("json", jsonLayout);
    this.logger.configure(process.env.LOG4JS_CONFIG || LOG4JS_CONFIG);
  }
  /**
   * Get a log4js Logger.
   *
   * @param {string} category - .
   */
  getLogger(category, LOG_LEVEL) {
    this.logger.getLogger(category).level = LOG_LEVEL || process.env.LOG_LEVEL;
    return this.logger.getLogger(category);
  }
  /**
   * Connect Logger.
   *
   * @param {logger} logger - .
   * @param {string} level - .
   */
  static connnectLogger(logger, LOG_LEVEL) {
    return log4js.connectLogger(logger, {level: LOG_LEVEL});
  }
}

const myLogger = new Logger();
const logger = myLogger.getLogger("default");

const myTransactionLogger = new Logger();
const transactionLogger = myTransactionLogger.getLogger("transaction","debug");

export default logger;
export {logger, transactionLogger, Logger};
