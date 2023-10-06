export const CONFIG_DIR_PATH = `${process.cwd()}/config/`;
export const HTTP_REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  HEAD: "HEAD",
  CONNECT: "CONNECT",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  PATCH: "PATCH",
};
export const HTTP_REQUEST_ACTIONS = {
  "GET": "read",
  "POST": "write",
  "PUT": "write",
  "PATCH": "write",
  "DELETE": "write",
};
