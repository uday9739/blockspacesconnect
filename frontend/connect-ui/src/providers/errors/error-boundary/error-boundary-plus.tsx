import { ErrorInfo } from "react";
import { withRouter } from "next/router";
import { ErrorBoundary } from "react-error-boundary";
import { datadogRum } from "@datadog/browser-rum";
import { useErrorsStore } from "@platform/hooks";

const withErrorStoreHooksHOC = (Component: any) => {
  return (props: any) => {
    const errorStore = useErrorsStore();
    return <Component errorStore={errorStore} {...props} />;
  };
};

/** this is extending the react-error-boundary to handle promise rejection through a listener */
class ErrorBoundaryPlus extends ErrorBoundary {
  static state: { error: Error };

  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    /** this is updating the state. fallback ui will be shown on next render */
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group("ErrorBoundary");
    console.error(error);
    console.error(errorInfo);
    console.groupEnd();
    datadogRum?.addError(error);
  }

  //#region Catch Unhandled Axios Errors.
  componentDidMount(): void {
    window?.addEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    window?.removeEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    let setError = true;
    if (event?.reason?.name === "AxiosError") {
      if (event.reason.response?.status === 401) {
        setError = false;
        (this.props as any)?.router?.push("/auth");
      } else {
        (this.props as any)?.errorStore?.addUnhandledApiError(event?.reason?.response?.data, event.reason.response?.status);
        setError = false;
      }
    }

    if (setError) {
      this.setState({
        error: event.reason
      });
    }
  };
  //#endregion

  render() {
    const { error } = this.state;

    if (error && (error as any).statusCode !== 401) {
      return <this.props.FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
  
    return this.props.children;
  }
}

const _ErrorBoundaryPlus = withErrorStoreHooksHOC(withRouter(ErrorBoundaryPlus));
export { _ErrorBoundaryPlus as ErrorBoundaryPlus };
