import { PaymentSuccessful } from "@src/platform/components"
import { Button } from "@platform/common"
import Link from "next/link"
import { useRouter } from "next/router"
import { Successful, WithdrawSuccess } from "./withdraw-bitcoin.styles"

export const WithdrawSuccessful = () => {
  const router = useRouter()
  const txid = router.query.txid
  return (
    <WithdrawSuccess id="Withdraw-successful-modal">
      <Successful>Withdraw successful!</Successful>
      <PaymentSuccessful size="175" />
      <Link target="_blank" href={`https://mempool.space/tx/${txid}`}>Open transaction in an explorer</Link>
      <Button label="CONTINUE" variation="simple" onClick={() => router.push("/multi-web-app/lightning")}/>
    </WithdrawSuccess>
  )
}