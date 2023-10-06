import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { queryWithoutModal } from "@platform/utils";
import WelcomeIntro from "./welcome-intro";
import { useSetWelcomeFlag } from "@src/platform/hooks/user/mutations";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";

enum WelcomeView {
  Intro,
  Value,
  Complete
}

export const Welcome = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState(WelcomeView.Intro);
  const { mutate: setWelcomeFlag, isLoading, isSuccess, isError } = useSetWelcomeFlag();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetCurrentUser();

  useEffect(() => {
    if (activeView === WelcomeView.Complete) {
      if (isSuccess || isLoading) return;
      setWelcomeFlag();
    }
  }, [activeView]);

  useEffect(() => {
    if (isLoading || currentUserIsLoading) return;
    if (currentUser.viewedWelcome) router.replace("/connect?modal=add-app");
  }, [isLoading, currentUserIsLoading]);

  const handleContinue = function () {
    setActiveView(this.nextView);
  };

  switch (activeView) {
    case WelcomeView.Intro:
      return <WelcomeIntro onContinue={handleContinue.bind({ nextView: WelcomeView.Complete })} />;
    // case WelcomeView.Value:
    //   return <WelcomeValue onContinue={handleContinue.bind({ nextView: WelcomeView.Complete })} />;
    default:
      return <></>;
  }
};
