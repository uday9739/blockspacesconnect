import * as log4js from "log4js";
// import * as LOG4JS_CONFIG from "../config/log4js-config.json";



/**
 * Logger Factory Methods
 * This ensure a single reference to {@link Logger} implementation 
 */
const LoggerFactory = (function () {
  let instance: log4js.Logger;

  function createInstance() {
    const myLogger = new Logger();
    const logger: log4js.Logger = myLogger.getLogger("default");
    return logger;
  }

  return {
    getInstance: function (): log4js.Logger {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

/** Class representing Logger. */
class Logger {
  log4js: any;

  /** Create a Logger. */
  constructor() {
    this.log4js = log4js;
    this.log4js.addLayout("json", this.jsonLayout);
    if (process.env.NODE_ENV !== 'test') {
      this.log4jsConfig.categories.default.level = "warn";
    };
    const LOG4JS_CONFIG = this.log4jsConfig;
    // TODO: Figure out why process.env is showing VSCode server enviroments instead of the APP .env file?
    // LOG4JS_CONFIG.appenders.bscLogfile.filename = process.env.LOG_FILE;
    // LOG4JS_CONFIG.appenders.bscTransactionLogfile.filename = process.env.LOG_TRANSACTION_FILE;
    this.log4js.configure(LOG4JS_CONFIG);
  }

  jsonLayout = function (config: { separator: string }) {
    return function (logEvent: any) {

      let logData: Array<any> = [];
      const output: Record<string, any> = {
        level: logEvent.level.levelStr,
        timeStamp: logEvent.startTime,
        timeUnix: Math.floor(new Date(logEvent.startTime).getTime() / 1000),
        content: { message: typeof logEvent.data[0] === "string" ? logEvent.data[0] : "" }
      };

      if (output["content"]["message"] === "") {
        delete output.content.message;
        logData = logEvent.data;
      } else {
        logData = logEvent.data.slice(1);
      }

      logData.push({ category: logEvent.categoryName });

      logData.forEach((item: keyof typeof output) => {
        if (typeof item === "object") {
          Object.assign(output.content, item);
        }
      });

      return JSON.stringify(output)
    };
  };

  /**
   * Get a log4js Logger.
   *
   * @param {string} category - .
   */
  getLogger(category: string) {
    return this.log4js.getLogger(category);
  }

  private log4jsConfig = {
    "appenders": {
      "bscLogfile": {
        "type": "file",
        "filename": "./logs/bsc.log",
        "layout": {
          "type": "json",
          "separator": ","
        }
      },
      "stdout": {
        "type": "stdout",
        "layout": {
          "type": "json",
          "separator": ","
        }
      },
      "stderr": {
        "type": "stderr",
        "layout": {
          "type": "json",
          "separator": ","
        }
      },
      "bscTransactionLogfile": {
        "type": "file",
        "filename": "./logs/bscTransaction.log",
        "layout": {
          "type": "json",
          "separator": ","
        }
      }
    },
    "categories": {
      "default": {
        "appenders": ["stdout", "stderr", "bscLogfile"],
        "level": "all"
      },
      "transaction": {
        "appenders": ["stdout", "stderr", "bscTransactionLogfile"],
        "level": "all"
      },
      "all": {
        "appenders": ["stdout", "stderr", "bscLogfile"],
        "level": "all"
      }
    }
  }
}


const logger: log4js.Logger = LoggerFactory.getInstance();

const myTransactionLogger = new Logger();
const transactionLogger: log4js.Logger = myTransactionLogger.getLogger("transaction");



export default logger;
export { logger, transactionLogger };
