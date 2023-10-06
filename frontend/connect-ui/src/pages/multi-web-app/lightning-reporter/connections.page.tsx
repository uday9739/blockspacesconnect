import { useRouter } from "next/router";
// app code
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";
import { LightningReporterUI } from "@lightning/routes/lightning-reporter-ui";

const AddonsPage: NextPageWithLayout = () => {
  const router = useRouter();
  if (!router.isReady) return null;
  return <LightningReporterUI />;
};

export default AddonsPage;
AddonsPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-reporter-connections-page">{page}</MainLayoutAuthenticated>;
};
