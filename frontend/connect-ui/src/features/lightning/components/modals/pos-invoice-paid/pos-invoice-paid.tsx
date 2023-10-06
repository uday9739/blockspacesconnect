import { useRouter } from "next/router"
import { PaymentSuccessfulText, PosInvoicePaidModal } from "./pos-invoice-paid.styles"

import { Button } from "@platform/common"
import { PaymentSuccessful } from "@icons"
import { getCheckoutReturnQuery } from "@lightning/hooks"

export const PosInvoicePaid = () => {
  const router = useRouter()
  const returnQuery = () => {
    return router.push({pathname: router.pathname, query: getCheckoutReturnQuery(router.query)})
  }
  return (
    <PosInvoicePaidModal id="pos-payment-successful-modal">
      <PaymentSuccessfulText>Payment Successful!</PaymentSuccessfulText>
      <PaymentSuccessful />
      <Button id="btnPaymentSuccessful" label="CONTINUE" variation="simple" customStyle={{color: "#891AF8", borderColor:"#891AF8"}} onClick={() => returnQuery()} />
    </PosInvoicePaidModal>
  )
}