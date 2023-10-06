import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IsNotEmpty, MinLength } from "class-validator";
import { SubmitHandler, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ModalContainer, SetPasswordForm, Spacer, TitleContainer, UnlockSubtitle, UnlockTitle } from "./unlock-modal.styles";
import { LightningNodeReference, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { Button, TextInput } from "@platform/common";
import { useUIStore } from "@ui";
import { UnlockNode } from "@icons";
import { useHeyhowareya, useNodeDoc } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { QueryObserverResult } from "@tanstack/react-query";
import { UnlockNodeResponse, useUnlockNode } from "@src/features/lightning/hooks/mutations";
import { observer } from "mobx-react-lite";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";

export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8)
  nodePassword: string;
}

const resolver = classValidatorResolver(PasswordFormDto);

type PageData = {
  nodeDoc: ApiResult<LightningNodeReference>;
  nodeHealth: ApiResult<LightningOnboardingStep>;
  unlockNodeRes: UnlockNodeResponse;
  mutate: any;
  loading: boolean;
  error: Error | unknown;
  refetch: () => Promise<QueryObserverResult<ApiResult<LightningOnboardingStep>, unknown>>;
};

const usePageData = (): PageData => {
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc();
  const { nodeHealth, nodeHealthLoading, nodeHealthError, refetch } = useHeyhowareya();
  const { mutate, unlockNodeRes, unlockNodeLoading } = useUnlockNode();
  return {
    nodeDoc,
    nodeHealth,
    unlockNodeRes,
    mutate,
    loading: nodeDocLoading || nodeHealthLoading || unlockNodeLoading,
    error: nodeDocError || nodeHealthError,
    refetch
  };
};

export const UnlockModal = observer(() => {
  const router = useRouter();
  const UI = useUIStore();
  const { data: user, refetch: refreshUser } = useGetCurrentUser();
  const { nodeDoc, nodeHealth, unlockNodeRes, mutate, loading, error, refetch } = usePageData();
  
  const goToUnlockedPage = () => {
    if (router.pathname === "/infrastructure/lightning-connect") {
      return router.replace("/infrastructure/lightning-connect"); 
    } else {
      return router.replace("/multi-web-app/lightning");
    }  
  }

  if (nodeHealth?.data && !loading && nodeHealth?.data !== LightningOnboardingStep.Locked) goToUnlockedPage()

  const form = useForm<PasswordFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });
  form.watch();

  useEffect(() => {
    if (!router.isReady) return;
    if (!user) {
      refreshUser();
      return;
    }
  }, [router.isReady, user]);

  useEffect(() => {
    if (!unlockNodeRes || loading) return;
    displayToast();
  }, [unlockNodeRes, loading]);

  const displayToast = () => {
    switch (unlockNodeRes) {
      case UnlockNodeResponse.Unlocked:
        refetch();
        goToUnlockedPage()
        return UI.showToast({
          message: "Node unlocked!",
          alertType: "success",
          position: { vertical: "top", horizontal: "right" }
        });
      case UnlockNodeResponse.Failed:
        return UI.showToast({
          message: "Unlocking node failed. Invalid Password.",
          alertType: "error",
          position: { vertical: "top", horizontal: "right" }
        });
    }
  };

  const doUnlockNode = async (nodePassword: string) => {
    mutate({ url: nodeDoc.data.apiEndpoint, password: nodePassword });
  };

  const unlockPassword: SubmitHandler<PasswordFormDto> = (data) => {
    if (!nodeDoc) return;

    doUnlockNode(data.nodePassword);

    return;
  };

  return (
    <ModalContainer id="unlock-node-modal">
      <TitleContainer>
        <UnlockTitle>Your Node is Currently Locked.</UnlockTitle>
        <UnlockSubtitle>Enter your node passphrase to unlock your node.</UnlockSubtitle>
      </TitleContainer>
      <UnlockNode />
      <SetPasswordForm onSubmit={form.handleSubmit(unlockPassword)}>
        <TextInput
          register={form.register}
          width="30rem"
          style="lightningSetup"
          alignment="center"
          placeholder="*************"
          name="nodePassword"
          label="PASSWORD"
          type="password"
          autoFocus={true}
          value={form.getValues("nodePassword")}
          error={!!form.formState.errors["nodePassword"]}
          errorMessage={form.formState.errors["nodePassword"]?.message || ""}
        />
        <Spacer height="1" />
        <Button id="btnSubmit" label="UNLOCK" type="submit" variation="simple" width="25rem" labelOnSubmit="UNLOCKING..." submitting={loading} />
      </SetPasswordForm>
    </ModalContainer>
  );
});
