import util from "util";
import _ from "lodash";
import colors from "colors/safe.js";

const defaultLevelColors = {
  ALL: "grey",
  TRACE: "blue",
  DEBUG: "cyan",
  INFO: "green",
  WARN: "yellow",
  ERROR: "red",
  FATAL: "magenta",
  MARK: "grey",
  OFF: "grey",
};

function filterArguments(items) {
  return _(items)
    .filter((item) => (_.isError(item) && item.stack) || !_.isObject(item))
    .compact()
    .value();
}

function formatLogData(data) {
  return util.format(...filterArguments(data));
}

function createDataOverlays(items) {
  const overlay = {};

  _.forEach(items, (item) => {
    if (_.isObject(item)) {
      _.assign(overlay, item);
    }
  });

  return overlay;
}

export default function jsonLayout(config) {
  function formatter(raw) {
    const data = _.clone(raw);
    delete data.logger;

    const messageParam = config.messageParam || "msg";

    const output = {
      timeStamp: data.startTime,
      timeUnix: Math.floor(new Date(data.startTime).getTime() / 1000),
      category: data.categoryName,
      level: data.level.levelStr,
      message: data.data && data.data.length > 0 ? data.data : "",
      module: data.module ? data.module : "",
      event: data.event ? data.event : "",
      response: data.response ? data.response : null,
      pid: data.pid ? data.pid : null,
    };

    if (config.source) {
      output.source = config.source;
    }

    // Emit own properties of config.static if specified
    if (_.has(config, "static")) {
      Object.assign(output, config.static);
    }

    // Emit properties set by using functions defined in 'dynamic'
    if (_.has(config, "dynamic")) {
      // Iterate over the 'dynamic' properties
      _.forIn(config.dynamic, (dynamicFunction, key) => {
        if (_.isFunction(dynamicFunction)) {
          const value = dynamicFunction();
          if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
            output[key] = value;
          }
        }
      });
    }

    const messages = _.isArray(data.data) ? data.data : [data.data];

    output.message = formatLogData(messages);

    if (_.isEmpty(output.message)) {
      delete output.message;
    }

    const overlays = createDataOverlays(messages);

    if (_.has(overlays, messageParam)) {
      output.message = overlays[messageParam];
      delete overlays[messageParam];
    }

    _.assign(output, overlays);

    // Only include fields specified in 'include' field
    // if field is specified
    if (config.include && config.include.length) {
      const newOutput = {};
      _.forEach(config.include, (key) => {
        if (_.has(output, key)) {
          newOutput[key] = output[key];
        }
      });
      return newOutput;
    }

    return output;
  }

  return function layout(data) {
    let output = JSON.stringify(formatter(data));

    // Add color to output; don't use this when logging.
    if (_.has(config, "colors") && config.colors) {
      if (_.has(defaultLevelColors, data.level.levelStr)) {
        const color = defaultLevelColors[data.level.levelStr];
        output = colors[color](output);
      }
    }
    return output;
  };
}
