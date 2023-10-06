import { StatusCodes } from "http-status-codes";

export type TExecutableConnectionResponse = {
  responseCode: string;
  message: string;
  data: any;
};

export class ExecutableConnectionResponse implements TExecutableConnectionResponse {
  responseCode: string = StatusCodes.OK.toString();
  message: string = "";
  data: any = null;

  public static Success(message: string, data: any): ExecutableConnectionResponse {
    return {
      message,
      data,
      responseCode: StatusCodes.OK.toString()
    }
  }

  public static Failure(
    message: string,
    data: any = null,
    responseCode: string = StatusCodes.INTERNAL_SERVER_ERROR.toString()
  ): ExecutableConnectionResponse {
    return {message, data, responseCode}
  }
}
