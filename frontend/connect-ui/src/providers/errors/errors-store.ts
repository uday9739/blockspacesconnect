import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
  onReactionError,
  runInAction,
} from "mobx";
import { RootStore } from "@platform/hooks";
import { useErrorHandler } from "react-error-boundary";
import { ErrorBoundarySource } from "./types";




/** this supposed to be the central mobx eroor handler, i havent seen it fire yet . */
onReactionError(useErrorHandler);

/** the error store as the interface for error handling, could be storage and logging too. */
export class ErrorsStore {
  tempUnhandledApiErrors: { error: any, statusCode: number | string }[] = [];
  root: RootStore;
  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

  }
  generateError(source: ErrorBoundarySource, error, errorInfo, statusCode, resetErrorBoundary, isProd) {
    const serializedError = this.root.errorsFactory.generateError(source, error, errorInfo, statusCode, resetErrorBoundary, isProd);
    return serializedError;
  }
  /**
   * LEGACY
   */
  legacy_addError(error, errorInfo, statusCode, resetErrorBoundary) {
    const serializedError = this.root.errorsFactory.makeError(error, errorInfo, statusCode, resetErrorBoundary);
    return serializedError;
  }

  addUnhandledApiError(error: any, statusCode: number | string) {
    this.tempUnhandledApiErrors.push({
      error,
      statusCode
    });
  }

  clearUnhandledApiError() {
    this.tempUnhandledApiErrors = [];
  }
}