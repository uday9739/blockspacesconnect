import { useNodeDoc } from "@src/features/lightning/hooks/queries"
import { AuthCard } from "../auth-card"
import { AuthenticationContainer, AuthRow, Heading } from "./index.styles"
import { Seed } from "./seed"
import { hexToBase64 } from "@platform/utils"
import { useLightningConnect } from "@infrastructure/lightning-connect/hooks"

export const Authentication = () => {
  const {nodeDoc} = useNodeDoc()
  const {auth} = useLightningConnect()
  return (
    <AuthenticationContainer>
      <Heading>AUTHENTICATION</Heading>
      <AuthRow>
        {auth ? <AuthCard title="Admin Macaroon" hex={auth?.macaroon} base64={hexToBase64(auth?.macaroon || "02")} description="Grants full access to the node API. Full read access, sending payments, and opening/closing channels."/> : <AuthCard title="Admin Macaroon" description="Unlock with your password for the admin macaroon" hidden /> }
        <AuthCard title="Read-Only Macaroon" hex={nodeDoc?.data.bscMacaroon} base64={hexToBase64(nodeDoc?.data.bscMacaroon || "02")} description="Grants access read-only access. Channel information, transaction history, and creating invoices."/>
        <AuthCard title="Invoice Macaroon" hex={nodeDoc?.data.bscMacaroon} base64={hexToBase64(nodeDoc?.data.bscMacaroon || "02")} description="Grants access to only creating invoices."/>
        <AuthCard title="Certificate" hex={nodeDoc?.data.cert} base64={hexToBase64(nodeDoc?.data.cert || "02")} description="Create a secure connection to the nodes API."/>
      </AuthRow>
      <Seed />
    </AuthenticationContainer>
  )
}