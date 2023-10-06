import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, TextInput, InfoHelper } from "@src/platform/components/common"
import { useUIStore } from "@src/providers";
import { IsNotEmpty, MinLength } from "class-validator";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form"
import { useFetchMacaroon } from "../../hooks/mutations";
import { Tooltip } from "@src/platform/components/common";
import { useNodeDoc } from "@lightning/queries";
import { getMacaroonFromStorage } from "../../utils";
import { isExternalNode } from "@lightning/utils/node";

export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8)
  password: string;
}

const resolver = classValidatorResolver(PasswordFormDto)

export const AdminMacaroon = () => {
  const { isError: error, mutate: getMacaroon, isLoading: loading, isSuccess: gotAdminMac } = useFetchMacaroon()
  const { nodeDoc, nodeDocLoading } = useNodeDoc()
  const [needToFetch, setNeedToFetch] = useState(false)

  const checkForMacaroon = () => {
    const mac = getMacaroonFromStorage(nodeDoc?.data?.nodeId)
    if (mac) return setNeedToFetch(false)
    return setNeedToFetch(true)
  }

  useEffect(() => {
    if (nodeDocLoading) return
    checkForMacaroon()
  }, [nodeDocLoading])

  useEffect(() => {
    if (!gotAdminMac) return
    setNeedToFetch(false)
  }, [gotAdminMac])

  const ui = useUIStore()
  const form = useForm<PasswordFormDto>({
    mode: "onTouched",
    criteriaMode: "all",
    resolver: resolver
  })
  form.watch()

  const fetchMacaroon: SubmitHandler<PasswordFormDto> = (data) => {
    getMacaroon({ password: data.password, nodeId: nodeDoc?.data?.nodeId, connect: false })
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
    <div style={{ display: needToFetch ? "flex" : "none", flexDirection: "column", padding: "1rem" }}>
      <Tooltip content="Admin access allows you to send payments over Lightning and on-chain.">
        <h1 style={{ textAlign: "center", paddingBottom: "1rem", fontFamily: "Lato" }}>Unlock for Payment Authorization</h1>
      </Tooltip>
      <form onSubmit={form.handleSubmit(fetchMacaroon)} id="unlock">
        <TextInput
          name="password"
          register={form.register}
          value={form.getValues("password")}
          label="Password"
          type="password"
          autoFocus={true}
          error={!!form.formState.errors["password"]}
          errorMessage={form.formState.errors["password"]?.message || ""}
        />
        <Button label="Unlock" variation="simple" submitting={loading} type="submit" />
      </form>
    </div>
  )
}