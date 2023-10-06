import { BillingAddressDto } from "@blockspaces/shared/dtos/cart";
import { CountryCode, countryNames } from "@blockspaces/shared/models/Countries";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TextInput, Button, Select, IOption, Loading } from "@platform/common";
import { Apps, Wallet } from "@icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { BillingForm, FormTitle, StyledBillingInfo } from "./add-billing-info.styles";
import { SelectionSummary } from "./selection-summary";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Box } from "@mui/system";
import { useGetCurrentUser, useGetUserProfile } from "@src/platform/hooks/user/queries";
import { getCartDetails, useSubmitBillingInfo } from "@platform/cart/mutations";
import { getOfferPriceDetails } from "@src/platform/utils/connect-subscription";
import { useUpdateUserProfile } from "@src/platform/hooks/user/mutations";
import { UserProfileDto } from "../../../../../../../shared/dtos/users";
import { getUserProfileFormContent, resolver } from "../user-profile";
import { event } from "nextjs-google-analytics";
import { Autocomplete, TextField } from "@mui/material";

type Props = { next: (cartStatus?: string) => void; setErrorMsg: any };
export const AddBillingInfo = ({ next, setErrorMsg }: Props) => {
  const [billingAddressIsSameAsProfile, setBillingAddressIsSameAsProfile] = useState(false);
  const { mutate: submitBillingInfo, isLoading: isBillingInfoLoading, isSuccess: submitBillingInfoSuccess, error: submitBillingInfoError, data: submitBillingInfoResult } = useSubmitBillingInfo();
  const cart = getCartDetails();
  const { data: user, refetch: refetchUser, isFetching: isUserFetching } = useGetCurrentUser();
  const billingForm = useForm<BillingAddressDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: classValidatorResolver(BillingAddressDto)
  });
  billingForm.watch();

  if (submitBillingInfoError) setErrorMsg(submitBillingInfoError["error"]);
  if (submitBillingInfoSuccess) next(submitBillingInfoResult.data?.cart?.status);

  const _submitBillingInfo: SubmitHandler<any> = async (data) => {
    event("addBillingInfo", {
      category: `cart`,
      userId: user.id
    });
    submitBillingInfo({ cartId: cart?.cart.id, billingInfo: data });
  };

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
      billingForm.reset();
    }
  }, [billingAddressIsSameAsProfile]);
  useEffect(() => {
    if (billingForm.formState.isDirty && billingAddressIsSameAsProfile) {
      setBillingAddressIsSameAsProfile(false);
    }
  }, [billingForm?.formState?.isDirty]);

  const onBillingAddressIsSameAsProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBillingAddressIsSameAsProfile(event.target.checked);
  };

  const countries: IOption[] = Object.keys(countryNames).map((country) => {
    return { value: country, label: countryNames[country] };
  });
  const getSelectedOffer = () => {
    const selectedItem = cart?.cart?.items[0];
    return cart?.catalog?.find((x) => x.id === selectedItem?.offerId);
  };

  const onUserProfileUpdateSuccess = () => refetchUser();

  const setStateCase = (e: ChangeEvent<HTMLInputElement>, country: string) => {
    if (country === CountryCode.UnitedStates) {
      e.target.value = e.target.value.substring(0, 2).toUpperCase();
    }
  };

  const { priceDetails } = getOfferPriceDetails(getSelectedOffer(), (cart?.network as any)?._id);
  return (
    <StyledBillingInfo id="add-billing-info">
      <SelectionSummary
        label={`${getSelectedOffer()?.tier?.displayName} Plan`}
        details={[
          {
            icon: <Apps />,
            copy: `${getSelectedOffer()?.description}`
          },
          {
            icon: <Wallet />,
            copy: `${priceDetails}`
          }
        ]}
      />
      <Loading when={isUserFetching}></Loading>
      {/* Handle blank user profile */}
      {!user?.address ? (
        <>
          <UserProfileForm onSuccess={onUserProfileUpdateSuccess} isSubmittingOverride={isUserFetching} />
        </>
      ) : (
        <></>
      )}

      {/* Handle user profile completed */}
      {user?.address ? (
        <>
          <BillingForm onSubmit={billingForm.handleSubmit(_submitBillingInfo)}>
            <FormTitle>
              Enter Billing Address
              {/* Flag to auto populate billing info */}
              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  <FormControlLabel
                    control={<Switch id="billingAddressIsSameAsProfile" checked={billingAddressIsSameAsProfile} onChange={onBillingAddressIsSameAsProfileChange} />}
                    label="Same as Profile ?"
                  />
                </FormGroup>
              </FormControl>
            </FormTitle>
            {!billingAddressIsSameAsProfile ? (
              <>
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
                  <Controller
                    name="country"
                    control={billingForm.control}
                    render={({ field: { onChange, value }, fieldState: { error }, formState }) => (
                      <Autocomplete
                        disablePortal
                        autoComplete
                        id="combo-box-demo"
                        {...billingForm.register("country", { required: true })}
                        options={countries}
                        // defaultValue={countries.filter((country) => country.value ===getValues('country'))[0]}
                        getOptionLabel={(option) => option.label}
                        onChange={(event, option: IOption) => {
                          billingForm.setValue("country", option?.value as CountryCode);
                        }}
                        value={countries.filter((country) => country.value === billingForm.getValues("country"))[0] || { value: "", label: "" }}
                        renderInput={(params) => (
                          <TextField
                            fullWidth
                            {...params}
                            inputProps={{
                              ...params.inputProps,
                              value: billingForm.getValues("country") && countries?.filter((country) => country.value === billingForm.getValues("country"))[0]?.label,
                              disableUnderline: true
                            }}
                            label="COUNTRY"
                          />
                        )}
                      />
                    )}
                  />
                </Box>
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
              </>
            ) : (
              <></>
            )}

            <Button
              id="btnSubmitBillingInfo"
              type="submit"
              width="18rem"
              height="3.325rem"
              variation="default-new"
              label="Next"
              labelOnSubmit="Saving Billing Information..."
              submitting={isBillingInfoLoading && !submitBillingInfoSuccess}
              customStyle={{
                margin: "1rem 0 .5rem"
                // marginBottom: '1.25rem',
                // borderWidth: '1px',
                // fontSize: '.8125rem',
              }}
            />
          </BillingForm>
        </>
      ) : (
        <></>
      )}
    </StyledBillingInfo>
  );
};

