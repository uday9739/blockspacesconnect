import { isAxiosError } from "axios";


export const extractErrorMsg = (error: unknown) => {

    if (isAxiosError(error))
        return error.message;

    return (error as any)["message"] || "unknown error";

}