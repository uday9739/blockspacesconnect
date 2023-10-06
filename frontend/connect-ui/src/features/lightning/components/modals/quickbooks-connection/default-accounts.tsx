import { useRouter } from "next/router"

import { LightningToQuickBooksModal, ModalText, AccountOptions, SelectCustomerText, CreateCustomerText } from "./finalize-connection.styles"

import { Button, BorderWithLabel } from "@platform/common"
import { QuickBooksConnectionSteps } from "@lightning/types"

export const DefaultAccounts = () => {
  const router = useRouter()
  return (
    <LightningToQuickBooksModal id="choose-quickbooks-integration-account-modal">
      <ModalText>Set Default Bitcoin Payments Customer</ModalText>
      <ModalText style={{fontSize: "1rem"}}>You'll need a default customer to post Bitcoin payments to QuickBooks.</ModalText>
      <AccountOptions>
        <BorderWithLabel label="ADVANCED" width="18rem" height="14rem" borderColor="#CBCBCE">
          <SelectCustomerText>Select from an existing customer<br/>and set to default</SelectCustomerText>
          <Button label="CONTINUE" variation="simple" customStyle={{}} width="16rem" height="4rem" onClick={() => router.push({ pathname: router.pathname, query: {modal: "finalizeConnection", step: QuickBooksConnectionSteps.SelectContact} })} />
        </BorderWithLabel>
        <BorderWithLabel label= "RECOMENDED" width="26rem" height="14rem" borderColor="#A81AF7">
          <CreateCustomerText>Create a <i>"Bitcoin Invoicing & Payments"</i> customer and set to default</CreateCustomerText>
          <Button label="CONTINUE" variation="simple" customStyle={{ borderColor:"#A81AF7", color:"#A81AF7"}} width="16rem" height="4rem" onClick={() => router.push({ pathname: router.pathname, query: {modal: "finalizeConnection", step: QuickBooksConnectionSteps.CreateContact} })} />
        </BorderWithLabel>
      </AccountOptions>
    </LightningToQuickBooksModal>
  )
}