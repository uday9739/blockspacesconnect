import { Box } from "@mui/material";
import { useWindowSize } from "@src/platform/hooks";
import { StripeCardElement, StripeCardElementOptions } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js/pure";
import { AddPaymentForm, CardNumberInput } from "./add-payment-method.styles";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import styled from "styled-components";
import { Button, Loading } from "../../common";
import { useUIStore } from "@src/providers";
import { getCartDetails, useAttachPaymentMethod } from "@src/platform/hooks/cart/mutations";
import { useRouter } from "next/router";
import { BlockspacesCCDisclaimer } from "./add-payment-method";

export const StyledAddPaymentMethod = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  overflow: auto;
`;

export const FormTitle = styled.h4`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 3.125rem;
  width: 100%;
  padding: 0 0.5rem;
  margin-bottom: 0.875rem;
  letter-spacing: 0.08rem;
  font-weight: 400;
  font-size: 1.25rem;
  text-align: left;
`;

//https://mtlynch.io/stripe-recording-its-customers/
loadStripe.setLoadParameters({ advancedFraudSignals: false }); // this prevents stripe from tracking user

type Props = { next: () => void; setErrorMsg: any };
export const CollectCCFreeOffer = ({ next, setErrorMsg }: Props) => {
  let cardElement: StripeCardElement = null;
  const ui = useUIStore();
  const cart = getCartDetails();
  const [isCCFormComplete, setIsCCFormComplete] = useState(false);
  const { rem } = useWindowSize();
  const stripe = useStripe();
  const elements = useElements();
  const { mutate: attachPaymentMethod, isLoading: attachPaymentMethodIsLoading, isSuccess: attachPaymentMethodIsSuccess, error: attachPaymentMethodError } = useAttachPaymentMethod();
  const router = useRouter();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    if (elements && !cardElement) {
      cardElement = elements.getElement(CardElement);
      cardElement.on("change", (data) => {
        setIsCCFormComplete(data.complete);
      });
      setIsMounting(false);
    }
  }, [elements]);

  useEffect(() => {
    if (attachPaymentMethodIsLoading) return;
    if (attachPaymentMethodIsSuccess) {
      ui.showToast({
        message: "Payment method created successfully",
        alertType: "success",
        autoHideDuration: 1000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      next();
    } else if (attachPaymentMethodError) {
      setErrorMsg((attachPaymentMethodError as any)?.message);
    }
  }, [attachPaymentMethodIsLoading, attachPaymentMethodIsSuccess, attachPaymentMethodError]);

  const cardElementOptions: StripeCardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          lineHeight: `${4.25 * rem}px`,
          fontSize: `${1.5 * rem}px`
        }
      }
    }),
    [rem]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || attachPaymentMethodIsLoading) return;
    setErrorMsg(null);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)
      });
      if (error) {
        //
      } else {
        attachPaymentMethod({ paymentMethodId: paymentMethod.id, cartId: cart.cart.id });
      }
    } catch (error) {
      //
    }
  };

  const _canSubmit = () => {
    return stripe !== (null || undefined) && isCCFormComplete === true;
  };

  return (
    <StyledAddPaymentMethod>
      <AddPaymentForm onSubmit={handleSubmit}>
        <FormTitle>Add Credit Card</FormTitle>
        <CardNumberInput>
          <CardElement id="cc-info-element" options={cardElementOptions} />
        </CardNumberInput>
        <Loading when={isMounting} />
        <BlockspacesCCDisclaimer />
        <Button
          id="btnAddPayment"
          type="submit"
          variation="default-new"
          label={`Attach`}
          labelOnSubmit="Processing"
          disabled={_canSubmit() === false}
          submitting={attachPaymentMethodIsLoading}
          width="16rem"
          height="3.325rem"
          customStyle={{ marginLeft: "auto", marginRight: "auto", marginTop: "25px" }}
        />
      </AddPaymentForm>
    </StyledAddPaymentMethod>
  );
};
