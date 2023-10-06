import { StripeCardElement, StripeCardElementOptions } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Loading } from "@platform/common";
import { Wallet, User, Billing, Apps } from "@icons";
import { SelectionSummary } from "./selection-summary";
import { AddPaymentForm, CardNumberInput, StyledAddPaymentMethod } from "./add-payment-method.styles";
import { useTheme } from "styled-components";
import { useWindowSize } from "@platform/hooks";
import { CartStatus } from "@blockspaces/shared/models/cart";
import { getCartDetails, useMarkCartPendingPayment, useMarkCartWithPaymentError } from "@platform/cart/mutations";
import { useCartPendingPayments, useCartPollingProcessingPayment } from "@platform/cart/queries";
import { getOfferPriceDetails } from "@src/platform/utils/connect-subscription";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { event as gaEvent } from "nextjs-google-analytics";
import { Box } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

type Props = { next: () => void; setErrorMsg: any };
export const AddPaymentMethod = ({ next, setErrorMsg }: Props) => {
  const { data: user } = useGetCurrentUser();
  let cardElement: StripeCardElement = null;
  const theme: any = useTheme();
  const { rem } = useWindowSize();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounting, setIsMounting] = useState(true);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const cart = getCartDetails();
  const { mutate: markCartWithPaymentError } = useMarkCartWithPaymentError();
  const { mutate: markCartPendingPayment, isSuccess: markCartPendingPaymentSuccess, error: markCartPendingPaymentError } = useMarkCartPendingPayment();
  const { data: cartState } = useCartPollingProcessingPayment();
  const { data: cartPendingPayment } = useCartPendingPayments();
  const [planPrice, setPlanPrice] = useState("");
  if (markCartPendingPaymentError) setErrorMsg(markCartPendingPaymentError["message"]);
  if (cartState?.data?.status === CartStatus.CHECKOUT_COMPLETE) next();

  const cardElementOptions: StripeCardElementOptions = useMemo(
    () => ({
      hidePostalCode: true,
      value: {
        postalCode: cart?.cart?.billingAddress?.postalCode
      },
      style: {
        base: {
          lineHeight: `${4.25 * rem}px`,
          fontSize: `${1.125 * rem}px`
        }
      }
    }),
    [rem, cart?.cart?.billingAddress]
  );

  useEffect(() => {
    window.onbeforeunload = function (event) {
      event.preventDefault();
      return isSubmitting || cart?.cart.status === CartStatus.CHECKOUT_COMPLETE ? "Please wait until payment is done processing" : null;
    };

    if (elements && !cardElement) {
      cardElement = elements.getElement(CardElement);
      cardElement.on("change", (data) => {
        setIsFormComplete(data.complete);
        // setError && setError(data.error?.message);
      });
      setIsMounting(false);
    }
  }, [elements]);

  useEffect(() => {
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try {
      setIsSubmitting(true);
      // clear errors
      setErrorMsg(null);

      markCartPendingPayment(cart?.cart.id);

      const { error, paymentIntent } = await stripe.confirmCardPayment(cart.paymentConfig?.paymentToken, {
        //`Elements` instance that was used to create the Payment Element
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cart?.cart?.billingAddress?.fullName,
            address: {
              line1: cart?.cart?.billingAddress?.addressLine1,
              line2: cart?.cart?.billingAddress?.addressLine2,
              city: cart?.cart?.billingAddress?.city,
              country: cart?.cart?.billingAddress?.country,
              postal_code: cart?.cart?.billingAddress?.postalCode,
              state: cart?.cart?.billingAddress?.state
            }
          }
        }
      });

      setIsSubmitting(false);

      if (error) {
        setErrorMsg(error.message || "Payment failed. Please input your card and try again.");
        markCartWithPaymentError({
          cartId: cart?.cart.id,
          cartError: {
            code: error.code,
            message: error.message
          }
        });
      } else {
        // success
        gaEvent("purchaseComplete", {
          category: `cart`,
          userId: user.id
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      markCartWithPaymentError({
        cartId: cart?.cart.id,
        cartError: {
          code: error?.code,
          message: error?.message
        }
      });
      // setError && setError(error.message)
    }
  };

  const _getFormattedFiatPrice = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  const getSelectedOffer = () => {
    const selectedItem = cart.cart.items[0];
    return cart.catalog.find((x) => x.id === selectedItem.offerId);
  };

  const selectedOffer = getSelectedOffer();
  const { priceDetails } = getOfferPriceDetails(selectedOffer, (cart?.network as any)?._id);

  // const planPrice = () => ;
  const { addressLine1, addressLine2, state, country, city, postalCode } = cart?.cart?.billingAddress;
  const address = addressLine2 ? `${addressLine1}&:nbsp;${addressLine2}` : `${addressLine1}, ${city} ${state}`;
  return (
    <StyledAddPaymentMethod id="payment-container">
      <SelectionSummary
        label={`${selectedOffer?.tier?.displayName} Plan`}
        details={[
          {
            icon: <Apps />,
            copy: `${selectedOffer.description}`
          },
          {
            icon: <Wallet />,
            copy: `${priceDetails}`
          }
        ]}
      />
      <SelectionSummary
        label="Billing Address"
        details={[
          {
            icon: <User />,
            copy: `${cart?.cart.billingAddress.fullName}`
          },
          {
            icon: <Billing />,
            copy: `${address}`
          }
        ]}
      />
      <AddPaymentForm onSubmit={handleSubmit} id="payment-form">
        <CardNumberInput id="cc-wrapper">
          <CardElement id="cc-info-element" options={cardElementOptions} />
        </CardNumberInput>
        <Loading when={isMounting} />
        <BlockspacesCCDisclaimer />
        <Button
          id="btnAddPayment"
          type="submit"
          variation="default-new"
          label={`Pay $${cart.paymentConfig?.amountDue.toFixed(2)}`}
          labelOnSubmit="Processing"
          disabled={!stripe || !isFormComplete || cart?.cart.status === CartStatus.CHECKOUT_COMPLETE}
          submitting={cartState?.data?.status === CartStatus.PENDING_PROCESSING_PAYMENT || cartPendingPayment?.data?.cart?.status === CartStatus.PENDING_PROCESSING_PAYMENT || isSubmitting}
          width="16rem"
          height="3.325rem"
          customStyle={{ marginLeft: "auto", marginRight: "auto", marginTop: "25px" }}
        />
      </AddPaymentForm>
      <div>
        {cart?.paymentConfig?.couponApplied && cart.paymentConfig?.discountTotal > 0 && (
          <>
            <small>
              <i>
                * Coupon for <b>{_getFormattedFiatPrice(cart.paymentConfig.discountTotal)}</b> has been automatically applied
              </i>{" "}
            </small>
          </>
        )}
      </div>
    </StyledAddPaymentMethod>
  );
};

export const BlockspacesCCDisclaimer = () => {
  return (
    <Box
      sx={{
        padding: "15px",
        display: "flex"
      }}
    >
      <Box
        sx={{
          padding: "15px",
          display: "flex"
        }}
      >
        <LockIcon />
      </Box>
      <Box>
        This is a secure portal. BlockSpaces does not store your credit card information. Your credit card information is encrypted and secured by Stripe. Please review our
        <a href="https://www.blockspaces.com/legal/privacy-policy">Privacy Policy </a>if you have any questions or concerns.
      </Box>
    </Box>
  );
};
