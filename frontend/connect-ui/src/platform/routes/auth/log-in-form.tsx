import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoginCredentials } from "@blockspaces/shared/dtos/users";
import { useUIStore } from "@ui";
import { Button, TextInput } from "@platform/common";
import { Logo } from "@icons";
import LogInForm, { LogoWrap, Links, LinkText, Inputs } from "./styles/login.styles";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { InitialLoginResultDto } from "@blockspaces/shared/dtos/authentication/initial-login";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { UserLoginDto } from "@blockspaces/shared/dtos/users";
import { useDoInitialLogin } from "@src/platform/hooks/user/mutations";

type Props = {
  onLoginSuccess: (result: InitialLoginResultDto, credentials: LoginCredentials) => void;
  onLoginFailure: (result: InitialLoginResultDto, credentials: LoginCredentials) => void;
};

const resolver = classValidatorResolver(UserLoginDto);

export default function LOGIN_FORM({ onLoginSuccess, onLoginFailure }: Props) {
  const router = useRouter();
  const uiStore = useUIStore();
  const { mutate: doInitialLogin, isLoading: doInitialLoginIsLoading, isError: doInitialLoginError, error: doInitialLoginErrorData, data: doInitialLoginResult, isSuccess: doInitialLoginIsSuccess } = useDoInitialLogin();
  const form = useForm<UserLoginDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver,
    defaultValues: {}
  });
  const doLogin = (formData: UserLoginDto) => doInitialLogin({ username: formData.email, password: formData.password });

  useEffect(() => {
    form.watch();
  }, []);

  useEffect(() => { 
    if (doInitialLoginIsLoading) return;

    if (doInitialLoginError) {
      if ((doInitialLoginErrorData as any).data?.failureReason === AuthFailureReason.EMAIL_NOT_VERIFIED) {
        onLoginFailure((doInitialLoginErrorData as any).data, { email: form.getValues("email"), password: form.getValues("password") });
      } else {
        uiStore.showToast({
          message: (doInitialLoginErrorData as any)?.data?.failureReason || "Invalid email or password",
          alertType: "error",
          position: { vertical: "top", horizontal: "center" }
        });
      }
    } else if (doInitialLoginIsSuccess) {
      onLoginSuccess(doInitialLoginResult, { email: form.getValues("email"), password: form.getValues("password") });
    }
  }, [doInitialLoginError, doInitialLoginIsLoading, doInitialLoginIsSuccess, doInitialLoginErrorData]);

  return (
    <LogInForm visible={true} onSubmit={form.handleSubmit(doLogin)} id="login-form">
      <LogoWrap>
        <Logo />
      </LogoWrap>
      <Inputs>
        <TextInput
          register={form.register}
          name="email"
          label="EMAIL"
          style="large"
          placeholder="satsoshi@blockspaces.com"
          autoComplete="email"
          value={form.getValues("email") || ""}
          error={!!form.formState.errors["email"]}
          errorMessage={form.formState.errors["email"]?.message || ""}
        />
        <TextInput
          type="password"
          register={form.register}
          name="password"
          style="large"
          label="PASSWORD"
          autoComplete="current-password"
          value={form.getValues("password") || ""}
          error={!!form.formState.errors["password"]}
          errorMessage={form.formState.errors["password"]?.message || ""}
        />
      </Inputs>
      <Button id="btnLogin" label="LOG IN" type="submit" variation="simple" width="calc(100% - 4.25rem)" labelOnSubmit="WELCOME" submitting={doInitialLoginIsLoading} />
      <Links>
        <Link legacyBehavior href={!doInitialLoginIsLoading ? `${router.pathname}?screen=quick-sign-up` : `javascript:void(0)`} passHref>
          <LinkText id="linkCreateAcct">CREATE ACCOUNT</LinkText>
        </Link>
        <Link legacyBehavior href={!doInitialLoginIsLoading ? `${router.pathname}?screen=forgot-password` : `javascript:void(0)`} passHref>
          <LinkText id="linkForgotPwd">FORGOT PASSWORD</LinkText>
        </Link>
      </Links>
    </LogInForm>
  );
}
