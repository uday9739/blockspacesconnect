import { CartStatus } from "@blockspaces/shared/models/cart";
import { Network, NetworkId } from "@blockspaces/shared/models/networks";
import { Box } from "@mui/material";
import { getCartDetails, useSelectOffering } from "@platform/cart/mutations";
import { useGetConnectSubscription, useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useEffect, useMemo, useState } from "react";
import { Loading } from "../../common";
import { Label, Labels, Plan, PlanDetail, PlanDetails, Plans, PlanTitle, StyledSelectPlan } from "./select-plan.styles";
import { MAX_SUBSCRIPTION_LINE_ITEMS, MAX_SUBSCRIPTION_MSG } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { NetworkOffering, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { getBipSupportLevels, getBipVolumeAllotment, _getShortHandRecurrence } from "@src/platform/utils/connect-subscription";
import { useRouter } from "next/router";
import { NetworkOfferingDTO } from "@blockspaces/shared/dtos/network-catalog";
import { event } from "nextjs-google-analytics";
import { useGetSystemFlags } from "@src/platform/hooks/system-flags";

type Props = { next: () => void; setErrorMsg: any; setAllowAdd: (flag: boolean) => void };
export const SelectPlan = ({ next, setErrorMsg, setAllowAdd }: Props) => {
  const { data: systemFlags } = useGetSystemFlags();
  const { data: user } = useGetCurrentUser();
  const router = useRouter();
  const { data: subscription } = useGetConnectSubscription();
  const { mutate: selectOffering, isSuccess: selectOfferingSuccess, error: selectOfferingError, isLoading: selectOfferIsLoading, data: selectOfferingResult } = useSelectOffering();
  const cartSession = getCartDetails();
  const isCartEmpty = cartSession?.cart.status === CartStatus.EMPTY;
  const allowAdd = (subscription?.items?.length || 0) + (cartSession?.catalog?.flatMap((x) => x.items).length || 0) <= MAX_SUBSCRIPTION_LINE_ITEMS;
  if (!allowAdd) setAllowAdd(false);
  const [stripeError, setStripeError] = useState<String>();
  const getWeb3EndpointTransactions = () => new Intl.NumberFormat().format(systemFlags?.find((x) => x.FreeWeb3EndpointTransactionLimit)?.FreeWeb3EndpointTransactionLimit || 0);
  const FORMATTED_FREE_WEB3_ENDPOINT_TRANSACTIONS = getWeb3EndpointTransactions();
  setErrorMsg(null);

  useEffect(() => {
    if (selectOfferingError) setErrorMsg(selectOfferingError["message"]);
    if (selectOfferingSuccess) {
      if (selectOfferingResult.data.cart.status === CartStatus.CHECKOUT_COMPLETE) {
        //
        router.push({ pathname: router.pathname, query: { modal: "add-success", addApp: true, network: selectOfferingResult.data.cart.networkId } });
      } else {
        next();
      }
    }
  }, [selectOfferingSuccess, selectOfferingError]);

  const _isOfferingSelected = (offering) => {
    return cartSession.cart?.items?.find((x) => x.offerId === offering?.id) != null;
  };

  const _selectOffer = async (offering: NetworkOfferingDTO) => {
    if (!allowAdd) return;
    setStripeError(null);
    setErrorMsg(null);
    event("selectPlan", {
      category: `cart`,
      label: `${offering.tier?.code}-${offering.billingCategory?.code}-${offering.network}`,
      userId: user.id
    });
    if (offering.tier.code === BillingTierCode.Professional && offering?.items?.length === 0) {
      window.location.assign("mailto:support@blockspaces.com?subject=BlockSpaces%20support%20request");
      return;
    }
    if (!(_isOfferingSelected(offering) && isCartEmpty === false)) {
      selectOffering({ cartId: cartSession.cart.id, offering: offering });
    } else {
      if (isCartEmpty === false) next();
    }
  };

  const labels = useMemo(() => {
    if (!cartSession) return [];
    if (cartSession?.network?._id === NetworkId.LIGHTNING && cartSession?.cart?.billingCategory?.code === NetworkPriceBillingCodes.MultiWebApp)
      return ["Nodes", "Integrations", "Txn Volume Allotment", "Support", "Txn Fee", "Monthly Fee"];
    else if (cartSession?.network?._id === NetworkId.LIGHTNING_CONNECT && cartSession?.cart?.billingCategory?.code === NetworkPriceBillingCodes.Infrastructure) return ["Monthly Fee", "Node"];
    else return ["Fee", "Cost / TXs", "TXs Per Month"];
  }, [cartSession]);

  const plansByTier = useMemo(() => {
    return cartSession?.catalog
      .sort((a, b) => a.tier.tierSort - b.tier.tierSort)
      .map((plan) => {
        const recurrence = _getShortHandRecurrence(plan.recurrence);
        const isFree = plan.tier.code === BillingTierCode.Free;
        const isProfessional = plan.tier.code === BillingTierCode.Professional;
        const fixedCost = plan.items?.filter((x) => x.isMetered === false)?.reduce((total, item) => total + item.unitAmount, 0);
        let meteredCost = plan.items?.filter((x) => x.isMetered === true)?.reduce((total, item) => total + item.unitAmount, 0);

        // hack
        if(plan.tier.code === BillingTierCode.FreeWithCC){
          meteredCost = meteredCost * 100;
        }

        let details = null;
        if (isProfessional && plan.items?.length === 0) {
          details = ["Contact Support", "Contact Support", "Unlimited"];
        } else {
          details = [`$${fixedCost} / ${recurrence}`, `$${meteredCost}`, `${isFree ? `${FORMATTED_FREE_WEB3_ENDPOINT_TRANSACTIONS}` : "Unlimited"}`];
        }
        if (cartSession?.network?._id === NetworkId.LIGHTNING && cartSession?.cart?.billingCategory?.code === NetworkPriceBillingCodes.MultiWebApp) {
          // handle BIP
          return {
            offer: plan,
            title: plan.tier.displayName,
            details: ["Dedicated LND Node", "QuickBooks", `${getBipVolumeAllotment(plan.tier.code)}`, `${getBipSupportLevels(plan.tier.code)}`, `${meteredCost}%`, `<b>$${fixedCost}</b>`]
          };
        } else if (cartSession?.network?._id === NetworkId.LIGHTNING_CONNECT && cartSession?.cart?.billingCategory?.code === NetworkPriceBillingCodes.Infrastructure) {
          return {
            offer: plan,
            title: plan.tier.displayName,
            details: [`$${fixedCost} / ${recurrence}`, "LND"]
          };
        } else {
          return {
            offer: plan,
            title: plan.tier.displayName,
            details: details
          };
        }
      });
  }, [cartSession?.catalog, FORMATTED_FREE_WEB3_ENDPOINT_TRANSACTIONS]);

  return (
    <Box id="select-plan-container">
      <Box sx={{ textAlign: "center" }}>
        <h1 style={{ marginTop: "10px" }}>{cartSession?.network?.name}</h1>
        <Loading when={selectOfferIsLoading}></Loading>
      </Box>
      <StyledSelectPlan>
        <Plans>
          <Labels>
            {labels.map((label, index) => (
              <Label key={`plan-detail-label${label}-${index}`}>{label}</Label>
            ))}
          </Labels>
          {plansByTier?.map((plan) => {
            return (
              <>
                <Plan key={plan.offer.id} id={`select-plan-${plan.title}`} data-recommended={plan.offer.recommended} recommended={plan.offer.recommended} onClick={() => _selectOffer(plan.offer)}>
                  <PlanTitle>{plan.title}</PlanTitle>
                  <PlanDetails>
                    {plan.details.map((detail) => (
                      <PlanDetail key={`plan-details-${detail}`}>
                        <span dangerouslySetInnerHTML={{ __html: detail }} />
                      </PlanDetail>
                    ))}
                    {plan.offer.recommended ? (
                      <span style={{ textAlign: "center" }}>
                        <i>
                          <small style={{ color: "#696FE2" }}>Recommended</small>
                        </i>
                      </span>
                    ) : (
                      <></>
                    )}
                  </PlanDetails>
                </Plan>
              </>
            );
          })}
          <Labels empty={true}>
            {labels.map((label, index) => (
              <Label key={`plan-detail-label-${label}-${index}-cap`}></Label>
            ))}
          </Labels>
        </Plans>
      </StyledSelectPlan>
    </Box>
  );
};
