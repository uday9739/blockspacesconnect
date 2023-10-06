import { useRouter } from "next/router";
// app code
import { GetNetworkUiComponent } from "@platform/routes/networks";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { MainLayoutAuthenticated } from "@platform/components";

const AddonsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const Network = GetNetworkUiComponent(NetworkId.LIGHTNING_REPORTER);

  if (!router.isReady) return null;
  return <Network />;
};

AddonsPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-reporter-settings-page">{page}</MainLayoutAuthenticated>;
};

export default AddonsPage;
