import { Toast } from "@platform/common";
import { observer } from "mobx-react-lite";
import { useErrorsStore } from "@platform/hooks";
import { ErrorBoundarySource, ErrorType } from "../../types";
import { useRouter } from "next/router";

type ErrorFallbackProps = {
  error?: any;
  errorInfo?: any;
  resetErrorBoundary?: any;
  statusCode?: any;
};

/**
 * Application top level error boundary
 */
const _ApplicationErrorFallback = ({ error, errorInfo, resetErrorBoundary, statusCode }: ErrorFallbackProps) => {
  if (!error) return null;
  const errorsStore = useErrorsStore();
  const router = useRouter();
  const { ErrorText, newStatusCode, type } = errorsStore.generateError(ErrorBoundarySource.ApplicationBoundary, error, errorInfo, statusCode, resetErrorBoundary, false);

  return <Toast open={true} alertType="error" position={{ vertical: "top", horizontal: "center" }} onClose={resetErrorBoundary} message={ErrorText} />;
};

export const ApplicationErrorFallback = observer(_ApplicationErrorFallback);