type UserProfileFormProps = { isSubmittingOverride: boolean; onSuccess: () => void };
const UserProfileForm = ({ isSubmittingOverride, onSuccess }) => {
  const { mutate: updateUserProfile, isLoading: isSubmitting, isError, isSuccess: updateUserProfileIsSuccess } = useUpdateUserProfile();
  const { isLoading: loading, data: userProfile, isSuccess } = useGetUserProfile();
  const { watch, reset, formState, handleSubmit, control, register, getValues, setValue, setError, clearErrors } = useForm<UserProfileDto>({
    mode: "onTouched",
    resolver: resolver
  });
  watch();

  useEffect(() => {
    if (loading || !isSuccess) return;
    reset({
      ...userProfile,
      country: CountryCode.UnitedStates
    });
  }, [loading, userProfile]);

  useEffect(() => {
    if (isSubmitting) return;
    if (updateUserProfileIsSuccess) {
      // handle success
      onSuccess();
    }
  }, [isSubmitting, updateUserProfileIsSuccess]);

  const submitUserProfile: SubmitHandler<UserProfileDto> = (userProfile) => updateUserProfile(userProfile);

  return (
    <>
      {loading ? (
        <Loading when={true}></Loading>
      ) : (
        <form onSubmit={handleSubmit(submitUserProfile)} id="user-profile-from">
          <FormTitle>Please complete user profile</FormTitle>
          <Box
            sx={{
              "& #btnSveUserProfile": {
                margin: "auto"
              }
            }}
          >
            {getUserProfileFormContent({
              control,
              formState,
              getValues,
              isSubmitting: isSubmitting || isSubmittingOverride,
              register,
              setValue,
              showSaveBtn: true
            })}
          </Box>
        </form>
      )}
    </>
  );
};
