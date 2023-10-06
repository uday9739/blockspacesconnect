import { Toast } from "@platform/common"
import { observer } from "mobx-react-lite"
import { useErrorsStore } from "@platform/hooks"

type ErrorFallbackProps = {
  error?: any;
  errorInfo?: any;
  resetErrorBoundary?: any;
  statusCode?: any;
}
/** this is main ErrorFallback. used by everyone. */
const ErrorFallback = observer(({ error, errorInfo, resetErrorBoundary, statusCode }: ErrorFallbackProps)=>
{
  /** filtering out fake error events*/
  if (!error) return null

  const errorsStore = useErrorsStore();
  /** it gets the generated error view */
  
  const { ErrorText } = errorsStore.legacy_addError(error, errorInfo, statusCode, resetErrorBoundary);

  /** Toast is used to display the error */
  return (
    <Toast open={ true } alertType="error" position={ { vertical: 'top', horizontal: 'center' } } onClose={ resetErrorBoundary } message={  ErrorText } />
  )
})
export {ErrorFallback}