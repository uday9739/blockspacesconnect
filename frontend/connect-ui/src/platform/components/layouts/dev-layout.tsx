// framework
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";
// 3rd party

// app code
import MainLayoutAuthenticated from "./main-authenticated-layout";

interface LayoutProps {
  hideGlobalHeaderBar?: boolean;
}

export const DevLayout = ({ children, hideGlobalHeaderBar: hideHaveBar = false }: PropsWithChildren<LayoutProps>) => {
  const { data: user } = useGetCurrentUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    if (user?.email.split("@")[1] !== "blockspaces.com") {
      router.push("/connect");
    }
  }, [user]);
  return (
    <>
      <MainLayoutAuthenticated id="dev-layout-wrapper">{children}</MainLayoutAuthenticated>
    </>
  );
};
export default DevLayout;
