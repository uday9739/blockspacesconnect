import { useRouter } from "next/router";
import { useUIStore, UIStore } from "@ui";
import ToSDialog from "./tos.dialog";
import { queryWithoutModal } from "@platform/utils";
import { useGetAuthRedirect, useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useAcceptToS } from "@src/platform/hooks/user/mutations";
import { useEffect } from "react";

/** Terms of Service Display Dialog */
export const ToS = () => {
  const router = useRouter();
  const UI: UIStore = useUIStore();
  const { data: currentUser, isLoading: currentUserIsLoading, isFetching: currentUserIsFetching } = useGetCurrentUser();
  const { mutate: acceptToS, isLoading, isSuccess: acceptToIsSuccess, error, data } = useAcceptToS();
  const redirect = useGetAuthRedirect();

  // handle acceptToS
  useEffect(() => {
    if (isLoading) return;
    if (error) {
      UI.showToast({
        message: "Acceptance of Terms Failed.",
        alertType: "error",
        position: { vertical: "top", horizontal: "center" }
      });
      return;
    }
  }, [isLoading, acceptToIsSuccess, error, data]);

  // handle currentUser
  useEffect(() => {
    if (!acceptToIsSuccess || currentUserIsFetching || currentUserIsLoading) return;
    if (!currentUser?.viewedWelcome) {
      router.push({ query: { ...router.query, modal: "welcome" } });
    } else if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/connect?modal=add-app");
      //router.replace({ query: queryWithoutModal(router.query) });
    }
  }, [currentUser, currentUserIsLoading, currentUserIsFetching, acceptToIsSuccess, isLoading, redirect]);

  /** On Acceptance Event */
  const handleAccept = () => acceptToS();

  return <ToSDialog onAccept={handleAccept} />;
};
