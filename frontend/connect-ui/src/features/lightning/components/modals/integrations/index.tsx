import { IntegrationSteps } from "@lightning/types"
import { useRouter } from "next/router"
import { AuthenticateIntegration } from "./authenticate"
import { CompleteIntegration } from "./complete"
import { AddIntegration } from "./add"
import { AuthForm } from "./auth-form"
import { IntegrationStyles } from "./integrations.styles"
import { useIntegrationById } from "@platform/integrations/queries"
import { Loading } from "@platform/common"

export const Integrations = () => {
  const router = useRouter()
  const {step, integrationId } = router.query
  const {integration} = useIntegrationById(integrationId as string)
  switch (step) {
    case IntegrationSteps.Add:
      return (
        <IntegrationStyles>
          <AddIntegration />
        </IntegrationStyles>
      )
    case IntegrationSteps.Authenticate:
      return (
        <IntegrationStyles>
          <AuthenticateIntegration />
        </IntegrationStyles>
      )
    case IntegrationSteps.Complete:
      return (
        <IntegrationStyles>
          <CompleteIntegration integration={integration} />
        </IntegrationStyles>
      )
    default:
      return (
        <IntegrationStyles>
          <Loading when={true} />
        </IntegrationStyles>
      )
  }
}