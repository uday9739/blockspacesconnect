
import axios, { AxiosError, isAxiosError } from "axios";
import config from "config";


export const getApiUrl = (path?: string): string => {
  const trimmedPath = path?.trim();
  console.log('apiurl', trimmedPath, config.API_URL)
  if (!trimmedPath) return config.API_URL;
  return `${config.API_URL}${trimmedPath.startsWith("/") ? "" : "/"}${path}`;
};


const apiService = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});


//#region response
apiService.interceptors.response.use((response) => {
  return Promise.resolve(response.data?.data || response.data)
}
  // (error: AxiosError) => {
  //     const errorResponse = error.response;
  //     const data = errorResponse?.data;
  //     if (ErrorDetails.isErrorDetails(data)) {
  //         return Promise.reject<ErrorDetails>(data);
  //     } else {
  //         return Promise.reject(error);
  //     }
  // }
);
//#endregion

export default apiService;