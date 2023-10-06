import { useEffect, useState } from "react";
import { Title, Button } from "@platform/common";
import { Check } from "@icons";

import VerifySuccess, { CheckWrap, FormPrompt, SuccessCheck } from "./styles/verify-success.styles";
import { isUserAuthenticated, useGetInitialLandingPage } from "@src/platform/hooks/user/queries";
import { useRouter } from "next/router";
export default function VERIFY_SUCCESS() {
  const router = useRouter();
  const _isUserAuthenticated = isUserAuthenticated();
  const { defaultLanding } = useGetInitialLandingPage();
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => {
    setFadeIn(true);
    if (_isUserAuthenticated) {
      router.push(defaultLanding);
    }
  });

  return (
    <VerifySuccess visible={fadeIn} id="email-verifying-success">
      <Title label="EMAIL VERIFIED" />
      <CheckWrap>
        <SuccessCheck>
          <Check />
        </SuccessCheck>
      </CheckWrap>
      <FormPrompt>Thank you for verifying your email!</FormPrompt>
      <Button width="26rem" href="/auth" label="BACK TO LOGIN" variation="simple" />
    </VerifySuccess>
  );
}
