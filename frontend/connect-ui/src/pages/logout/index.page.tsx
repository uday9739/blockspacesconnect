import { Loading } from "@src/platform/components/common";
import { useLogout, useRevokeToken } from "@src/platform/hooks/user/mutations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Index = () => {
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const { mutate: revokeToken } = useRevokeToken()
  useEffect(() => {
    if (!router.isReady) return;
    revokeToken();
    logout();
  }, [router.isReady]);
  return <Loading when={true}></Loading>;
};

export default Index;
