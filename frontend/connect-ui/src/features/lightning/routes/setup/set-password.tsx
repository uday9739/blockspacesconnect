import React, { useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { SubmitHandler, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsNotEmpty, MinLength } from "class-validator";

import { StyledSetPassword, Title, Copy, StepButton, SetPasswordForm, WarningBox, WarningMessage, WarningCheck, WarningBOX } from './set-password.styles';

import { LightningSetup } from '@blockspaces/shared/models/lightning/Setup';
import { IsEqualTo } from "@blockspaces/shared/validation/decorators";
import { TextInput, CheckBox } from "@platform/common";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { useNodeDoc } from "@lightning/queries";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};

export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, {message: "Length must be longer than 8 characters"})
  nodePassword: string;

  @IsEqualTo<PasswordFormDto>("nodePassword", { message: "Password fields must match." })
  verifyNodePassword: string;

  @IsNotEmpty({message: "You must acknowledge you read and understand the terms before continuing."})
  confirmToggle: boolean;
}

const resolver = classValidatorResolver(PasswordFormDto);

type PageData = {
  nodeDoc: ApiResult<LightningNodeReference>,
  loading: boolean,
  error: any
}

const usePageData = (): PageData => {
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc()

  return {
    nodeDoc,
    loading: nodeDocLoading,
    error: nodeDocError
  }
}

export const SetPassword = observer(({ next, setup, setSetup }: Props) => {
  const router = useRouter();
  const { nodeDoc, loading, error } = usePageData()
  const [checked, setChecked] = useState(false);
  if (setup.seed.length === 0 && !nodeDoc && !loading) router.replace('/multi-web-app/lightning/setup')


  const form = useForm<PasswordFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });

  form.watch();

  const savePassword: SubmitHandler<PasswordFormDto> = (data) => {
    if (!data.confirmToggle) {
      form.setError('confirmToggle', { message: "You must acknowledge you read and understand the terms before continuing." })
      return;
    }
    setSetup({ ...setup, password: data.nodePassword });
    next();
    return;
  };
  return (
    <StyledSetPassword>
      <Title>Set a Password</Title>
      <Copy>
        We store an encrypted version of your key <br />
        You’ll need to set a password to decrypt it when making transactions
      </Copy>
      <SetPasswordForm onSubmit={form.handleSubmit(savePassword)}>
        <TextInput
          register={form.register}
          margin="2rem auto 0"
          width="26rem"
          style="lightningSetup"
          alignment="center"
          placeholder="*************"
          name="nodePassword"
          label="Password"
          type="password"
          value={form.getValues("nodePassword")}
          error={!!form.formState.errors["nodePassword"]}
          errorMessage={form.formState.errors["nodePassword"]?.message}
        />
        <TextInput
          register={form.register}
          margin="1.5rem auto 0"
          width="26rem"
          alignment="center"
          placeholder="*************"
          style="lightningSetup"
          name="verifyNodePassword"
          label="Confirm Password"
          type="password"
          value={form.getValues("verifyNodePassword")}
          error={!!form.formState.errors["verifyNodePassword"]}
          errorMessage={form.formState.errors["verifyNodePassword"]?.message}
        />
        <WarningBOX>
          <Copy>
            <u><b><span style={{ color: "#F00" }}>IMPORTANT</span>: DO NOT LOSE THIS</b></u>
          </Copy>
          <Copy>
            This is the key to your digital safe where your assets are locked. <b>By design, BlockSpaces cannot reset, recover or otherwise access this password if it is lost.</b> This is your
            responsibility alone, please keep this safe or you will lose your funds.
          </Copy>
          <WarningCheck>
            <WarningMessage>I understand</WarningMessage>
            <CheckBox
              register={form.register}
              name="confirmToggle"
              checked={form.getValues('confirmToggle')}
              setChecked={setChecked}
              error={!!form.formState.errors["confirmToggle"]}
              errorMessage={form.formState.errors["confirmToggle"]?.message}
            />
          </WarningCheck>
        </WarningBOX>
        <StepButton
          id="btnLncPassword"
          margin={"1rem auto 3.25rem"}
          width={"16rem"}
          type="submit"
        >
          Confirm
        </StepButton>
      </SetPasswordForm>
    </StyledSetPassword>
  );
});