import config from "config";

export const getApiUrl = (path: string): string => {
  const trimmedPath = path?.trim();

  if (!trimmedPath) return config.API_URL;

  return `${config.API_URL}${trimmedPath.startsWith("/") ? "" : "/"}${path}`;
};
