import { useRouter } from "next/router";
import { StyledAddSuccess, CheckWrap, SuccessCheck, AddSuccessTitle } from "./add-app-success.styles";
import { Check } from "@platform/components";
import { Button } from "@platform/common";
import { useEffect } from "react";
import { getCartDetails } from "@src/platform/hooks/cart/mutations";

export const AddLightningSuccess = () => {
  const router = useRouter();
  const label = 'Continue Setup';
  const cart = getCartDetails();

  useEffect(() => {
    if (router.isReady) return;
  }, [router.isReady]);
  return (
    <StyledAddSuccess id="add-app-successful-modal">
      <AddSuccessTitle>Subscription Successful!</AddSuccessTitle>
      <CheckWrap>
        <SuccessCheck>
          <Check />
        </SuccessCheck>
      </CheckWrap>
      <Button id="btnContinue" width={"18rem"} customStyle={{ margin: "0 0 2.25rem" }} variation="default-new" label={label} onClick={() => router.push('/multi-web-app/lightning/setup')} />
    </StyledAddSuccess>
  );
};
