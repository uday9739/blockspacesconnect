import { StatusCodes } from "http-status-codes";
/**
 *
 */
export enum ErrorBoundarySource {
  /**
   * ROOT Level Error Boundary, Red screen of Death
   */
  ApplicationBoundary = "Application Global Error Boundary",
  /**
   * Page/Route Level Error Boundary, Only the route/page is trapped
   * User will still be able to navigate using global nav
   */
  RouteErrorBoundary = "Route Error Boundary",
  /**
   * Component Level granular error boundary
   */
  GenericComponentBoundary = "Generic Component Error Boundary"
}
/** this is an internal error type, abstracted from other, could be a modifier */
export enum ErrorType {
  AXIOS_ERROR = "AxiosError",
  REACT_ERROR = "ReactError",
  NEXT_ERROR = "NextError"
}
/** implementing the StatusCodes library. a start. */
export type StatusCode = StatusCodes | undefined;