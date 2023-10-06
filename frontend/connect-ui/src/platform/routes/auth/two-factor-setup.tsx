import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginCredentials } from "@blockspaces/shared/dtos/users";
import { useUIStore } from "@ui";
import { Button, Title, TextInput, Loading } from "@platform/common";
import TwoFactorSetup, {
  Authenticator,
  AuthenticatorLabel,
  AuthenticatorLogo,
  Authenticators,
  Step,
  StepDescription,
  StepLabel,
  Steps,
  Sections,
  Section,
  Subtitle,
  SectionDivider,
  QRCode,
  SecretKey,
  SecurityBox,
  SecurityLabel,
  SecurityText,
  BackToConfigure,
  LargeSubtitle,
  ConfirmForm
} from "./styles/two-factor-setup.styles";
import Link from "next/link";
import { TwoFactorCodeFormDto } from "@blockspaces/shared/dtos/authentication/TwoFactorCodeFormDto";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useConfigure2fa, useLoginTwoFactor } from "@src/platform/hooks/user/mutations";
import { useGetInitialLandingPage } from "@src/platform/hooks/user/queries";

type TwoFactorSetupProps = {
  credentials: LoginCredentials;
};

const resolver = classValidatorResolver(TwoFactorCodeFormDto);

export default function TWO_FACTOR_SETUP({ credentials }: TwoFactorSetupProps) {
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const uiStore = useUIStore();
  const router = useRouter();
  const { defaultLanding } = useGetInitialLandingPage();
  const { mutate: configure2fa, isLoading: loading, data: twoFactorSetupData, error: configure2faError, isSuccess: configure2faIsSuccess } = useConfigure2fa();
  const { mutate: login2fa, isLoading: submitting, data: loginResult, error: loginError, isSuccess: loginSuccess } = useLoginTwoFactor();
  const form = useForm<TwoFactorCodeFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });

  // handle on load
  useEffect(() => {
    form.watch();
    if (!credentials || configure2faIsSuccess) return;
    configure2fa({ username: credentials.email, password: credentials.password });
  }, []);

  useEffect(() => {
    if (loginError) {
      return uiStore.showToast({
        message: "Invalid two-factor code",
        alertType: "error",
        position: { horizontal: "center", vertical: "top" }
      });
    }

    if (loginSuccess) {
      router.push(defaultLanding);
    }
  }, [submitting, loginSuccess, loginResult, loginError]);

  const doTwoFactorLogin: SubmitHandler<TwoFactorCodeFormDto> = (formData) =>
    login2fa({
      email: credentials.email,
      password: credentials.password,
      twoFactorCode: formData.code
    });

  const AuthenticatorLinks = useMemo(
    () =>
      [
        { logo: "/images/authy.png", label: "Authy", href: "https://authy.com/" },
        { logo: "/images/lastpass.png", label: "LastPass", href: "https://lastpass.com/auth/" },
        { logo: "/images/microsoft-authenticator.png", label: "Microsoft Authenticator", href: "https://www.microsoft.com/en-us/security/mobile-authenticator-app" },
        { logo: "/images/google-authenticator.png", label: "Google Authenticator", href: "https://support.google.com/accounts/answer/1066447" }
      ].map((authenticator, index) => (
        <Link key={`link-label-${index}`} href={authenticator.href} passHref>
          <Authenticator target="_blank" id={`link-label-${authenticator.label}`}>
            <AuthenticatorLogo src={authenticator.logo} />
            <AuthenticatorLabel>{authenticator.label}</AuthenticatorLabel>
          </Authenticator>
        </Link>
      )),
    []
  );

  return (
    <TwoFactorSetup loading={loading} visible={true} showCodeEntry={showCodeEntry} id="2fa-setup-container">
      {loading ? (
        <>
          <Title label="LOADING" style="modal" href="/auth?loginStep=login" />
          <Loading when={loading} />
        </>
      ) : showCodeEntry ? (
        <>
          <BackToConfigure onClick={() => setShowCodeEntry(false)}>{"< BACK TO CONFIGURE"}</BackToConfigure>
          <Title label="CONFIRM 2FA" style="modal" />
          <Subtitle>Enter the code provided by your 2FA app</Subtitle>
          <ConfirmForm onSubmit={form.handleSubmit(doTwoFactorLogin)} id="confirm-2fa-form">
            <TextInput style="twoFactor" register={form.register} name="code" label="2FA CODE*" placeholder="######" value={form.getValues("code")} mask="999999" alignment="center" autoFocus />
            <Button id="btnComplete2FA" type="submit" label="COMPLETE 2FA SETUP" labelOnSubmit="CONFIRMING CODE" submitting={submitting} customStyle={{ margin: "auto" }} />
          </ConfirmForm>
        </>
      ) : (
        <>
          <Title label="CONFIGURE 2FA" style="modal" href="/auth?loginStep=login" />
          <LargeSubtitle>For your security, BlockSpaces Connect requires 2FA on every account</LargeSubtitle>
          <Steps>
            <Step>
              <StepLabel>STEP 1</StepLabel>
              <StepDescription>Install/open your 2FA app of choice</StepDescription>
              <Authenticators>{AuthenticatorLinks}</Authenticators>
            </Step>
            <Step wide>
              <StepLabel>STEP 2</StepLabel>
              <Sections>
                <Section style={{ flex: 3 }}>
                  <StepDescription>Scan this QR code</StepDescription>
                  <QRCode src={`data:image/png;base64,${twoFactorSetupData?.barcode}`} />
                </Section>
                <SectionDivider>OR</SectionDivider>
                <Section style={{ flex: 4 }}>
                  <StepDescription>Manually enter the following key</StepDescription>
                  <SecretKey id="twoFaSecretKey">{twoFactorSetupData?.secret}</SecretKey>
                  <SecurityBox>
                    <SecurityLabel>SECURITY BEST PRACTICE</SecurityLabel>
                    <SecurityText>We recommend saving a copy of the QR code and/or the key in a secure location as a hard-copy backup in the event you lose access to your 2FA device</SecurityText>
                  </SecurityBox>
                </Section>
              </Sections>
            </Step>
          </Steps>
          <Button id="btnContinueW2FA" label="CONTINUE" width="26rem" disabled={loading} onClick={() => setShowCodeEntry(true)} />
        </>
      )}
    </TwoFactorSetup>
  );
}
