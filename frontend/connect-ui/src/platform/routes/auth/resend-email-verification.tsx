import { LoginCredentials } from "@blockspaces/shared/dtos/users";
import { Button, Title } from "@platform/common";
import ResendEmailVerification, { CheckWrap, Email, FormPrompt, SmallPrompt, SuccessCheck } from "./styles/resend-email-verification.styles";
import { Check } from "@icons";
import { useVerifyEmail } from "@src/platform/hooks/user/mutations";
import { useRouter } from "next/router";

export type Props = {
  credentials: LoginCredentials;
};

export default function RESEND_EMAIL_VERIFICATION({ credentials }: Props) {
  const { mutate: verifyEmail, isLoading: sending, isSuccess: emailSent, error } = useVerifyEmail();
  const router = useRouter();
  const sendEmail = async (e) => {
    e.preventDefault();
    verifyEmail({ email: credentials?.email || router.query?.email?.toString() });
  };

  return (
    <ResendEmailVerification visible={true} onSubmit={sendEmail} id="resend-id-verification-form">
      {!emailSent ? (
        <>
          <Title label="EMAIL NOT VERIFIED" href="/auth?loginStep=login" />
          <FormPrompt>
            Your Email Address: <br />
            <Email>{`${credentials?.email || router.query?.email?.toString()}`}</Email> <br />
            Has not yet been verified <br />
            <br />
            <SmallPrompt>
              Check your inbox (and spam folder) for your verification link <br />
              or click below to send another verification email
            </SmallPrompt>
          </FormPrompt>
          <Button id="btnSubmitResendEmailVerification" type="submit" width="26rem" label="RESEND VERIFICATION EMAIL" labelOnSubmit="SENDING EMAIL" submitting={sending} />
        </>
      ) : (
        <>
          <Title label="VERIFICATION EMAIL SENT" href="/auth?loginStep=login" />
          <CheckWrap>
            <SuccessCheck>
              <Check />
            </SuccessCheck>
          </CheckWrap>
          <FormPrompt>
            A new email will arrive shortly with a verification link <br />
            Don't forget to check your spam folder!
          </FormPrompt>
          <Button width="26rem" href="/auth" label="BACK TO LOGIN" variation="simple" />
        </>
      )}
    </ResendEmailVerification>
  );
}
