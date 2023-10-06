import { CountryCode, countryNames } from "@blockspaces/shared/models/Countries";
import { Check } from "@icons";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Control, SubmitHandler, useForm } from "react-hook-form";
import Registration, { CheckWrap, Column, Form, Header, Row, Section, Success, SuccessCheck, SuccessText, SuccessTitle } from "./styles/registration.styles";
import { Button, Title, TextInput, Select, IOption, PhoneInputSelect, Loading } from "@platform/common";
import { QuickUserRegistrationDto, UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { RegistrationErrorMessage } from "./registration-error-message";
import { useDoInitialLogin, useQuickRegisterUser, useRegisterUser } from "@src/platform/hooks/user/mutations";
import { useRouter } from "next/router";

const RegistrationFormData = QuickUserRegistrationDto;

enum ViewMode {
  form,
  success
}

const resolver = classValidatorResolver(RegistrationFormData);

/**
 * Provides the form that is used for new user registration
 */
const QuickRegistrationForm = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState(ViewMode.form);
  const [failureReason, setFailureReason] = useState<UserRegistrationFailureReason>(null);
  const { mutate: register, isLoading: submitting, isSuccess: registerIsSuccess, error: registerError, data: registerResult } = useQuickRegisterUser();
  const { mutate: doInitialLogin, isLoading: doInitialLoginIsLoading, error: doInitialLoginError, data: doInitialLoginResult, isSuccess: doInitialLoginIsSuccess } = useDoInitialLogin();
  const form = useForm<QuickUserRegistrationDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver,
    defaultValues: {}
  });

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
      registration.acceptInvite = router?.query?.acceptInvite==="true";
      registration.inivtorTenantId = router?.query?.invitorTenantId?.toString();
      register({ ...registration, token } as any);
    });
  };

  const getFormContent = () => (
    <Form onSubmit={form.handleSubmit(submitRegistration)} id="registration-form" style={{ width: "36rem" }}>
      <Header>
        <Title style="modal" label="SIGN UP" href="/auth?loginStep=login" />
      </Header>
      <Section>
        <Column style={{ marginRight: "1.75rem" }}>
          <TextInput
            register={form.register}
            name="email"
            label="EMAIL*"
            placeholder="satoshi@blockspaces.com"
            value={form.getValues("email")}
            autoComplete="email"
            error={!!form.formState.errors["email"]}
            errorMessage={form.formState.errors["email"]?.message || ""}
          />
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
      <Section style={{ paddingTop: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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

export default QuickRegistrationForm;
