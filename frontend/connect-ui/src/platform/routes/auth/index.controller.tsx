import { useRouter } from "next/router";
import LogIn from "./login-view";
import Registration from "./registration";
import ForgotPasswordForm from "./forgot-password-form";
import VerifySuccess from "./verify-success";
import ResetPassword from "./reset-password";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import QuickRegistration from "./quick-registration";
import VerifyEmail from "./verify-email";

export default function AUTH_ROUTES_CONTROLLER() {
  const router = useRouter();
  const { screen } = router.query;

  switch (screen) {
    case "quick-sign-up":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <QuickRegistration />
        </ErrorBoundaryPlus>
      );
    case "sign-up":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <Registration />
        </ErrorBoundaryPlus>
      );

    case "forgot-password":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <ForgotPasswordForm />
        </ErrorBoundaryPlus>
      );

    case "verify-success":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <VerifySuccess />
        </ErrorBoundaryPlus>
      );

    case "reset-password":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <ResetPassword />
        </ErrorBoundaryPlus>
      );

    case "verify-email":
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <VerifyEmail />
        </ErrorBoundaryPlus>
      );

    default:
      return (
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <LogIn />
        </ErrorBoundaryPlus>
      );
  }
}
