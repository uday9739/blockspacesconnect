import { useForm } from "react-hook-form";
import { IsNotEmpty, MinLength } from "class-validator";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";

import { StyledNetworkSync, Title } from "./network-sync.styles";
import { Copy, StepButton } from "./intro.styles";
import { SetPasswordForm } from "./set-password.styles";

import { LightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { TextInput } from "@platform/common";

type Props = {
  next: () => void;
  setup: LightningSetup;
  setSetup: any;
};
export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Length must be longer than 8 characters" })
  nodePassword: string;
}

const resolver = classValidatorResolver(PasswordFormDto);

export const MissingPassword = ({ next, setup, setSetup }: Props) => {
  const form = useForm<PasswordFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });

  return (
    <StyledNetworkSync>
      <Title>Input password</Title>
      <Copy>Input your password to finish onboarding...</Copy>
      <SetPasswordForm onSubmit={() => console.log("Submitting")}>
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
      </SetPasswordForm>
      <StepButton margin={"3rem auto 3.25rem"} width={"16rem"} type="submit">
        Next
      </StepButton>
    </StyledNetworkSync>
  );
};
