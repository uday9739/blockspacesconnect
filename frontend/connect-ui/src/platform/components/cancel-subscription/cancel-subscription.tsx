import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLogoBG, NetworkName, Subscription, PlanDetails, PlanName, Pricing, Price, PriceLabel } from "./cancel-subscription.styles";
import { NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { Cancel, NetworkIcon } from "@icons";
import { Button, Loading } from "@platform/common";
import { useNetworkCatalog } from "@platform/hooks/network-catalog/queries";
import { useGetConnectSubscription } from "@platform/hooks/user/queries";
import { useCancelSubscription } from "@platform/hooks/user/mutations";
import { Box } from "@mui/material";
import { useUIStore } from "@src/providers";
import { _getShortHandRecurrence } from "@src/platform/utils/connect-subscription";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { ModalContainer, ModalHeaderCloseWrapper, ModalTitle } from "../common/modal/styles";
import { ChainInitials } from "@src/platform/routes/networks/app-launcher.styles";
import fontColorContrast from "font-color-contrast";
import { trimString } from "@src/platform/routes/networks/app-launcher";
import { BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";

export const CancelSubscription = () => {
  let baseFee = 0;
  let meteredCost = 0;
  const router = useRouter();
  const billingTier = router.query.billingTier;
  const isFreeTier = billingTier === BillingTierCode.Free;
  const ui = useUIStore();
  const { getNetwork } = useNetworkCatalog();
  const network = getNetwork(router.query.nid as string);
  const { data: subscription, isLoading } = useGetConnectSubscription();
  const { mutate: cancelSubscription, isLoading: submitting, error: cancelSubscriptionError, isSuccess: cancelSubscriptionIsSuccess } = useCancelSubscription();
  const plan = subscription?.items?.filter((product) => product?.networkId === router.query.nid);
  plan?.forEach((offer) => {
    if (!offer) return;
    if (!offer.isMetered) {
      baseFee += offer.unitAmount;
      return;
    }
    meteredCost = meteredCost + offer.unitAmount;
  });
  const planPrice = (
    <Pricing>
      <Price>
        {`$${baseFee}`}
        <PriceLabel>/ {plan && _getShortHandRecurrence(plan[0]?.recurrence)}</PriceLabel>
      </Price>
      <Price>+</Price>
      <Price>
        {`$${meteredCost}`}
        <PriceLabel>/ per TXs</PriceLabel>
      </Price>
    </Pricing>
  );
  const background = network?.secondaryColor ? `linear-gradient(45deg, ${network?.primaryColor} 10%, ${network?.secondaryColor} 90%)` : network?.primaryColor;
  const _cancelSubscription = () =>
    cancelSubscription({
      networkId: network._id,
      billingCategoryCode: network._id === NetworkId.LIGHTNING ? NetworkPriceBillingCodes.MultiWebApp : NetworkPriceBillingCodes.Infrastructure,
      billingTierCode: billingTier.toString()
    });

  useEffect(() => {
    if (isLoading || !cancelSubscriptionIsSuccess) return;
    if (router.query.onComplete === "back") {
      router.back();
    } else {
      router.push("/connect");
    }
    ui.showToast({
      message: "Service canceled successfully",
      alertType: "success",
      autoHideDuration: 5000,
      position: {
        horizontal: "right",
        vertical: "top"
      }
    });
  }, [isLoading, cancelSubscriptionIsSuccess]);

  if (!subscription || !network || isLoading) return <Loading when={true}></Loading>;

  return (
    <ModalContainer id="cancel-service-modal">
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <ModalTitle>Active Subscription</ModalTitle>
        <ModalHeaderCloseWrapper style={{ alignSelf: "center" }} onClick={() => router.back()}>
          <Cancel />
        </ModalHeaderCloseWrapper>
      </Box>

      <Subscription>
        <AppLogoBG background={background} style={{ marginRight: "25px" }}>
          <NetworkIcon networkId={network._id} />
          {network.chain && (
            <ChainInitials
              style={{
                transform: "none"
              }}
              background={background}
              color={fontColorContrast(network.primaryColor, 0.8)}
            >
              {trimString(network.chain)}
            </ChainInitials>
          )}
        </AppLogoBG>
        <PlanDetails>
          <NetworkName>{network.chain ? `${network.name} ${network.chain}` : network.name}</NetworkName>
          <PlanName>{billingTier} Plan</PlanName>
        </PlanDetails>
        <Pricing>{isFreeTier ? "Free Tier" : planPrice}</Pricing>
      </Subscription>
      <Button
        id="btnSubmitCancel"
        label="Cancel Service"
        onClick={() => _cancelSubscription()}
        width="18rem"
        height="3.3125rem"
        variation="default-new"
        submitting={submitting}
        customStyle={{ margin: "1.3125rem 0 1.875rem" }}
      />
    </ModalContainer>
  );
};
