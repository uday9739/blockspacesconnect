//framework
import { useRouter } from "next/router";
import { useEffect } from "react";
//app
import NetworkHome from "@platform/routes/networks/network-home";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import { useNetworkCatalog } from "@platform/network-catalog/queries";

const NetworksPage: NextPageWithLayout = () => {
  const router = useRouter();
  useNetworkCatalog();

  useEffect(() => {
    router.prefetch("/connect?modal=add-app");
    router.prefetch("/multi-web-app/lightning");
    router.prefetch("/multi-web-app/lightning-reporter");
  }, []);

  return <NetworkHome />;
};

NetworksPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="network-home-page">{page}</MainLayoutAuthenticated>;
};

export default NetworksPage;
