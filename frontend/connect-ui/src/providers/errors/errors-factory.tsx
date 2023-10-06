import { RootStore } from "@platform/hooks";
import { makeAutoObservable, runInAction } from "mobx";
import { v4 as uuid } from "uuid";
import { StatusCodes } from "http-status-codes";
import { ErrorBoundarySource, ErrorType, StatusCode } from "./types";

/**
 * the errors factory where the error views are being produced
 */
export function errorsFactory(root: RootStore) {
  return makeAutoObservable({
    generateError(source: ErrorBoundarySource, error, errorInfo, statusCode: any | StatusCodes, resetErrorBoundary, isProd: boolean) {
      const type = this.getType(error, statusCode);
      const newStatusCode = this.getStatusCode(error, type, resetErrorBoundary, statusCode);
      const message = this.getMessage(error, type, newStatusCode);
      const newResetErrorBoundary = this.getResetErrorBoundary(error, type, newStatusCode, resetErrorBoundary);
      return {
        ErrorText: this.getErrorText(error, type, newStatusCode, message, newResetErrorBoundary, errorInfo, source, isProd),
        newStatusCode,
        type
      };
    },

    /**
     * LEGACY
     */
    makeError(error, errorInfo, statusCode: any | StatusCodes, resetErrorBoundary) {
      const type = this.getType(error, statusCode);
      const id = uuid();
      const newStatusCode = this.getStatusCode(error, type, resetErrorBoundary, statusCode);
      const message = this.getMessage(error, type, newStatusCode);
      const newResetErrorBoundary = this.getResetErrorBoundary(error, type, newStatusCode, resetErrorBoundary);
      const ErrorText = this.getErrorText(error, type, newStatusCode, message, newResetErrorBoundary, errorInfo, false);
      const serializedError = {
        ErrorText,
        newResetErrorBoundary
      };
      return serializedError;
    },

    /** this generates the type of an error */
    getType(error, statusCode): ErrorType {
      if (error?.name === ErrorType.AXIOS_ERROR) {
        return ErrorType.AXIOS_ERROR;
      } else if (StatusCodes[statusCode]) {
        return ErrorType.NEXT_ERROR;
      } else {
        return ErrorType.REACT_ERROR;
      }
    },

    /** this generates the status of the error */
    getStatusCode(error, type, resetErrorBoundary, statusCode): StatusCode {
      let newStatusCode;
      if (type === ErrorType.AXIOS_ERROR) {
        newStatusCode = error.response.status as StatusCodes;
      } else if (statusCode && StatusCodes[statusCode]) {
        newStatusCode = StatusCodes[statusCode];
      } else if (statusCode) {
        newStatusCode = statusCode;
      } else {
        newStatusCode = undefined;
      }
      return newStatusCode;
    },

    /** this generates the message of the error, see ErrorText */
    getMessage(error, type, statusCode) {
      let message;
      if (type === ErrorType.AXIOS_ERROR) {
        message = error.message;
      } else if (type === ErrorType.REACT_ERROR) {
        message = "react error on page";
      } else if (type === ErrorType.NEXT_ERROR) {
        message = "next error on page";
      } else {
        message = "unidentified error";
      }
      return message;
    },

    /** this generates the resetting function foir the error. need to experiment with this more. had the error as observable and this seemed to work. being observable interfered with getDerivedStateFromError
     * in the ErrorBoundry. had to remove it. now this doesnt work.but routing back to same page might work.need to experiment if ther is a use case where we want custom reset.
     */
    getResetErrorBoundary(error, type, statusCode, resetErrorBoundary) {
      let newResetErrorBoundary;
      if (type === ErrorType.AXIOS_ERROR) {
        newResetErrorBoundary = () => {
          runInAction(() => (error = null));
        };
      } else {
        newResetErrorBoundary = resetErrorBoundary;
      }

      return newResetErrorBoundary;
    },

    /** this kicks off the error view generation */
    getErrorText(error, type, statusCode, message, newResetErrorBoundary, errorInfo, source, isProd = true): JSX.Element {
      return (
        <ErrorText
          isProd={isProd}
          source={source}
          message={message}
          statusCode={statusCode}
          resetErrorBoundary={newResetErrorBoundary}
          stack={error.stack}
          componentStack={errorInfo?.componentStack}
        />
      );
    }
  });
}

/** method to display stack traces */
const sliceErrorStack = (stackTrace = "", numLines = 10) => {
  const lines = stackTrace.split("\n");
  const firstNLines = lines.slice(0, numLines);
  const joinedLines = firstNLines.join("\n");
  return joinedLines;
};

/** this can ba expanded to assign specific action descriptions in text based on status code, or more modifiers */
const actions = (statusCode: StatusCodes) => {
  switch (statusCode) {
    case StatusCodes.UNAUTHORIZED:
      return "You will be redirected to the login page.";

    default:
      return 'You can try clicking "Reset the Components" to return to the page you were on previously.';
  }
};

/** this modifies the description on the button in error. */
const buttons = (statusCode) => {
  switch (statusCode) {
    case StatusCodes.UNAUTHORIZED:
      return "Login";

    default:
      return "Reset the Components";
  }
};

/** this is where the text for the error is assembled. */
const ErrorText = ({ isProd, source, statusCode, message, resetErrorBoundary, stack, componentStack }) => {
  return (
    <>
      <div>
        <h2>{source}</h2>
        <div>
          <p>The application detected an error, and it's been reported to Blockspaces support team. {actions(statusCode)}</p>
          <p>If the error keeps occurring, please file a bug report with the following details, and include any steps to reproduce the issue:</p>
          {statusCode && <p> statusCode is {statusCode} </p>}
          <button onClick={resetErrorBoundary}> {buttons(statusCode)}</button>
          {isProd === false ? (
            <>
              <br />
              <br />
              <h3> Error Details </h3>
              <h5> Message: </h5>
              <pre> {message} </pre>
              {stack && (
                <details>
                  <summary>Error Stack Traces</summary>
                  <h5>Stack Trace</h5>
                  <pre>{sliceErrorStack(stack)}</pre>
                  {componentStack && (
                    <>
                      <h4>Component Stack</h4>
                      <pre>{sliceErrorStack(componentStack)}</pre>
                    </>
                  )}
                </details>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};
