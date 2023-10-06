import React from "react";
import { useForm } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";

import { Copy, StepButton, StyledIntro, Title } from "./intro.styles";

import { ExternalLightningSetup } from "@blockspaces/shared/models/lightning/Setup";
import { IsNotEmpty } from "class-validator";
import { TextInput } from "@platform/common";

type Props = {
  next: () => void;
  setup: ExternalLightningSetup;
  setSetup: any;
};

export class NodeInfoFormDto {
  @IsNotEmpty({ message: "API Endpoint is required." })
  endpoint: string;

  @IsNotEmpty({ message: "Read-only macaroon is required." })
  macaroon: boolean;

  certificate: string;
}

const resolver = classValidatorResolver(NodeInfoFormDto);

// User networks
export const ExternalNodeInfo = observer(({ next, setup, setSetup }: Props) => {

  const form = useForm<NodeInfoFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  });

  const setNodeInfo = (event) => {
    event.preventDefault();
    const endpoint = form.getValues("endpoint");
    const macaroon = form.getValues("macaroon");
    const certificate = form.getValues("certificate");
    setSetup({ ...setup, url: endpoint, macaroon: macaroon, certificate: certificate });
    next()
  }

  form.watch();
  return (
    <StyledIntro id="Lightning-Network-Setup-intro">
      <Title>The Future of Finance is Here</Title>
      <Copy>
        We need the REST API endpoint and a read-only macaroon to connect to your node.
      </Copy>
      <form onSubmit={setNodeInfo} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <TextInput
          register={form.register}
          margin="2rem auto 0"
          width="26rem"
          style="lightningSetup"
          name="endpoint"
          label="API Endpoint"
          value={form.getValues("endpoint")}
          error={!!form.formState.errors["endpoint"]}
          errorMessage={form.formState.errors["endpoint"]?.message}
        />
        <TextInput
          register={form.register}
          margin="2rem auto 0"
          width="26rem"
          style="lightningSetup"
          name="macaroon"
          label="Read-only Macaroon"
          value={form.getValues("macaroon")}
          error={!!form.formState.errors["macaroon"]}
          errorMessage={form.formState.errors["macaroon"]?.message}
        />
        <TextInput
          register={form.register}
          margin="2rem auto 0"
          width="26rem"
          style="lightningSetup"
          name="certificate"
          label="Certificate"
          value={form.getValues("certificate")}
          error={!!form.formState.errors["ceritficate"]}
          errorMessage={form.formState.errors["certificate"]?.message}
        />
        <StepButton disabled={!form.getValues("endpoint") || !form.getValues("macaroon")} type="submit" id="btnGetStarted" margin={"2rem auto 3.25rem"} width={"16rem"}>
          CONNECT
        </StepButton>
      </form>
    </StyledIntro>
  );
});
