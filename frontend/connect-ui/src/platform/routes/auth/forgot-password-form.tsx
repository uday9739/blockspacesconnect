import { Button, TextInput, Title } from "@platform/common";
import { SubmitHandler, useForm } from "react-hook-form";
import ForgotPasswordForm, { FormInputs, FormPrompt, CheckWrap, SuccessCheck } from "./styles/forgot-password.styles";
import { Check } from "@icons";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ForgotPasswordFormDto } from "@blockspaces/shared/dtos/authentication/ForgotPasswordFormDto";
import { useForgotPassword } from "@src/platform/hooks/user/mutations";

type ForgotPasswordProps = {
  email?: string;
  onFinished?: (emailSent: boolean) => void;
};

type ForgotPasswordFormData = {
  email: string;
};

const resolver = classValidatorResolver(ForgotPasswordFormDto);

export default function FORGOT_PASSWORD_FORM({ email, onFinished = () => {} }: ForgotPasswordProps) {
  const { mutate: forgotPassword, isLoading: sending, isSuccess: emailSent, error } = useForgotPassword();
  const form = useForm<ForgotPasswordFormData>({
    resolver: resolver
  });
  const handleForgotPassword: SubmitHandler<ForgotPasswordFormDto> = (formData) => forgotPassword({ email: formData.email });

  return (
    <ForgotPasswordForm onSubmit={form.handleSubmit(handleForgotPassword)} id="Forgot-Password-Form">
      {emailSent ? (
        <>
          <Title label="RESET EMAIL SENT" style="modal" />
          <CheckWrap>
            <SuccessCheck>
              <Check />
            </SuccessCheck>
          </CheckWrap>
          <FormPrompt>If you've already registered for a BlockSpaces account, you should receive an email containing a link to reset your password.</FormPrompt>
          <Button id="btnReturnLogin" variation="simple" href="/auth" width="26rem" label="RETURN TO LOGIN" />
        </>
      ) : (
        <>
          <Title label="FORGOT PASSWORD" style="modal" href="/auth?loginStep=login" />
          <FormPrompt>To reset your password, enter your email address below</FormPrompt>
          <FormInputs>
            <TextInput
              style="large"
              register={form.register}
              name="email"
              label="EMAIL"
              placeholder="satoshi@blockspaces.com"
              value={form.getValues("email")}
              autoComplete="email"
              alignment="center"
            />
          </FormInputs>
          <Button id="btnForgot" type="submit" width="26rem" customStyle={{ marginTop: "1rem" }} label="SEND RESET EMAIL" labelOnSubmit="SENDING EMAIL" submitting={sending} />
        </>
      )}
    </ForgotPasswordForm>
  );
}
