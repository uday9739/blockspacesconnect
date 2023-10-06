import { LightningConnectProvider } from "@src/features/infrastructure/lightning-connect/hooks";
import { LightningConnectUI } from "@src/features/infrastructure/lightning-connect/routes/lightning-connect-ui";
import { MainLayoutAuthenticated } from "@src/platform/components";
import { NextPageWithLayout } from "@src/platform/types";

export const LightningConnectPage:NextPageWithLayout = () => {
  return (
  <LightningConnectProvider>
    <LightningConnectUI />
  </LightningConnectProvider>
  )
}

LightningConnectPage.getLayout = function getLayout(page) {
  return <MainLayoutAuthenticated id="lightning-connect-page">{page}</MainLayoutAuthenticated>
}
export default LightningConnectPage