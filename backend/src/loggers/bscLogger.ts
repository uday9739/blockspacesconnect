import * as log4js from "log4js";
import LOG4JS_CONFIG from "../../config/log4js-config.json";

/** Class representing Logger. */
class Logger {
  log4js: any;

  /** Create a Logger. */
  constructor() {
    this.log4js = log4js;
    this.log4js.addLayout("json", this.jsonLayout);
    this.log4js.configure(LOG4JS_CONFIG);
  }

  jsonLayout = function (config: {separator: string}) {
    return function (logEvent: any) {
      let logData: Array<any>;
      const output: Record<string, any> = {
        level: logEvent.level.levelStr,
        timeStamp: logEvent.startTime,
        timeUnix: Math.floor(new Date(logEvent.startTime).getTime() / 1000),
        category: logEvent.categoryName,
        message: typeof logEvent.data[0] === "string" ? logEvent.data[0] : "",
      };

      if (output["message"] === "") {
        delete output.message;
        logData = logEvent.data;
      } else {
        logData = logEvent.data.slice(1);
      }

      logData.forEach((item: keyof typeof output) => {
        if (typeof item == "object") {
          Object.keys(item).forEach((key) => {
            const sKey = key;
            output[sKey] = item[key];
          });
        }
      });

      return JSON.stringify(output);
    };
  };

  /**
   * Get a log4js Logger.
   *
   * @param {string} category - .
   */
  getLogger(category: string) {
    this.log4js.getLogger(category).level = process.env.LOG_LEVEL;
    return this.log4js.getLogger(category);
  }
}

const myLogger = new Logger();
const logger = myLogger.getLogger("default");

const myTransactionLogger = new Logger();
const transactionLogger = myTransactionLogger.getLogger("transaction");

export default logger;
export {logger, transactionLogger};
