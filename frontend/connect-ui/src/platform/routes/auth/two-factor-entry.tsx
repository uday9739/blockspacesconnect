import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useUIStore } from "@ui";
import { Button, Title, TextInput } from "@platform/common";
import TwoFactorLogin, { Subtitle, ConfirmForm } from "./styles/two-factor-login.styles";
import { LoginCredentials } from "@blockspaces/shared/dtos/users";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TwoFactorCodeFormDto } from "@blockspaces/shared/dtos/authentication/TwoFactorCodeFormDto";
import { useLoginTwoFactor } from "@src/platform/hooks/user/mutations";
import { useGetInitialLandingPage } from "@src/platform/hooks/user/queries";

type TwoFactorSetupProps = { credentials: LoginCredentials };

const resolver = classValidatorResolver(TwoFactorCodeFormDto);

export default function TWO_FACTOR_LOGIN({ credentials }: TwoFactorSetupProps) {
  // const userStore = useUserStore();
  const uiStore = useUIStore();
  const router = useRouter();
  const { defaultLanding } = useGetInitialLandingPage();
  const { mutate: loginTwoFactor, isLoading: loginTwoFactorIsLoading, data: loginTwoFactorResults, error: loginTwoFactorError, isSuccess: loginTwoFactorIsSuccess } = useLoginTwoFactor();
  const form = useForm<TwoFactorCodeFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });

  // handle mount
  useEffect(() => {
    form.watch();
  }, []);

  // handle loginTwoFactor result
  useEffect(() => {
    if (loginTwoFactorError) {
      return uiStore.showToast({
        message: (loginTwoFactorError as any)?.message || "Invalid two-factor code",
        alertType: "error",
        position: { horizontal: "center", vertical: "top" }
      });
    } else if (loginTwoFactorIsSuccess) {
      router.push(defaultLanding);
    }
  }, [loginTwoFactorIsLoading, loginTwoFactorResults, loginTwoFactorError, loginTwoFactorIsSuccess]);

  const doTwoFactorLogin: SubmitHandler<TwoFactorCodeFormDto> = (formData) =>
    loginTwoFactor({
      email: credentials.email,
      password: credentials.password,
      twoFactorCode: formData.code
    });

  return (
    <TwoFactorLogin visible={true} id="2fa-entry-container">
      <>
        <Title label="ENTER 2FA" style="modal" href="/auth?loginStep=login" />
        <Subtitle>Enter the code provided by your 2FA app</Subtitle>
        <ConfirmForm onSubmit={form.handleSubmit(doTwoFactorLogin)} id="confirm-2fa-form">
          <TextInput style="twoFactor" register={form.register} name="code" label="2FA CODE*" placeholder="######" value={form.getValues("code") || ""} mask="999999" alignment="center" autoFocus />
          <Button id="btnConfirm2FA" type="submit" label="CONFIRM 2FA CODE" labelOnSubmit="CONFIRMING" submitting={loginTwoFactorIsLoading} width="100%" />
        </ConfirmForm>
      </>
    </TwoFactorLogin>
  );
}
