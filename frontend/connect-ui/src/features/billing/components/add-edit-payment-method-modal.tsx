import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { AddPaymentContainer, AddPaymentForm, CardNumberInput, StyledAddPaymentMethod } from "@src/platform/components/modals/add-app/add-payment-method.styles";
import { SelectionSummary } from "@src/platform/components/modals/add-app/selection-summary";
import { useWindowSize } from "@src/platform/hooks";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeCardElement, StripeCardElementOptions } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useGetPaymentMethods, useGetPublishableKey } from "../hooks/queries";
import { loadStripe } from "@stripe/stripe-js/pure";
import { IOption, Loading, Select, TextInput } from "@src/platform/components/common";
import { BillingForm, FormTitle } from "@src/platform/components/modals/add-app/add-billing-info.styles";
import { Alert, Box, FormControl, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import { CountryCode, countryNames } from "@blockspaces/shared/models/Countries";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { BillingAddressDto } from "@blockspaces/shared/dtos/cart";
import { countries, _getFormattedAddressSummary } from "../utils";
import { useGetConnectSubscription, useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { Billing } from "@src/platform/components";
import { useAttachPaymentMethod } from "../hooks/mutations";
import { useUIStore } from "@src/providers";
import { IUser } from "@blockspaces/shared/models/users";
import { ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { BlockspacesCCDisclaimer } from "@src/platform/components/modals/add-app/add-payment-method";

//https://mtlynch.io/stripe-recording-its-customers/
loadStripe.setLoadParameters({ advancedFraudSignals: false }); // this prevents stripe from tracking user

export const AddEditPaymentMethodsModal = () => {
  const { data: key, isLoading: isKeyLoading } = useGetPublishableKey();
  const stripePromise = useMemo(async () => {
    if (!key) return;
    return loadStripe(key);
  }, [key]);
  if (isKeyLoading) return <Loading when={isKeyLoading} />;
  return (
    <Elements stripe={stripePromise}>
      <Main />
    </Elements>
  );
};

const Main = () => {
  let cardElement: StripeCardElement = null;
  const router = useRouter();
  const ui = useUIStore();
  const { data: user } = useGetCurrentUser();
  const { data: connectSubscription } = useGetConnectSubscription();
  const isConnectSubscriptionActive = connectSubscription?.status === ConnectSubscriptionStatus.Active;
  const { rem } = useWindowSize();
  const stripe = useStripe();
  const elements = useElements();
  const isNew = !router?.query?.id;
  const isEdit = !isNew;
  const title = isEdit ? "Edit payment method" : "Add payment method";
  const [errorMsg, setErrorMsg] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [billingAddressIsSameAsProfile, setBillingAddressIsSameAsProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCCFormComplete, setIsCCFormComplete] = useState(false);
  const { data: paymentMethods, isLoading } = useGetPaymentMethods();
  const { mutate: attachPaymentMethod, isLoading: attachPaymentMethodIsLoading, isSuccess: attachPaymentMethodIsSuccess, error: attachPaymentMethodError } = useAttachPaymentMethod();
  const billingForm = useForm<BillingAddressDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: classValidatorResolver(BillingAddressDto)
  });
  billingForm.watch();

  const cardElementOptions: StripeCardElementOptions = useMemo(
    () => ({
      value: {
        postalCode: billingForm?.getValues("postalCode")
      },
      style: {
        base: {
          lineHeight: `${4.25 * rem}px`,
          fontSize: `${1.5 * rem}px`
        }
      }
    }),
    [rem, billingForm?.getValues("postalCode")]
  );

  //#region handle init
  useEffect(() => {
    if (isLoading) return;
    if (isEdit && !paymentMethod) {
      setPaymentMethod(paymentMethods.find((x) => x.id === router?.query?.id));
    }
  }, [isLoading, isEdit]);
  //#endregion

  //#region handle set as profile address
  useEffect(() => {
    if (billingAddressIsSameAsProfile) {
      billingForm.setValue("fullName", `${user?.firstName} ${user?.lastName}`);
      billingForm.setValue("addressLine1", user?.address?.address1);
      billingForm.setValue("addressLine2", user?.address?.address2);
      billingForm.setValue("city", user?.address?.city);
      billingForm.setValue("country", user?.address?.country);
      billingForm.setValue("postalCode", user?.address?.zipCode);
      billingForm.setValue("state", user?.address?.state);
      billingForm.trigger();
    } else {
      //
    }
  }, [billingAddressIsSameAsProfile]);
  useEffect(() => {
    if (billingForm.formState.isDirty && billingAddressIsSameAsProfile) {
      setBillingAddressIsSameAsProfile(false);
    }
  }, [billingForm?.formState?.isDirty]);
  //#endregion

  //#region listen to stripe changes
  useEffect(() => {
    if (elements && !cardElement) {
      cardElement = elements.getElement(CardElement);
      cardElement.on("change", (data) => {
        setIsCCFormComplete(data.complete);
      });
    }
  }, [elements]);
  //#endregion

  //#region handle submitting
  useEffect(() => {
    if (!attachPaymentMethodIsLoading && isSubmitting) setIsSubmitting(false);
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
      _onCancel();
    } else if (attachPaymentMethodError) {
      setErrorMsg((attachPaymentMethodError as any)?.message);
    }
  }, [attachPaymentMethodIsLoading, isLoading, attachPaymentMethodIsSuccess, attachPaymentMethodError]);
  //#endregion

  const _onCancel = () => {
    router.replace("/billing");
  };

  const handleSubmit = async () => {
    if (!stripe || !elements || isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: {
        email: user?.email,
        name: billingForm?.getValues("fullName"),
        address: {
          line1: billingForm?.getValues("addressLine1"),
          line2: billingForm?.getValues("addressLine2"),
          city: billingForm?.getValues("city"),
          country: billingForm?.getValues("country"),
          postal_code: billingForm?.getValues("postalCode"),
          state: billingForm?.getValues("state")
        }
      }
    });

    if (error) {
      setIsSubmitting(false);
    } else {
      attachPaymentMethod({ paymentMethodId: paymentMethod.id, setAsDefault: billingForm?.getValues("setAsDefault") === true });
    }
  };

  const _canSubmit = () => {
    return stripe !== (null || undefined) && billingForm?.formState?.isValid === true && isCCFormComplete === true;
  };

  return (
    <ModalContent
      size="large"
      disablePrimaryActionOverride={_canSubmit() === false}
      title={title}
      isSubmitting={isSubmitting}
      onPrimaryActionClick={handleSubmit}
      onCancel={_onCancel}
      isLoading={isLoading}
    >
      <StyledAddPaymentMethod id="Add-Payment-Method-Container">
        {errorMsg ? (
          <Alert color="error" severity="error">
            {errorMsg}
          </Alert>
        ) : (
          <></>
        )}
        <BillingForm id="billing-address-form">
          <FormTitle>
            Billing Address
            {/* Flag to auto populate billing info */}
            {isNew && user?.address ? (
              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        id="billingAddressIsSameAsProfile"
                        checked={billingAddressIsSameAsProfile}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBillingAddressIsSameAsProfile(event.target.checked)}
                      />
                    }
                    label="Same as Profile ?"
                  />
                </FormGroup>
              </FormControl>
            ) : (
              <></>
            )}
          </FormTitle>
          <Box id="billing-address-summary" sx={{ display: !billingAddressIsSameAsProfile ? "none" : "flex", flexDirection: "column", width: "100%", marginLeft: "10px" }}>
            <Typography fontFamily={"'Roboto Mono',monospace"}>{_getFormattedAddressSummary(user)}</Typography>
          </Box>
          <Box id="billing-address-form-body" sx={{ display: billingAddressIsSameAsProfile ? "none" : "flex", flexDirection: "column", width: "100%" }}>
            <TextInput
              register={billingForm.register}
              name="fullName"
              label="Full Name"
              type="text"
              value={billingForm.getValues("fullName")}
              toolTipPlacement={"top"}
              error={!!billingForm.formState.errors["fullName"]}
              errorMessage={billingForm.formState.errors["fullName"]?.message || ""}
            />
            <Box sx={{ display: "flex" }}>
              <TextInput
                register={billingForm.register}
                name="addressLine1"
                label="Address Line 1"
                type="text"
                value={billingForm.getValues("addressLine1")}
                toolTipPlacement={"top"}
                error={!!billingForm.formState.errors["addressLine1"]}
                errorMessage={billingForm.formState.errors["addressLine1"]?.message || ""}
              />
              <TextInput register={billingForm.register} name="addressLine2" label="Address Line 2" type="text" value={billingForm.getValues("addressLine2")} />
            </Box>
            <Box sx={{ display: "flex" }}>
              <TextInput
                register={billingForm.register}
                name="city"
                label="City"
                type="text"
                value={billingForm.getValues("city")}
                toolTipPlacement={"top"}
                error={!!billingForm.formState.errors["city"]}
                errorMessage={billingForm.formState.errors["city"]?.message || ""}
              />
              <Box
                sx={{
                  width: "100%",
                  "& div": {
                    maxWidth: "100% !important"
                  }
                }}
              >
                <Select
                  size="lg"
                  name="country"
                  label="Country"
                  options={countries}
                  selection={billingForm.getValues("country") ? countries.filter((country) => country.value === billingForm.getValues("country").toString())[0] : countries[CountryCode.UnitedStates]}
                  onSelect={(option: IOption) => {
                    billingForm.setValue("country", option.value as CountryCode);
                    billingForm.trigger();
                  }}
                  register={billingForm.register}
                  variation="default"
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex" }}>
              <TextInput
                register={billingForm.register}
                name="postalCode"
                label="Postal Code"
                type="text"
                value={billingForm.getValues("postalCode")}
                toolTipPlacement={"top"}
                error={!!billingForm.formState.errors["postalCode"]}
                errorMessage={billingForm.formState.errors["postalCode"]?.message || ""}
              />
              <TextInput
                register={billingForm.register}
                name="state"
                label="State"
                type="text"
                value={billingForm.getValues("state")}
                toolTipPlacement={"top"}
                error={!!billingForm.formState.errors["state"]}
                errorMessage={billingForm.formState.errors["state"]?.message || ""}
              />
            </Box>
          </Box>
        </BillingForm>
        <AddPaymentContainer id="Add-Payment-Container">
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            {isConnectSubscriptionActive ? (
              <FormControl component="fieldset" sx={{ marginRight: "20px", marginBottom: "10px" }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        id="set-cc-as-default"
                        color="primary"
                        checked={billingForm.getValues("setAsDefault") === true}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => billingForm.setValue("setAsDefault", event.target.checked)}
                      />
                    }
                    label="Set as default ?"
                  />
                </FormGroup>
              </FormControl>
            ) : (
              <></>
            )}
          </Box>
          <CardNumberInput>
            <CardElement id="cc-info-element" options={cardElementOptions} />
          </CardNumberInput>
          <BlockspacesCCDisclaimer />
        </AddPaymentContainer>
      </StyledAddPaymentMethod>
    
    </ModalContent>
  );
};
