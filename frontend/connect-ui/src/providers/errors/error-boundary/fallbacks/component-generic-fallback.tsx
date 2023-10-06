// framework
import { useState } from "react";
// 3rd party
import { Alert, AlertTitle } from "@mui/material";
// app code
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

const _GenericComponentErrorFallback = ({ error, errorInfo, resetErrorBoundary, statusCode }: ErrorFallbackProps) => {
  if (!error) return null;
  const { env } = useUIStore();
  const router = useRouter();
  const isProd = env === "prod";
  const [isOpen, setIsOpen] = useState(false);
  const errorsStore = useErrorsStore();
  const { ErrorText, newStatusCode } = errorsStore.generateError(ErrorBoundarySource.GenericComponentBoundary, error, errorInfo, statusCode, resetErrorBoundary, isProd);
  const msg = isProd ? "Uh oh, Something went wrong" : "Error Loading Component";
  return (
    <>
      <Alert severity="error">
        <AlertTitle>{msg}</AlertTitle>
        Don't worry, support has been notified.
        {isProd === false ? (
          <>
            <br />
            <button onClick={() => setIsOpen(true)}>View Details</button>
          </>
        ) : null}
      </Alert>
      <Toast
        open={isOpen}
        alertType="error"
        position={{ vertical: "top", horizontal: "center" }}
        onClose={() => {
          setIsOpen(false);
          resetErrorBoundary();
        }}
        message={ErrorText}
      />
    </>
  );
};

export const GenericComponentErrorFallback = observer(_GenericComponentErrorFallback);
