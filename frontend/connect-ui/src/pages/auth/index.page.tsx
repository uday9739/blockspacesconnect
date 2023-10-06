import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthRoutesController from "@platform/routes/auth/index.controller";
import { NetworkBackground } from "@platform/components/dashboards";
import { isUserAuthenticated, useGetInitialLandingPage } from "@src/platform/hooks/user/queries";
import { useAuthRedirect } from "@src/platform/hooks/user/mutations";

const AuthPage = () => {
  const { defaultLanding } = useGetInitialLandingPage();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    setIsLoaded(true);
  }, [router.isReady, defaultLanding]);

  return (
    isLoaded && (
      <>
        <NetworkBackground key="auth" />
        <AuthRoutesController />
      </>
    )
  );
};

export default AuthPage;
