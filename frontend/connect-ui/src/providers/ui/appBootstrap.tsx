import React, { useState, useEffect, PropsWithChildren } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useErrorsStore } from "@platform/hooks";
import { ToastProps } from "@src/platform/components/common";
import { useUIStore } from "./uiprovider";
import { useIdleTimer } from "react-idle-timer";
import { isUserAuthenticated, useGetCurrentUser, useGetInitialLandingPage, useGetUserNetworks, useHasUserViewedWelcome } from "@src/platform/hooks/user/queries";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useLogout } from "@src/platform/hooks/user/mutations";

//#region IdleTimeOutModal
function BootstrapDialogTitle(props: { id: string; children?: React.ReactNode; onClose: () => void }) {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}
const IdleTimeOutModal = ({ showModal, handleClose, handleLogout, remainingTimeInMs, idleThresholdInMs }) => {
  const [redirectCountDown, setRedirectCountDown] = useState(Math.round(remainingTimeInMs * 0.001));
  const idleThresholdInMins = Math.round((idleThresholdInMs * 0.001) / 60);
  // eslint-disable-next-line no-undef
  let intervalRef: NodeJS.Timeout = null;
  useEffect(() => {
    if (!showModal) return;
    intervalRef = setInterval(() => {
      setRedirectCountDown((redirectCountDown) => (redirectCountDown !== 0 ? redirectCountDown - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef);
  }, [showModal]);

  useEffect(() => {
    if (redirectCountDown <= 0) {
      clearInterval(intervalRef);
      if (showModal) handleLogout();
    }
  }, [redirectCountDown]);

  return (
    <>
      <Dialog onClose={handleClose} aria-labelledby="timeout-dialog" open={showModal} fullWidth={true}>
        <BootstrapDialogTitle id="timeout-dialog-title" onClose={handleClose}>
          You've been idle for {idleThresholdInMins} min's
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>You will get logged out in: {redirectCountDown}</Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleLogout} color="error">
            Logout
          </Button>
          <Button autoFocus onClick={handleClose}>
            Stay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
//#endregion

const AppBootstrap = ({ children }: PropsWithChildren) => {
  const idleThresholdInMs = 60 * 1000 * 30; // 30 mins  // 1000 * 30; // usee  1000 * 30 for testing ;
  const timeToLogoutInMs = 1000 * 60; // 60 sec or 1 min
  const router = useRouter();
  const errorStore = useErrorsStore();
  const uiStore = useUIStore();
  const isProd = uiStore.env === "prod";
  const isHomeScreenPath = "/connect";
  const [hasMounted, setHasMounted] = useState(false);
  const isLoggedIn = isUserAuthenticated();
  const [state, setState] = useState({ isTimedOut: false, showModal: false });
  const { viewedWelcome } = useHasUserViewedWelcome();
  const { defaultLanding, isLoading: userIsLoading } = useGetInitialLandingPage();
  const { data: userNetworks } = useGetUserNetworks(); // have this here to prime the store
  //#region init ui environment
  useEffect(() => {
    const host = window.location.host;
    if (host === "localhost") {
      uiStore.setEnv("local");
    } else {
      const hostParts = host.split(".");
      if (hostParts.length > 0) {
        switch (hostParts[0]) {
          case "staging":
            uiStore.setEnv("stg");
            break;
          case "dev":
            uiStore.setEnv("dev");
            break;
          default:
            uiStore.setEnv("prod");
            break;
        }
      }
    }
  }, [router.isReady]);
  //#endregion

  //#region handle platformCheck
  useEffect(() => {
    //handle maintenanceMode override
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const trail = params?.get("trail");
    const override = trail?.toLocaleLowerCase() === "ozark";

    if (uiStore.platformStatus === undefined) uiStore.platformCheck(override);
  }, []);

  //#endregion

  //#region  handle maintenanceMode
  useEffect(() => {
    if (uiStore.isFetchingPlatformStatus) return;
    router.prefetch("/auth");
    if (uiStore.maintenanceMode) {
      if (router.pathname !== "/maintenance") {
        router.push("/maintenance");
        return;
      }
    } else {
      //
    }
  }, [uiStore.isFetchingPlatformStatus]);
  //#endregion

  //#region handle Unhandled Api Errors
  useEffect(() => {
    if (errorStore?.tempUnhandledApiErrors?.length > 0) {
      const toast: ToastProps = {
        message: isProd ? (
          <>
            {"Uh oh, Something went wrong."} <br />
            {" Sorry but this feature is currently unavailable"}
          </>
        ) : (
          "Caught an Unhandled API error"
        ),
        alertType: "error",
        autoHideDuration: 10000,
        showCloseButton: true,
        onClose: () => errorStore.clearUnhandledApiError(),
        position: {
          horizontal: "right",
          vertical: "top"
        }
      };
      uiStore.showToast(toast);
    }
  }, [errorStore?.tempUnhandledApiErrors?.length]);
  //#endregion

  //#region handle idle user
  const _onAction = (e) => {
    //user did something
    setState((state) => ({ ...state, isTimedOut: false }));
  };

  const _onActive = (e) => {
    //user is active
    setState((state) => ({ ...state, isTimedOut: false }));
  };

  const _onIdle = () => {
    //user is idle
    const isTimedOut = state.isTimedOut;
    const isPosScreen = router.pathname.indexOf("/pos") > 0;
    if (isTimedOut) {
      //
    } else if (isLoggedIn && !isPosScreen && isProd) {
      setState({ isTimedOut: true, showModal: true });
    } else {
      resetIdle();
    }
  };
  const onHandleLogout = () => {
    router.push("/logout");
    setState({ isTimedOut: false, showModal: false });
  };
  const onHandleIdleModalStayClick = () => {
    resetIdle();
    setState((state) => ({ ...state, showModal: false }));
  };

  const { reset: resetIdle } = useIdleTimer({
    timeout: idleThresholdInMs,
    onIdle: _onIdle,
    onActive: _onActive,
    onAction: _onAction,
    crossTab: true,
    debounce: 500
  });

  //#endregion

  //#region handle defaultLanding if user is on home screen
  useEffect(() => {
    if (!isLoggedIn || userIsLoading || viewedWelcome) return;
    if (router.asPath === isHomeScreenPath) {
      router.replace(defaultLanding);
    }
  }, [isLoggedIn, userIsLoading, viewedWelcome, router.asPath]);
  //#endregion

  /**
   * https://github.com/vercel/next.js/discussions/17443
   * HACK!!! due to Next.js hydration issue.
   */
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <IdleTimeOutModal showModal={state.showModal} idleThresholdInMs={idleThresholdInMs} remainingTimeInMs={timeToLogoutInMs} handleClose={onHandleIdleModalStayClick} handleLogout={onHandleLogout} />
      {children}
    </>
  );
};

export default observer(AppBootstrap);
