export const mapURLParameters = ((parameters:any, url:string):string => {
  // logger.debug("started mapURLParameters()", { module: thisConnector });
  let resolvedURL = url;
  if (resolvedURL.indexOf("{") > -1) {
    Object.keys(parameters).map((parameter) => {
      resolvedURL = resolvedURL.replace("{" + parameter + "}", parameters[parameter]);
    });
  }
  // logger.debug("started mapURLParameters()", { module: thisConnector });
  return resolvedURL;
});