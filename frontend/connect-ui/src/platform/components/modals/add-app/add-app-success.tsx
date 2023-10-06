import { useRouter } from "next/router";
import { StyledAddSuccess, CheckWrap, SuccessCheck, AddSuccessTitle } from "./add-app-success.styles";
import { Check } from "@platform/components";
import { Button } from "@platform/common";
import { useGetConnectSubscription, useGetCurrentUser, useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { useEffect } from "react";

export const AddAppSuccess = () => {
  const router = useRouter();
  const { data: user, refetch: refetchUser } = useGetCurrentUser();
  const { refetch: refetchUserNetworks } = useGetUserNetworks();
  const { data: connectSub, refetch: refetchSub } = useGetConnectSubscription();

  useEffect(() => {
    if (router.isReady) return;
    refetchUser();
    refetchSub();
    refetchUserNetworks();
  }, [router.isReady]);
  return (
    <StyledAddSuccess id="add-app-successful-modal">
      <AddSuccessTitle>Service Added Successfully!</AddSuccessTitle>
      <CheckWrap>
        <SuccessCheck>
          <Check />
        </SuccessCheck>
      </CheckWrap>
      <Button id="btnContinue" width={"18rem"} customStyle={{ margin: "0 0 2.25rem" }} variation="default-new" label={"Continue"} onClick={() => router.push('/connect')} />
    </StyledAddSuccess>
  );
};
