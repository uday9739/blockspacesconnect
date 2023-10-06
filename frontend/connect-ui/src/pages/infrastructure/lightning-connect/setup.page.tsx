import { LightningConnectSetup } from "@src/features/infrastructure/lightning-connect/routes/setup/lightning-connect-setup";
import { MainLayoutAuthenticated } from "@src/platform/components";
import { NextPageWithLayout } from "@src/platform/types";
import { useRouter } from "next/router";

export const LightningConnectSetupPage:NextPageWithLayout = () => {
  const router = useRouter()

  if (!router.isReady) return null
  return <LightningConnectSetup />
}

LightningConnectSetupPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-connect-setup-page" hideGlobalHeaderBar={true}>{page}</MainLayoutAuthenticated>
}
export default LightningConnectSetupPage