import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, TextInput } from "@src/platform/components/common"
import { useUIStore } from "@src/providers";
import { IsNotEmpty, MinLength } from "class-validator";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form"
import { useLightningConnect } from "../../hooks";
import { useNodeDoc } from "@lightning/queries";

export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8)
  password: string;
}

const resolver = classValidatorResolver(PasswordFormDto)

export const UnlockMac = () => {
  const { auth, loading, error, getMacaroon } = useLightningConnect()
  const { nodeDoc } = useNodeDoc()
  const ui = useUIStore()
  const form = useForm<PasswordFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  })
  form.watch()

  const fetchMacaroon: SubmitHandler<PasswordFormDto> = (data) => {
    getMacaroon({ password: data.password, nodeId: nodeDoc?.data?.nodeId, connect: true })
  }

  useEffect(() => {
    if (error) {
      ui.showToast({
        message: "Incorrect password.",
        position: {
          vertical: "top",
          horizontal: "right"
        },
        alertType: "error"
      })
    }
  }, [error])

  return (
    <div style={{ display: auth?.macaroon ? "none" : "flex", flexDirection: "column" }}>
      <form onSubmit={form.handleSubmit(fetchMacaroon)} id="unlock">
        <TextInput
          name="password"
          register={form.register}
          value={form.getValues("password")}
          label="Password"
          type="password"
          error={!!form.formState.errors["password"]}
          errorMessage={form.formState.errors["password"]?.message || ""}
        />
        <Button label="Unlock" variation="simple" submitting={loading} type="submit" />
      </form>
    </div>
  )
}