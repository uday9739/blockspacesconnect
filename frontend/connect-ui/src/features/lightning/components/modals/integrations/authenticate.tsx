import { useRouter } from "next/router"
import { Button, Loading } from "@platform/common"
import { useInstalledConnectors, useIntegrationById } from "@platform/integrations/queries"
import { AuthenticateConnector, IntegrationStyles, Logo, IntegrationContent, Title, StepWithName, Name, ConnectorAuthLogoWithName, ConnectorAuthName } from "./integrations.styles"
import { ConnectorDto } from "@blockspaces/shared/dtos/integrations"
import { useIntegrationAuthUrl } from "@src/platform/hooks/integrations/mutations"
import { IntegrationSteps } from "@src/features/lightning/types"

export const AuthenticateIntegration = () => {
  const router = useRouter()
  const {integrationId} = router.query
  const {integration, isLoading} = useIntegrationById(integrationId as string)
  const { authenticated } = useInstalledConnectors()

  return (
    <IntegrationStyles>
      <Loading when={isLoading}>
        <IntegrationContent canProceed>
          <div>
            <StepWithName>
              <Title>Authenticate App</Title>
              <Name>{integration?.name}</Name>
            </StepWithName>
            <div style={{ marginTop: "2rem" }}>
              {integration?.connectors?.map(connector => connector.name !== 'BlockSpaces' && <Authenticate connector={connector} integrationId={integrationId as string} />)}
            </div>
          </div>
          <Button variation="simple" label="CONTINUE" disabled={!authenticated} onClick={() => router.push({ pathname: router.pathname, query: { modal: "integrations", integrationId: integrationId, step: IntegrationSteps.Complete } })} />
        </IntegrationContent>
      </Loading>
    </IntegrationStyles>
  )
}

type AuthenticateProp = { connector: ConnectorDto, integrationId: string }
const Authenticate = ({ connector }: AuthenticateProp) => {
  const router = useRouter()
  const { getConnector } = useInstalledConnectors()
  const { mutate: getAuthUrl, data: authUrl, isLoading: authUrlLoading } = useIntegrationAuthUrl()
  const connectorInfo = getConnector(connector.name)
  const encodedUri = encodeURIComponent(`${router.pathname}?modal=integrations&integrationId=${router.query.integrationId}&step=${IntegrationSteps.Authenticate}`)

  const goToAuthUrl = async () => {
    await getAuthUrl({ accountConnectorId: connectorInfo.accountConnectorId, callbackUrl: `${process.env.HOST_URL}` + encodedUri })
  }

  if (authUrl?.data) router.push(authUrl.data)

  return (
    <AuthenticateConnector>
      <ConnectorAuthLogoWithName>
        <Logo size="4" alt={connector.name + "logo"} src={connector.iconUrl} />
        <ConnectorAuthName>{connector.name}</ConnectorAuthName>
      </ConnectorAuthLogoWithName>
      <Button label={connectorInfo?.authenticated ? "CONNECTED" : "AUTHENTICATE"} variation="simple" height="3rem" disabled={connectorInfo?.authenticated} submitting={authUrlLoading} width="12rem" onClick={() => goToAuthUrl()} />
    </AuthenticateConnector>
  )
}