import { useWalletBalance } from "@src/features/lightning/hooks/queries"
import { useForm } from "react-hook-form"
import { IsString } from "class-validator"
import { classValidatorResolver } from "@hookform/resolvers/class-validator"
import { Button, TextInput } from "@platform/common"
import { WithdrawBitcoinForm } from "./withdraw-bitcoin.styles"
import { useWithdrawBitcoin } from "@src/features/lightning/hooks/mutations/wallet"
import { useRouter } from "next/router"
import { useUIStore } from "@src/providers"
import { IsBitcoinAddress } from "@blockspaces/shared/validation/decorators"
import { useEffect } from "react"

class WithdrawBitcoinFormDto {
  amount: number

  @IsBitcoinAddress()
  @IsString()
  bitcoinAddress: string;
}

const resolver = classValidatorResolver(WithdrawBitcoinFormDto, {}, { mode: "async" })

export const WithdrawBitcoin = () => {
  const form = useForm<WithdrawBitcoinFormDto>({
    mode: "onChange",
    criteriaMode: "all",
    resolver: resolver
  });
  form.watch();
  const amount = form.getValues("amount")
  const address = form.getValues("bitcoinAddress")
  const router = useRouter()
  const UI = useUIStore()
  const { data: balance } = useWalletBalance()
  const { mutateAsync: withdrawBitcoin, isLoading } = useWithdrawBitcoin()

  const withdraw = async () => {
    if (!Number(amount)) return UI.showToast({
      alertType: "warning",
      message: "Amount must be a number.",
      position: {
        horizontal: "right",
        vertical: "top"
      }
    })
    const sweep = amount === Number(balance.data.confirmed_balance)
    const withdraw = await withdrawBitcoin({ address: address, amount: amount, send_all: sweep })

    if (!withdraw.success) {
      return UI.showToast({
        alertType: "error",
        message: withdraw.message,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      })
    }

    return router.push(`/multi-web-app/lightning?modal=withdraw-successful&txid=${withdraw.payment.txid}`)
  }

  return (
    <WithdrawBitcoinForm onSubmit={form.handleSubmit(withdraw)}>
      <div style={{ textAlign: "center" }}>
        <TextInput
          register={form.register}
          width="30rem"
          style="lightningSetup"
          alignment="left"
          placeholder="Amount to send (satoshis)"
          name="amount"
          label="SATOSHIS TO WITHDRAW"
          value={form.getValues("amount")}
          error={!!form.formState.errors["amount"]?.message}
          errorMessage={form.formState.errors["amount"]?.message}
          customStyle={{ margin: 0 }}
        />
        <a style={{ color: "gray", textDecoration: "underline", cursor: "pointer" }} onClick={() => form.setValue("amount", Number(balance?.data?.confirmed_balance))}>{`Send max amount (${Number(
          balance?.data?.confirmed_balance
        ).toLocaleString()} satoshis)`}</a>
      </div>
      <TextInput
        register={form.register}
        width="30rem"
        style="lightningSetup"
        alignment="left"
        placeholder="bc1pm..."
        name="bitcoinAddress"
        label="BITCOIN ADDRESS"
        value={form.getValues("bitcoinAddress")}
        error={!!form.formState.errors["bitcoinAddress"]}
        errorMessage={form.formState.errors["bitcoinAddress"]?.message}
      />
      <Button
        label="Submit Payment"
        type="submit"
        variation="simple"
        width="25rem"
        disabled={!!form.formState.errors["bitcoinAddress"] || (!form.getValues("bitcoinAddress") && !form.formState.isValid)}
        submitting={isLoading}
        labelOnSubmit={"Submitting Withdrawal..."}
        customStyle={{ borderWidth: "2px" }}
      />
    </WithdrawBitcoinForm>
  );
}