import { useRouter } from "next/router"

import { LightningToQuickBooksModal, ModalText } from "./finalize-connection.styles"

import { Button } from "@platform/common"
import { getApiUrl } from "@platform/utils"
import { NotConnected as NotConnectedIcon } from "@icons"

export const NotConnected = () => {
  const router = useRouter()
  return (
    <LightningToQuickBooksModal id="connect-to-quickbooks-modal">
      <ModalText>Connect to QuickBooks!</ModalText>
      <ModalText style={{fontSize: "1rem", lineHeight: "1.75rem"}}>Sync invoices and payments to your QuickBooks account<br/>in two easy steps</ModalText>
      <NotConnectedIcon />
      <Button id="btnConnectAccounts" label="CONNECT ACCOUNTS" variation="simple" customStyle={{marginTop: "1.75rem"}} onClick={() => router.push(getApiUrl("/quickbooks/auth-uri"))} />
    </LightningToQuickBooksModal>
  )
}