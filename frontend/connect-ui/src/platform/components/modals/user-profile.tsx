import { CountryCode, countryNames } from "@blockspaces/shared/models/Countries";
import { UserProfileDto } from "@blockspaces/shared/dtos/users";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { Control, Controller, FormState, SubmitHandler, useForm, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Title, TextInput, Button, Select, IOption, PhoneInputSelect } from "@platform/common";
import UserProfileStyles, { Column, Header, Section } from "./styles/user-profile-styles";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useGetUserProfile } from "@src/platform/hooks/user/queries";
import { useUpdateUserProfile } from "@src/platform/hooks/user/mutations";
import { useUIStore } from "@src/providers";
import { ModalContent } from "../common/modal/modal-content";
import { Autocomplete, TextField } from "@mui/material";
import { BorderColor } from "@mui/icons-material";

const countries: IOption[] = Object.keys(countryNames).map((country) => {
  return { value: country, label: countryNames[country] };
});

export const resolver = classValidatorResolver(UserProfileDto);
export type UserProfileFormProps = {
  showSaveBtn?: boolean;
  isSubmitting: boolean;
  register: UseFormRegister<UserProfileDto>;
  formState: FormState<UserProfileDto>;
  getValues: UseFormGetValues<UserProfileDto>;
  control: Control<UserProfileDto, any>;
  setValue: UseFormSetValue<UserProfileDto>;
};

export const getUserProfileFormContent = ({ isSubmitting, register, formState, getValues, control, setValue, showSaveBtn = false }: UserProfileFormProps) => {
  const setStateCase = (e: ChangeEvent<HTMLInputElement>, country: string) => {
    if (country === CountryCode.UnitedStates) {
      e.target.value = e.target.value.substring(0, 2).toUpperCase();
    }
  };

  return (
    <>
      <Section>
        <Column>
          <TextInput
            register={register}
            name="companyName"
            label="COMPANY NAME"
            value={getValues("companyName")}
            placeholder="BlockSpaces"
            error={!!formState.errors["companyName"]}
            errorMessage={formState.errors["companyName"]?.message || ""}
          />
          <TextInput
            register={register}
            name="email"
            label="EMAIL*"
            value={getValues("email")}
            placeholder="satoshi@blockspaces.com"
            disabled={true}
            error={!!formState.errors["email"]}
            errorMessage={formState.errors["email"]?.message || ""}
          />
          <TextInput
            register={register}
            name="firstName"
            label="FIRST NAME*"
            value={getValues("firstName")}
            placeholder="Satoshi"
            error={!!formState.errors["firstName"]}
            errorMessage={formState.errors["firstName"]?.message || ""}
          />
          <TextInput
            register={register}
            name="lastName"
            label="LAST NAME*"
            value={getValues("lastName")}
            placeholder="Nakamoto"
            error={!!formState.errors["lastName"]}
            errorMessage={formState.errors["lastName"]?.message || ""}
          />
          <PhoneInputSelect
            name="phone"
            label="PHONE*"
            control={control as unknown as Control}
            register={register}
            placeholder="Enter phone number"
            value={getValues("phone") && getValues("phone").startsWith("+") ? getValues("phone") : "+".concat(getValues("phone"))}
            defaultCountry={CountryCode.UnitedStates}
            error={!!formState.errors["phone"]}
            errorMessage={formState.errors["phone"]?.message || ""}
          />
        </Column>
        <Column>
          <Controller
            name="country"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error }, formState }) => (
              <Autocomplete
                disablePortal
                autoComplete
                id="combo-box-demo"
                {...register("country", { required: true })}
                options={countries}
                // defaultValue={countries.filter((country) => country.value ===getValues('country'))[0]}
                getOptionLabel={(option) => option.label}
                onChange={(event, option: IOption) => {
                  setValue("country", option?.value as CountryCode);
                }}
                value={countries.filter((country) => country.value === getValues("country"))[0] || { value: "", label: "" }}
                renderInput={(params) => (
                  <TextField
                    fullWidth
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                      value: getValues("country") && countries?.filter((country) => country.value === getValues("country"))[0]?.label,
                      disableUnderline: true
                    }}
                    label="COUNTRY"
                  />
                )}
              />
            )}
          />
          <TextInput
            register={register}
            name="address1"
            label="ADDRESS LINE 1*"
            value={getValues("address1")}
            placeholder="802 E. Whiting Street"
            error={!!formState.errors["address1"]}
            errorMessage={formState.errors["address1"]?.message || ""}
          />
          <TextInput
            register={register}
            name="address2"
            label="ADDRESS LINE 2"
            value={getValues("address2")}
            error={!!formState.errors["address2"]}
            errorMessage={formState.errors["address2"]?.message || ""}
          />
          <TextInput
            register={register}
            name="city"
            label="CITY*"
            value={getValues("city")}
            placeholder="Tampa"
            error={!!formState.errors["city"]}
            errorMessage={formState.errors["city"]?.message || ""}
          />
          <TextInput
            register={register}
            name="state"
            label="STATE / PROVINCE / REGION"
            value={getValues("state")}
            placeholder=""
            onChange={(e) => setStateCase(e, getValues("country"))}
            error={!!formState.errors["state"]}
            errorMessage={formState.errors["state"]?.message || ""}
          />
          <TextInput
            register={register}
            name="zipCode"
            label="ZIP / POSTAL CODE*"
            value={getValues("zipCode")}
            placeholder="33602"
            error={!!formState.errors["zipCode"]}
            errorMessage={formState.errors["zipCode"]?.message || ""}
          />
        </Column>
      </Section>
      {showSaveBtn ? (
        <>
          {" "}
          <Column style={{ paddingTop: ".875rem" }} id="update-profile-actions">
            <Button id="btnSveUserProfile" type="submit" label="SAVE CHANGES" width="28rem" labelOnSubmit="SAVING CHANGES" submitting={isSubmitting || formState.isSubmitting} />
          </Column>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export const UserProfile = () => {
  const router = useRouter();
  const uiStore = useUIStore();
  const { mutate: updateUserProfile, isLoading: isSubmitting, isError, isSuccess: updateUserProfileIsSuccess } = useUpdateUserProfile();
  const returnQuery = { ...router.query };
  delete returnQuery.modal;
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
      country: userProfile.country || CountryCode.UnitedStates
    });
  }, [loading, userProfile]);

  useEffect(() => {
    if (isSubmitting) return;
    if (updateUserProfileIsSuccess) {
      uiStore.showToast({
        message: "Profile Updated",
        alertType: "success",
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      router.push({
        pathname: router.pathname,
        query: returnQuery
      });
    }
  }, [isSubmitting, updateUserProfileIsSuccess]);

  const submitUserProfile: SubmitHandler<UserProfileDto> = (userProfile) => {
    updateUserProfile(userProfile);
  };
  const _onCancel = () => {
    if (router.pathname === "/connect") {
      router.back();
    } else router.replace({ pathname: router.pathname, query: returnQuery });
  };

  return (
    <>
      <ModalContent
        size="small"
        title={`Account Settings`}
        primaryBtnText="Save"
        secondaryBtnText="Cancel"
        onPrimaryActionClick={handleSubmit(submitUserProfile)}
        onCancel={_onCancel}
        isSubmitting={loading}
      >
        {loading
          ? "Loading user profile..."
          : getUserProfileFormContent({
              control,
              formState,
              getValues,
              isSubmitting,
              register,
              setValue
            })}
      </ModalContent>
    </>
  );
};
