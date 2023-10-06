import { Loading } from "@src/platform/components/common";
import { useVerifyEmailWithToken } from "@src/platform/hooks/user/mutations";
import { useUIStore } from "@src/providers";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ResendEmailVerification, { CheckWrap, Email, FormPrompt, SmallPrompt, SuccessCheck } from "./styles/resend-email-verification.styles";

export type Props = {};

export default function VerifyEmail({}: Props) {
  const router = useRouter();
  const ui = useUIStore();
  const token = router.query.token;
  const uuid = router.query.uuid;
  const { mutate: verifyEmailWithToken, isLoading, isSuccess, isError, mutateAsync } = useVerifyEmailWithToken();

  useEffect(() => {
    if (!token || !uuid) {
      router.push("/auth");
    } else {
      if (!isLoading && !isSuccess && !isError) verifyEmailWithToken({ token: token.toString(), userId: uuid.toString() });
    }
  }, [verifyEmailWithToken]);

  useEffect(() => {
    if (isSuccess) {
      router.push("/auth?screen=verify-success");
    }
    if (isError) {
      ui.showToast({
        message: "Unable to verify email, request new email verification",
        alertType: "error",
        autoHideDuration: 2000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      router.push("/auth");
    }
  }, [isLoading, isError, isSuccess]);

  return (
    <ResendEmailVerification visible={true}>
      <h1>Verifying Email</h1>
      <Loading when />
    </ResendEmailVerification>
  );
}
