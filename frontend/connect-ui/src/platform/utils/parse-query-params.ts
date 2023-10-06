const parseQueryParams = (params: any) => {
  const parsedParams = new URLSearchParams();

  if (!params) {
    return parsedParams.toString();
  }

  Object.keys(params).forEach((key) => {
    const filter = params[key];

    if (filter === undefined) {
      return;
    }

    if (Array.isArray(filter)) {
      filter.forEach((item) => parsedParams.append(`${key}[]`, item));

      return;
    }

    parsedParams.append(key, filter);
  });

  return parsedParams.toString();
};

export default parseQueryParams