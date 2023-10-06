import { useRouter } from "next/router";
// app code
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import { LightningUI } from "@lightning/routes/lightning-ui";

const AddonsPage: NextPageWithLayout = () => {
  const router = useRouter();
  if (!router.isReady) return null;
  return <LightningUI />;
};

export default AddonsPage;
AddonsPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-connections-page">{page}</MainLayoutAuthenticated>;
};
