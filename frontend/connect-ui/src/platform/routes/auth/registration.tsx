import { CountryCode, countryNames } from "@blockspaces/shared/models/Countries";
import { Check } from "@icons";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Control, SubmitHandler, useForm } from "react-hook-form";
import Registration, { CheckWrap, Column, Form, Header, Row, Section, Success, SuccessCheck, SuccessText, SuccessTitle } from "./styles/registration.styles";
import { Button, Title, TextInput, Select, IOption, PhoneInputSelect, Loading } from "@platform/common";
import { UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { RegistrationErrorMessage } from "./registration-error-message";
import { useDoInitialLogin, useRegisterUser } from "@src/platform/hooks/user/mutations";
import { useRouter } from "next/router";

const RegistrationFormData = UserRegistrationDto;

enum ViewMode {
  form,
  success
}

const countries: IOption[] = Object.keys(countryNames).map((country) => {
  return { value: country, label: countryNames[country] };
});

const resolver = classValidatorResolver(RegistrationFormData);

/**
 * Provides the form that is used for new user registration
 */
const RegistrationForm = () => {
  const [viewMode, setViewMode] = useState(ViewMode.form);
  const [failureReason, setFailureReason] = useState<UserRegistrationFailureReason>(null);
  const { mutate: register, isLoading: submitting, isSuccess: registerIsSuccess, error: registerError, data: registerResult } = useRegisterUser();
  const { mutate: doInitialLogin, isLoading: doInitialLoginIsLoading, error: doInitialLoginError, data: doInitialLoginResult, isSuccess: doInitialLoginIsSuccess } = useDoInitialLogin();
  const form = useForm<UserRegistrationDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver,
    defaultValues: { country: CountryCode.UnitedStates }
  });
  const router = useRouter();
  // handle on load
  useEffect(() => {
    form.watch();
  }, []);

  useEffect(() => {
    if (submitting || doInitialLoginIsLoading) return;
    // handle error
    if (registerError) {
      setFailureReason((registerError as any)?.data?.failureReason);
      return;
    }
    // handle success
    if (registerIsSuccess) {
      setFailureReason(null);
      doInitialLogin({ username: form.getValues("email"), password: form.getValues("password") });
    }

    if (doInitialLoginIsSuccess) {
      setViewMode(ViewMode.success);
      doInitialLoginResult.twoFactorSetupComplete ? router.push("/auth?loginStep=2fa-entry") : router.push("/auth?loginStep=2fa-setup");
    }
  }, [submitting, registerResult, registerError, registerIsSuccess, doInitialLoginIsLoading, doInitialLoginIsSuccess]);

  const submitRegistration: SubmitHandler<UserRegistrationDto> = (registration) => {
    (global.window as any).grecaptcha.enterprise.ready(async () => {
      const token = await (global.window as any).grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY, { action: "LOGIN" });
      register({ ...registration, token } as any);
    });
  };

  const setStateCase = (e: ChangeEvent<HTMLInputElement>, country: string) => {
    if (country === CountryCode.UnitedStates) {
      e.target.value = e.target.value.substring(0, 2).toUpperCase();
    }
    // form.setValue('country', e.target.value)
  };

  const getFormContent = () => (
    <Form onSubmit={form.handleSubmit(submitRegistration)} id="registration-form">
      <Header>
        <Title style="modal" label="SIGN UP" href="/auth" />
      </Header>
      <Section>
        <Column style={{ marginRight: "1.75rem" }}>
          <TextInput
            register={form.register}
            name="companyName"
            label="COMPANY NAME"
            placeholder="BlockSpaces"
            value={form.getValues("companyName")}
            error={!!form.formState.errors["companyName"]}
            errorMessage={form.formState.errors["companyName"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="email"
            label="EMAIL*"
            placeholder="satoshi@blockspaces.com"
            value={form.getValues("email")}
            autoComplete="username email"
            error={!!form.formState.errors["email"]}
            errorMessage={form.formState.errors["email"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="firstName"
            label="FIRST NAME*"
            placeholder="Satoshi"
            value={form.getValues("firstName")}
            error={!!form.formState.errors["firstName"]}
            errorMessage={form.formState.errors["firstName"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="lastName"
            label="LAST NAME*"
            placeholder="Nakamoto"
            value={form.getValues("lastName")}
            error={!!form.formState.errors["lastName"]}
            errorMessage={form.formState.errors["lastName"]?.message || ""}
          />
          <PhoneInputSelect
            name="phone"
            label="PHONE*"
            control={form.control as unknown as Control}
            register={form.register}
            placeholder="Enter phone number"
            value={form.getValues("phone")}
            defaultCountry={CountryCode.UnitedStates}
            error={!!form.formState.errors["phone"]}
            errorMessage={form.formState.errors["phone"]?.message || ""}
          />
        </Column>
        <Column>
          <Select
            label="COUNTRY*"
            name="country"
            options={countries}
            selection={form.getValues("country") ? countries.filter((country) => country.value === form.getValues("country").toString())[0] : countries[CountryCode.UnitedStates]}
            onSelect={(option: IOption) => form.setValue("country", option.value as CountryCode)}
            register={form.register}
            variation="default"
          />

          <TextInput
            register={form.register}
            name="address1"
            label="ADDRESS 1*"
            placeholder="802 E. Whiting Street"
            value={form.getValues("address1")}
            error={!!form.formState.errors["address1"]}
            errorMessage={form.formState.errors["address1"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="address2"
            label="ADDRESS 2"
            value={form.getValues("address2")}
            error={!!form.formState.errors["address2"]}
            errorMessage={form.formState.errors["address2"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="city"
            label="CITY*"
            placeholder="Tampa"
            value={form.getValues("city")}
            error={!!form.formState.errors["city"]}
            errorMessage={form.formState.errors["city"]?.message || ""}
          />
          <TextInput
            register={form.register}
            name="state"
            label="STATE / PROVINCE / REGION"
            placeholder="FL"
            value={form.getValues("state")?.toUpperCase()}
            error={!!form.formState.errors["state"]}
            errorMessage={form.formState.errors["state"]?.message || ""}
            onChange={(e) => setStateCase(e, form.getValues("country"))}
            // maskChar="AA"
          />
          <TextInput
            register={form.register}
            name="zipCode"
            label="ZIP / POSTAL CODE*"
            placeholder="33602"
            value={form.getValues("zipCode")}
            error={!!form.formState.errors["zipCode"]}
            errorMessage={form.formState.errors["zipCode"]?.message || ""}
            // mask="99999"
          />
        </Column>
      </Section>
      <Section style={{ borderTop: "1px solid #f3f5ff" }}>
        <Column style={{ marginRight: "1.75rem" }}>
          <TextInput
            register={form.register}
            name="password"
            label="PASSWORD*"
            value={form.getValues("password")}
            type="password"
            autoComplete="new-password"
            error={!!form.formState.errors["password"]}
            errorMessage={form.formState.errors["password"]?.message || ""}
          />
        </Column>
        <Column>
          <TextInput
            register={form.register}
            name="verifyPassword"
            label="CONFIRM PASSWORD*"
            value={form.getValues("verifyPassword")}
            type="password"
            autoComplete="new-password"
            error={!!form.formState.errors["verifyPassword"]}
            errorMessage={form.formState.errors["verifyPassword"]?.message || ""}
          />
        </Column>
      </Section>
      <Section style={{ paddingTop: 0 }}>
        <Row style={{ justifyContent: "center" }}>
          <Button
            id="btnRegistrationSubmit"
            type="submit"
            label="GET STARTED"
            labelOnSubmit="CREATING ACCOUNT"
            submitting={submitting || doInitialLoginIsLoading || doInitialLoginIsSuccess}
            variation="simple"
          />
        </Row>
      </Section>
    </Form>
  );

  const getSuccessContent = () => (
    <Success id="registration-successful">
      <SuccessTitle>ACCOUNT CREATED</SuccessTitle>
      <CheckWrap>
        <SuccessCheck>
          <Check />
        </SuccessCheck>
      </CheckWrap>
      <SuccessText>Registration Successful!</SuccessText>
      <Loading when={true} />
    </Success>
  );

  return (
    <Registration data-loaded={true} id="registration-container">
      {viewMode === ViewMode.success ? getSuccessContent() : null}
      {viewMode === ViewMode.form ? getFormContent() : null}
      {failureReason && <RegistrationErrorMessage failureReason={failureReason} formData={form.getValues()} onHide={() => setFailureReason(null)} />}
    </Registration>
  );
};

export default RegistrationForm;
