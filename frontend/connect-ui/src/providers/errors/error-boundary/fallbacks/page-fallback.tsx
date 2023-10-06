//
import { Toast } from "@platform/common";
import { observer } from "mobx-react-lite";
import { useErrorsStore } from "@platform/hooks";
import { useUIStore } from "@src/providers";
import { ErrorBoundarySource } from "../../types";
import { useRouter } from "next/router";

type ErrorFallbackProps = {
  error?: any;
  errorInfo?: any;
  resetErrorBoundary?: any;
  statusCode?: any;
};

/**
 * Page level error boundary
 */
const _PageLayoutErrorFallback = ({ error, errorInfo, resetErrorBoundary, statusCode }: ErrorFallbackProps) => {
  if (!error) return null;
  const { env } = useUIStore();
  const isProd = env === "prod";
  const router = useRouter();
  const errorsStore = useErrorsStore();
  const { ErrorText, newStatusCode } = errorsStore.generateError(ErrorBoundarySource.RouteErrorBoundary, error, errorInfo, statusCode, resetErrorBoundary, isProd);
  if (isProd) {
    return <Toast open={true} alertType="warning" position={{ vertical: "top", horizontal: "center" }} onClose={resetErrorBoundary} message={ErrorText} />;
  }
  return <Toast open={true} alertType="error" position={{ vertical: "top", horizontal: "center" }} onClose={resetErrorBoundary} message={ErrorText} />;
};

export const RouteErrorBoundaryFallback = observer(_PageLayoutErrorFallback);
