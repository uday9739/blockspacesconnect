import { useRouter } from "next/router";
// app code
import { LightningSetup } from "@lightning/routes/setup";
import { NextPageWithLayout } from "@platform/types/base-page-props";
import MainLayoutAuthenticated from "@src/platform/components/layouts/main-authenticated-layout";

const AddonsPage: NextPageWithLayout = () => {
  const router = useRouter();

  if (!router.isReady) return null;
  return <LightningSetup />;
};

export default AddonsPage;
AddonsPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-setup-page" hideGlobalHeaderBar={true}>{page}</MainLayoutAuthenticated>;
};