import { QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { useUIStore } from "@ui";
import { ToastProps } from "@platform/common";
import { useEffect } from "react";

export interface RegistrationErrorMessageProps {
  failureReason: UserRegistrationFailureReason;
  formData: UserRegistrationDto | QuickUserRegistrationDto;
  onHide?: () => void;
}

/**
 * Displays an error message based on a registration failure reason
 */
export function RegistrationErrorMessage(props: RegistrationErrorMessageProps) {
  const UI = useUIStore();

  useEffect(() => {
    const { failureReason } = props;

    if (!failureReason) {
      return;
    }

    const toastProps: ToastProps = {
      message: "",
      alertType: "error",
      position: { vertical: "top", horizontal: "center" },
      onClose: props.onHide
    };

    switch (failureReason) {
      case UserRegistrationFailureReason.ALREADY_REGISTERED: {
        // TODO figure out how to utilize Next.js <Link> component instead of <a>
        // NOTE: as of 10/5/2022, attempts to use the Link component with a toast message caused the app to crash with a RangeError

        toastProps.alertType = "warning";
        toastProps.message = (
          <>
            An account is already registered for {props.formData?.email}.
            <p>
              You may wish to try <a href="/auth">logging in</a>&nbsp; or <a href="/auth?screen=forgot-password">resetting your password</a>.
            </p>
          </>
        );

        break;
      }

      default: {
        // TODO add a link for contacting customer support
        toastProps.message = (
          <>
            Registration failed to complete successfully. Please try again.
            <p>If the problem persists, please contact customer support.</p>
          </>
        );
        break;
      }
    }

    UI.showToast(toastProps);
  }, [props.failureReason]);

  return <></>;
}
