import { useEffect, useMemo, useState } from "react";
import { CartStatus } from "@blockspaces/shared/models/cart";
import { SelectApp } from "./select-app";
import { useRouter } from "next/router";
import { Apps, Wallet, Check, Billing } from "@icons";
import { FlowStepper, Step } from "./flow-stepper";
import { StyledAddAppModal, Error } from "./add-app.styles";
import { SelectPlan } from "./select-plan";
import { AddBillingInfo } from "./add-billing-info";
import { AddPaymentMethod } from "./add-payment-method";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { ConfirmSubscription } from "./confirm-subscription";
import { Info, InfoLabel, Loading } from "@platform/common";
import { useGetConnectSubscription } from "@src/platform/hooks/user/queries";
import { getCartDetails, useInitCart, useResetCart } from "@platform/cart/mutations";
import { getPendingPaymentMessage, useCartPendingPayments } from "@platform/cart/queries";
import { MAX_SUBSCRIPTION_LINE_ITEMS, MAX_SUBSCRIPTION_MSG } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Alert, Box } from "@mui/material";
import { useGetNetworkCatalogCategories, useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { CollectCCFreeOffer } from "./collect-cc-free-offer";

//https://mtlynch.io/stripe-recording-its-customers/
loadStripe.setLoadParameters({ advancedFraudSignals: false }); // this prevents stripe from tracking user

export const AddApp = () => {
  const { data: categories, isLoading: isCategoriesLoading } = useGetNetworkCatalogCategories();
  const { data: subscription } = useGetConnectSubscription();
  const router = useRouter();
  const [cartErrorMsg, setCartErrorMsg] = useState(null);
  const { data: cartPendingPayments } = useCartPendingPayments();
  const cart = getCartDetails();
  const [finalDestination, setFinalDestination] = useState({});
  const pendingPaymentMsg = getPendingPaymentMessage();
  const { mutate: initCart, isSuccess: initSuccess, error: initCartError, isLoading: initCartLoading } = useInitCart();
  const [allowAdd, setAllowAdd] = useState((subscription?.items?.length || 0) < MAX_SUBSCRIPTION_LINE_ITEMS);
  const [activeStep, setActiveStep] = useState(0);
  const [cartInfoMsg, setInfoMsg] = useState(!allowAdd ? MAX_SUBSCRIPTION_MSG : null);

  const stripePromise = useMemo(async () => {
    if (!cart?.paymentConfig?.key && !cartPendingPayments?.data?.paymentConfig?.key) return;
    return loadStripe(cart?.paymentConfig?.key || cartPendingPayments?.data?.paymentConfig?.key);
  }, [cart?.paymentConfig?.key, cartPendingPayments?.data?.paymentConfig?.key]);

  if (activeStep === 0) useResetCart();

  useEffect(() => {
    if (!cart?.network) return;
    if (cart.network._id === "lightning") setFinalDestination({ pathname: "/multi-web-app/lightning/setup", query: { modal: "add-lightning-success" } });
    else setFinalDestination({ pathname: router.pathname, query: { modal: "add-app-success", addApp: true } });
  }, [cart?.network]);

  useEffect(() => {
    if (cart?.cart?.status === CartStatus.PENDING_PROCESSING_PAYMENT || activeStep === 3) return;
    if (((subscription?.items?.length || 0) >= MAX_SUBSCRIPTION_LINE_ITEMS && allowAdd) || (!allowAdd && activeStep !== 0)) {
      setAllowAdd(false);
      setActiveStep(0);
      setInfoMsg(MAX_SUBSCRIPTION_MSG);
    }
  }, [subscription, allowAdd]);

  useEffect(() => {
    if (cart?.cart?.status === CartStatus.PENDING_PROCESSING_PAYMENT && activeStep !== 3) {
      setActiveStep(3);
      setCartErrorMsg(cart?.cart?.cartError?.message);
      setAllowAdd(true);
    }
  }, [cart?.cart?.status]);

  //#region Handle autoInit
  useEffect(() => {
    if (router?.query?.autoInit && activeStep === 0) {
      const networkId = router?.query?.autoInit?.toString();
      const billingCategoryCode = networkId === NetworkId.LIGHTNING ? NetworkPriceBillingCodes.MultiWebApp : NetworkPriceBillingCodes.Infrastructure;
      initCart({ networkId: networkId, billingCategoryCode: billingCategoryCode });
    }
  }, [router?.isReady]);
  useEffect(() => {
    if (!initCartError && router?.query?.autoInit && initSuccess) {
      setActiveStep(1);
    }

    if (initCartError) {
      setCartErrorMsg((initCartError as any)?.message);
    }
  }, [initSuccess, initCartError]);
  //#endregion

  const next = (cartStatus?: String) => {
    if (!allowAdd) return;
    if (cartStatus === CartStatus.PENDING_CC_FOR_FREE_OFFER) {
      _setActiveStepHelper(4);
    } else {
      _setActiveStepHelper(activeStep + 1);
    }

    setCartErrorMsg(null);
  };
  const _setActiveStepHelper = (step) => {
    if (cart?.cart.status === CartStatus.PENDING_PROCESSING_PAYMENT && step !== 2) return;
    setActiveStep(step);
  };

  const steps: Step[] = useMemo(
    () =>
      subscription?.status === "Active"
        ? [
            {
              label: "Select App",
              icon: <Apps />,
              Component: <SelectApp next={next} setErrorMsg={setCartErrorMsg} allowAdd={allowAdd} />,
              onClick: () => _setActiveStepHelper(0),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Select Plan",
              icon: <Billing />,
              Component: <SelectPlan next={next} setErrorMsg={setCartErrorMsg} setAllowAdd={setAllowAdd} />,
              onClick: () => _setActiveStepHelper(1),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Confirm Subscription",
              icon: <Check />,
              Component: <ConfirmSubscription next={() => router.push(finalDestination)} setErrorMsg={setCartErrorMsg} />,
              onClick: () => _setActiveStepHelper(2),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            }
          ]
        : [
            {
              label: "Select App",
              icon: <Apps />,
              Component: <SelectApp next={next} setErrorMsg={setCartErrorMsg} allowAdd={allowAdd} />,
              onClick: () => _setActiveStepHelper(0),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Select Plan",
              icon: <Billing />,
              Component: <SelectPlan next={next} setErrorMsg={setCartErrorMsg} setAllowAdd={setAllowAdd} />,
              onClick: () => _setActiveStepHelper(1),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Billing Information",
              icon: <Wallet />,
              Component: <AddBillingInfo next={next} setErrorMsg={setCartErrorMsg} />,
              onClick: () => _setActiveStepHelper(2),
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Complete Payment",
              icon: <Check />,
              Component: (
                <Elements stripe={stripePromise}>
                  <AddPaymentMethod next={async () => await router.push('/connect')} setErrorMsg={setCartErrorMsg} />
                </Elements>
              ),
              onClick: () => null,
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
            {
              label: "Add Default Credit Card",
              icon: <Check />,
              Component: (
                <Elements stripe={stripePromise}>
                  <CollectCCFreeOffer next={async () => await router.push("/connect")} setErrorMsg={setCartErrorMsg} />
                </Elements>
              ),
              onClick: () => null,
              marqueeText: `${`  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  THE FUTURE IS MULTIWEB  .  START BUILDING TODAY  .  `}`
            },
          ],
    [subscription?.status, activeStep]
  );

  // Fixes issue at the end of the flow where the user is stuck on the last step
  useEffect(() => {
    if (activeStep > steps.length - 1) router.push('/connect');
  }, [activeStep, steps]);

  return (
    <StyledAddAppModal id="add-app-modal">
      <FlowStepper steps={steps} activeStep={steps[activeStep]} />
      <Box sx={{ padding: "15px 15px 0px 15px" }}>
        {cartErrorMsg != null ? (
          <>
            <Alert severity="error" color="error">
              {cartErrorMsg}
            </Alert>
          </>
        ) : null}
        {cartInfoMsg != null ? (
          <>
            <Alert severity="info" color="info">
              <span dangerouslySetInnerHTML={{ __html: cartInfoMsg }} />
            </Alert>
          </>
        ) : null}
      </Box>

      {pendingPaymentMsg != null ? (
        <>
          <Info style={{ margin: "10px" }}>
            <InfoLabel style={{ textAlign: "center" }}>
              {pendingPaymentMsg}
              {activeStep !== 3 ? (
                <a href="javascript:void(0);" onClick={() => setActiveStep(3)}>
                  {" "}
                  Click here
                </a>
              ) : null}
            </InfoLabel>
          </Info>
        </>
      ) : null}
      <Loading when={initCartLoading || isCategoriesLoading}></Loading>
      {steps[activeStep]?.Component ? steps[activeStep]?.Component : <Loading when={true}><p>loading</p></Loading>}
    </StyledAddAppModal>
  );
};
