import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Index = () => {
  const router = useRouter();
  const { data: user } = useGetCurrentUser()

  useEffect(() => {
    if (!router.isReady) return;
    router.push({
      pathname: user?.appSettings?.defaultPage ?? "/connect"
    });
  }, [router.isReady, user]);
  return (
    <>
      <Head children={""}></Head>
    </>
  );
};

export default Index;
