import { Alert, AlertTitle } from "@mui/material"
import { extractErrorMsg } from "../utils/Errors"

type ErrorPillProps = {
    errorTitle?: string | null,
    error: unknown
}
const ErrorPill = ({ error, errorTitle = null }: ErrorPillProps) => {
    return (error ? <><Alert severity="error">
        {errorTitle ? <AlertTitle>{errorTitle}</AlertTitle> : <></>}
        {extractErrorMsg(error)}
    </Alert> </> : <></>)
}

export default ErrorPill;