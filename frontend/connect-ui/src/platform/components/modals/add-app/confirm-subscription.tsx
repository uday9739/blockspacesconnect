import { NetworkPriceDto } from "@blockspaces/shared/dtos/network-catalog";
import { Button } from "@platform/common";
import { getCartDetails, useConfirmCartPendingItems } from "@src/platform/hooks/cart/mutations";
import { useEffect } from "react";
import { Card, CardBody, CardTitle, CardFooter, CardPrice } from "./confirm-subscription.styles";
import { event } from "nextjs-google-analytics";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";

type Props = { next: () => void; setErrorMsg: any };
export const ConfirmSubscription = ({ next, setErrorMsg }: Props) => {
  const { data: user } = useGetCurrentUser();
  const cart = getCartDetails();
  const { mutate: confirmCartPendingItems, isLoading: confirmCartPendingItemsLoading, error: confirmCartPendingItemsError, isSuccess: confirmCartPendingItemsIsSuccess } = useConfirmCartPendingItems();
  if (confirmCartPendingItemsError) setErrorMsg(confirmCartPendingItemsError["message"]);

  useEffect(() => {
    if (confirmCartPendingItemsLoading) return;

    if (confirmCartPendingItemsIsSuccess) next();
  }, [confirmCartPendingItemsLoading]);

  const _isOfferingSelected = (offering) => {
    return cart?.cart.items?.find((x) => x.offerId === offering?.id) != null;
  };

  const _confirmNewSubscriptionItems = async () => {
    setErrorMsg(null);
    event("addedService", {
      category: `cart`,
      userId: user.id
    });
    confirmCartPendingItems({ cartId: cart.cart.id, paymentToken: cart?.paymentConfig?.paymentToken });
  };

  const _getFormattedFiatPrice = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  const _getOfferingTotalFormattedFiatPrice = (offering) => {
    const recurrence = offering?.recurrence.charAt(0).toUpperCase() + offering?.recurrence.slice(1);
    return `${_getFormattedFiatPrice(offering.items.filter((x) => !x.isMetered).reduce((total, item) => total + item?.unitAmount, 0))} /${recurrence}`;
  };

  const OfferingLineItem = (props: NetworkPriceDto) => {
    const isMetered = props.isMetered;
    const displayName = props.displayName;
    let priceStr = "";

    if (isMetered && props.tiers && props.tiers.length > 0) {
      return (
        <>
          {displayName} <a href="javascript:void(0)">Tiered</a>
        </>
      );
    } else if (isMetered === true) {
      priceStr = "$" + props.unitAmount + "";
    }

    return (
      <>
        {displayName}
        <br />
        {priceStr}
      </>
    );
  };

  return (
    <div id="confirm-subscription-container" style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto" }}>
      <p style={{ textAlign: "center" }}>
        {" "}
        The following service for <b>{cart?.network.name}</b> will be added to your existing subscription
        {cart?.paymentConfig?.amountDue > 0 ? (
          <>
            , with a prorated amount of <b>{_getFormattedFiatPrice(cart?.paymentConfig?.amountDue)}</b> for the current billing cycle.
          </>
        ) : (
          <>.</>
        )}
        <br />
        Please confirm below
      </p>
      {cart?.catalog
        ?.filter((offering) => _isOfferingSelected(offering))
        .map((offering, index) => {
          const nonMeteredItems = offering.items.filter((o) => o.isMetered === false);
          const meteredItems = offering.items.filter((o) => o.isMetered === true);
          return (
            <Card key={index} selected>
              <CardTitle>
                <h2> {offering.tier.displayName}</h2>
              </CardTitle>
              <CardPrice>{_getOfferingTotalFormattedFiatPrice(offering)}</CardPrice>
              <CardBody>
                <p style={{ padding: "0px 10px 0px 10px", textAlign: "center" }}>{offering.description}</p>
                <small>Included</small>
                <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
                  {nonMeteredItems.map((item, index) => {
                    return (
                      <li key={index}>
                        <OfferingLineItem {...item} />
                      </li>
                    );
                  })}
                </ul>
                <small>Usage Based</small>
                <ul style={{ fontSize: "14px", alignSelf: "baseline" }}>
                  {meteredItems.map((item, index) => {
                    return (
                      <li key={index}>
                        <OfferingLineItem {...item} />
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
              <CardFooter></CardFooter>
            </Card>
          );
        })}
      <Button
        id="btnConfirmSubscription"
        type="button"
        variation="default-new"
        label="Confirm"
        labelOnSubmit="Submitting"
        onClick={_confirmNewSubscriptionItems}
        submitting={confirmCartPendingItemsLoading}
        customStyle={{
          margin: "1.5rem 0 2.25rem"
        }}
      />
    </div>
  );
};
