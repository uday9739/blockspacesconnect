import { useUninstallIntegration } from "@platform/integrations/mutations";
import { Button } from "@src/platform/components/common";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Title, ConfirmUninstall } from "./integrations.styles"

export const DisconnectIntegration = () => {
  const router = useRouter()
  const { integrationId } = router.query
  const { mutate: uninstallIntegration, isLoading: uninstallLoading, isSuccess } = useUninstallIntegration();

  const uninstall = () => {
    uninstallIntegration(integrationId as string)
  }

  useEffect(() => {
    if (!isSuccess) return
    router.push({ pathname: router.pathname, query: null })
  }, [isSuccess])

  return (
    <ConfirmUninstall>
      <Title>Are you sure you want to<br></br> remove this integration?</Title>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-around", paddingTop: "2rem" }}>
        <Button label="CANCEL" width="10rem" variation="simple" onClick={() => router.push({ pathname: router.pathname, query: null })} />
        <Button label="YES" width="6rem" submitting={uninstallLoading} variation="default" onClick={() => uninstall()} />
      </div>
    </ConfirmUninstall>
  )
}