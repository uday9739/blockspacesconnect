import { useRouter } from "next/router"
import { useEffect } from "react"
import { IntegrationSteps } from "@lightning/types"
import { Button, Loading, LoadingBar } from "@platform/common"
import { useInstallIntegration } from "@platform/integrations/mutations"
import { IntegrationStyles, Title, Logo, IntegrationContent, StepWithName, LogoContainer, Name } from "./integrations.styles"
import { useIntegrationById } from "@src/platform/hooks/integrations/queries"

export const AddIntegration = () => {
  const router = useRouter()
  const { integrationId } = router.query
  const { mutate: installIntegration, isLoading, isSuccess } = useInstallIntegration()
  const { integration, isLoading: integrationLoading } = useIntegrationById(integrationId as string)

  useEffect(() => {
    if (!integration || integration.installed || integrationLoading) return
    installIntegration(integrationId as string)
  }, [integration])

  return (
    <IntegrationStyles>
      <IntegrationContent canProceed>
        <StepWithName>
          <Title>{(isLoading || integrationLoading) ? "Adding integration..." : "Added integration"}</Title>
          <Name>{integration?.name}</Name>
        </StepWithName>
        <Loading when={isLoading || integrationLoading} height="8rem">
          <LogoContainer>
            {integration?.connectors?.map((connection) => (
              <Logo size="8" alt="connection-logo" src={connection.iconUrl} />
            ))}
          </LogoContainer>
        </Loading>
        <Button variation="simple" disabled={isLoading || integrationLoading} label="AUTHENTICATE" onClick={() => router.push({ pathname: router.pathname, query: { modal: "integrations", integrationId: integrationId, step: IntegrationSteps.Authenticate } })} />
      </IntegrationContent>
    </IntegrationStyles>
  )
}