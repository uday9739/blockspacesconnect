import { useActivateIntegration } from "@platform/integrations/mutations"
import { Button, Loading } from "@src/platform/components/common"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { IntegrationContent, IntegrationStyles, Logo, LogoContainer, Name, StepWithName, Title } from "./integrations.styles"

export const CompleteIntegration = ({ integration }) => {
  const router = useRouter()
  const { mutate: activateIntegration, isLoading: activatingIntegration } = useActivateIntegration()

  useEffect(() => {
    if (!router.isReady) return
    activateIntegration({ integrationId: router.query.integrationId as string })

  }, [router.isReady])

  return (
    <IntegrationStyles>
      <IntegrationContent canProceed>
        <StepWithName>
          <Title>{activatingIntegration ? "Activating integration..." : "Activated integration!"}</Title>
          <Name>{integration.name}</Name>
        </StepWithName>
        <LogoContainer>
          {integration?.connectors?.map((connection) => (
            <Logo size="8" alt="connection-logo" src={connection.iconUrl} />
          ))}
        </LogoContainer>
        <Loading when={activatingIntegration} height="3.875rem">
          <Button variation="simple" onClick={() => { router.push({ pathname: router.pathname, query: null }) }} label="CONTINUE" />
        </Loading>
      </IntegrationContent>
    </IntegrationStyles>
  )
}