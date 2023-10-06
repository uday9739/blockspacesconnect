import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IsString, MinLength } from "class-validator";
import { getString } from "@platform/utils";
import { useUIStore } from "@ui";
import { Button, Title, TextInput } from "@platform/common";
import { Box, CircularProgress } from "@mui/material";
import ResetPasswordForm, { FormPrompt, Inputs } from "./styles/reset-password-form.styles";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsEqualTo } from "@blockspaces/shared/validation/decorators";
import { useGetForgotPasswordConfirmResult, useResetPassword } from "@src/platform/hooks/user/mutations";

export class ResetPasswordFormDto {
  @IsString()
  @MinLength(8, { message: "password should be a minimum of 8 characters" })
  password: string;

  @IsEqualTo<ResetPasswordFormDto>("password", { message: "Password fields must match" })
  passwordConfirm: string;
}
const resolver = classValidatorResolver(ResetPasswordFormDto);

export default function RESET_PASSWORD_FORM() {
  const uiStore = useUIStore();
  const router = useRouter();
  const context = getString(router.query.context);
  const form = useForm<ResetPasswordFormDto>({
    resolver: resolver
  });
  const { mutate: getForgotPasswordConfirmResult, data, isLoading, isSuccess, error } = useGetForgotPasswordConfirmResult();
  const { mutate: resetPassword, data: resetPasswordResult, isLoading: submitting, isSuccess: resetPasswordIsSuccess, error: resetPasswordError } = useResetPassword();

  useEffect(() => {
    if (isLoading || isSuccess) return;
    getForgotPasswordConfirmResult({ token: context });
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (error) {
      uiStore.showToast({
        message: "Your password reset link was invalid. Use the Forgot Password form to generate a new link.",
        alertType: "error"
      });
      router.replace("/auth?screen=forgot-password");
      return;
    }
  }, [isLoading, isSuccess, error]);

  useEffect(() => {
    if (submitting) return;
    if (resetPasswordError) {
      uiStore.showToast({
        message: `Password reset failed with the following error: ${(resetPasswordError as any)?.message}`,
        alertType: "error"
      });
      return;
    }

    if (resetPasswordIsSuccess) {
      uiStore.showToast({
        message: "Your password was reset successfully!",
        alertType: "success",
        autoHideDuration: 10 * 1000
      });
      router.push("/auth");
    }
  }, [submitting, resetPasswordIsSuccess, resetPasswordError, resetPasswordResult]);

  const handleResetPassword: SubmitHandler<ResetPasswordFormDto> = (data) =>
    resetPassword({
      password: data.password,
      context: context
    });

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ResetPasswordForm visible={true} onSubmit={form.handleSubmit(handleResetPassword)} id="reset-password-form">
      <Title label="RESET PASSWORD" href="/auth" />
      <FormPrompt>Please select a new password</FormPrompt>
      <Inputs>
        <TextInput register={form.register} name="password" type="password" style="large" label="PASSWORD*" value={form.getValues("password")} autoComplete="new-password" autoFocus />
        <TextInput register={form.register} name="passwordConfirm" style="large" type="password" label="PASSWORD CONFIRM*" value={form.getValues("passwordConfirm")} autoComplete="new-password" />
      </Inputs>
      <Button id="btnResetPassword" type="submit" width="24rem" customStyle={{ marginTop: "1rem" }} label="SET NEW PASSWORD" labelOnSubmit="SETTING PASSWORD" submitting={submitting} />
    </ResetPasswordForm>
  );
}
