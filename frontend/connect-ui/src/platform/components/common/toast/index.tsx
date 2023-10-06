import { Close as CloseIcon } from "@mui/icons-material";
import { Alert, AlertColor, IconButton, Portal, Snackbar, SnackbarContent } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { ReactNode, SyntheticEvent } from "react";
import { UIStore, useUIStore } from "@ui";

export type ToastProps = {
  message: ReactNode;
  open?: boolean;
  alertType?: AlertColor;
  showCloseButton?: boolean;
  position?: {
    horizontal: "center" | "left" | "right";
    vertical: "top" | "bottom";
  };

  /**
   * the number of milliseconds to wait before automatically calling `onClose`.
   *
   * Auto-hide is disabled by default and when this property is set to `null`
   */
  autoHideDuration?: number;

  onClose?: (event: Event | SyntheticEvent) => void;
};

/** displays a toast notification */
export function Toast({ message, open, alertType, position, showCloseButton = true, autoHideDuration, onClose }: ToastProps) {
  const isAlert = Boolean(alertType);

  const getCloseButton = () => {
    if (!showCloseButton) return null;

    return (
      <IconButton id="btnToastClose" color="inherit" size="small" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  };

  const handleClose = (e: Event | SyntheticEvent) => {
    if (onClose) onClose(e);
  };

  const getMessageContent = () => {
    if (!isAlert) {
      return <SnackbarContent message={message} action={getCloseButton()} />;
    }

    return (
      <Alert severity={alertType} action={getCloseButton()}>
        {message}
      </Alert>
    );
  };

  return (
    <Snackbar id="bsc-toast" open={open} onClose={handleClose} anchorOrigin={position} autoHideDuration={autoHideDuration}>
      {getMessageContent()}
    </Snackbar>
  );
}

/**
 * A wrapper for the {@link Toast} component that can be controlled via the {@link UIStore}.
 *
 * It is recommended that only a single instance of this component be used for the entire application.
 * Use the {@link Toast} component directly if a more context-specific toast component is needed
 */
export const GlobalToast = observer(() => {
  const uiStore = useUIStore();

  return (
    <Portal>
      <Toast {...uiStore.globalToastProps} />
    </Portal>
  );
});
