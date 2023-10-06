import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { LoginCredentials, UserLoginDto } from "@blockspaces/shared/dtos/users";
import { useForm } from "react-hook-form";

import TwoFactorSetup from "./two-factor-setup";
import TwoFactorEntry from "./two-factor-entry";
import ResendEmailVerification from "./resend-email-verification";
import LogInForm from "./log-in-form";
import { InitialLoginResultDto } from "@blockspaces/shared/dtos/authentication/initial-login";
import { AuthFailureReason } from "@blockspaces/shared/types/authentication";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useGetLoginState } from "@src/platform/hooks/user/mutations";
import VerifyEmail from "./verify-email";

export type LoginState = {
  result?: InitialLoginResultDto;
  credentials?: LoginCredentials;
};

const LoginFormData = UserLoginDto;

export default function LOGIN_CONTROLLER() {
  const _loginState = useGetLoginState();
  const [loginState, setLoginState] = useState<LoginState>(_loginState?.defaultState);

  const router = useRouter();
  const resolver = classValidatorResolver(LoginFormData);

  const form = useForm<InitialLoginResultDto>({ resolver: resolver });
  form.watch();

  const loginStep = router.query?.loginStep || _loginState?.loginStep;

  const onLoginSuccess = (result: InitialLoginResultDto, credentials: LoginCredentials) => {
    result.twoFactorSetupComplete ? router.push("/auth?loginStep=2fa-entry") : router.push("/auth?loginStep=2fa-setup");

    setLoginState({ result, credentials });
  };

  const onLoginFailure = (result: InitialLoginResultDto, credentials) => {
    setLoginState({ result, credentials });
    if (result.failureReason === AuthFailureReason.EMAIL_NOT_VERIFIED) router.push("/auth?loginStep=resend-verification");
  };

  const LoginStep = useMemo(() => {
    switch (loginStep) {
      case "2fa-setup":
        if (!loginState) router.push("/auth");
        return <TwoFactorSetup credentials={loginState?.credentials} />;

      case "2fa-entry":
        if (!loginState) router.push("/auth");
        return <TwoFactorEntry credentials={loginState?.credentials} />;

      case "resend-verification":
        if (!loginState) router.push("/auth");
        return <ResendEmailVerification credentials={loginState?.credentials} />;

      default:
        if (loginState) setLoginState(null);
        return <LogInForm onLoginSuccess={onLoginSuccess} onLoginFailure={onLoginFailure} />;
    }
  }, [loginStep]);

  return LoginStep;
}
