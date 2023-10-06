import { Box, Button, Typography } from "@mui/material";
import { IntegrationSteps } from "@src/features/lightning/types";
import { Loading } from "@src/platform/components/common";
import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { ModalContainer, ModalHeaderCloseWrapper, ModalTitle } from "@src/platform/components/common/modal/styles";
import { useActivateIntegration, useDisconnectConnector, useInstallIntegration, useIntegrationAuthUrl, useStopIntegration, useUninstallIntegration } from "@src/platform/hooks/integrations/mutations";
import { useInstalledConnectors as useInstalledConnectors, useIntegrationById } from "@src/platform/hooks/integrations/queries";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { Logo, LogoContainer } from "../integrations/integrations.styles";
import { useUIStore } from "@src/providers/ui";
import { uninstallIntegration } from "@src/platform/api/integrations";
import { AuthForm } from "../integrations/auth-form";
import { Cancel, NetworkIcon } from "@icons";

const Step = styled.div<{ hidden?: boolean }>`
  display: ${(p) => (p.hidden === true ? "none" : "flex")};
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  flex: 1 1 0px;
  justify-content: space-between;
  padding: 15px;
  margin: 0px 15px 15px 15px;
  border: 1px solid #e7ebff;
  border-radius: 1.5rem;
`;
const StepHeader = styled.div<{ active?: boolean; complete?: boolean }>`
  height: 55px;
  width: 55px;
  line-height: 55px;
  border: 1px solid #e7ebff;
  border-radius: 50%;
  text-align: center;
  vertical-align: center;
  font-family: "Roboto Mono", monospace;
  font-weight: bold;
  color: ${(p) => (p.complete ? "white" : "inherit")};
  background-color: ${(p) => (p.active ? p.theme.lighterBlue : p.complete ? "green" : "inherit")};
`;

enum Steps {
  Install = 1,
  Authenticate = 2,
  Start = 3
}

const IntegrationsWidget = () => {
  const router = useRouter();
  const ui = useUIStore();
  const { integrationId } = router.query;

  // mutations
  const { mutate: installIntegration, isLoading: isInstalling, isSuccess: installedSuccess, isError: installError, data: installResult } = useInstallIntegration();
  const { mutate: uninstallIntegration, isLoading: isUnInstalling, isSuccess: unInstalledSuccess, isError: unInstallError, data: unInstallResult } = useUninstallIntegration();
  const { mutate: disconnectConnector, isLoading: isDisconnecting, isSuccess: disconnectSuccess, isError: disconnectError, data: disconnectResult } = useDisconnectConnector();
  const { mutateAsync: getAuthUrl, data: authUrl, isLoading: authUrlLoading } = useIntegrationAuthUrl();
  const { mutate: activateIntegration, isLoading: activatingIntegration, isSuccess: activatingIntegrationSuccess } = useActivateIntegration();
  const { mutate: stopIntegration, isLoading: stoppingIntegration, isSuccess: stopIntegrationSuccess } = useStopIntegration();
  // queries
  const { integration, isLoading: integrationDetailsLoading, refetch: refetchIntegration } = useIntegrationById(integrationId as string);
  const { getConnector, installed, isLoading: loadingInstalled, refetch: fetchInstalled } = useInstalledConnectors(integration?.installed === true);

  //#region Helpers
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showAuthentication, setShowAuthentication] = useState(false);
  const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);
  const connector = integration?.connectors?.find((x) => x.name !== "BlockSpaces");
  const accountConnector = getConnector(connector?.name);
  const isOAuth = connector?.authType === "OAuth2";
  const isInstalled = (): boolean => integration?.installed === true;
  const isAuthenticated = (): boolean => accountConnector?.authenticated === true;

  const isStepActive = (step: Steps): boolean => {
    switch (step) {
      case Steps.Install:
        return isStepComplete(Steps.Install) === false;
      case Steps.Authenticate:
        return isStepComplete(Steps.Install) === true && isStepComplete(Steps.Authenticate) === false;
      case Steps.Start:
        return isStepComplete(Steps.Install) === true && isStepComplete(Steps.Authenticate) === true && isStepComplete(Steps.Start) === false;
      default:
        return false;
    }
  };
  const isStepComplete = (step: Steps) => {
    switch (step) {
      case Steps.Install:
        return integration?.installed === true;
      case Steps.Authenticate:
        return integration?.installed === true && isAuthenticated() === true;
      case Steps.Start:
        return integration?.active === true;
      default:
        return false;
    }
  };
  const isStepDisabled = (step: Steps): boolean => {
    switch (step) {
      case Steps.Install:
        return false;
      case Steps.Authenticate:
        return isStepComplete(Steps.Install) === false;
      case Steps.Start:
        return isStepComplete(Steps.Authenticate) === false;
      default:
        return false;
    }
  };

  const isStepLoading = (step: Steps): boolean => {
    if (initialLoadComplete === false) return true;
    switch (step) {
      case Steps.Install:
        return isInstalling || isUnInstalling || integrationDetailsLoading || loadingInstalled;
      case Steps.Authenticate:
        return isStepLoading(Steps.Install) || isAuthRedirecting || isDisconnecting;
      case Steps.Start:
        return isStepLoading(Steps.Install) || isStepLoading(Steps.Authenticate) || activatingIntegration || stoppingIntegration;
      default:
        return false;
    }
  };

  const allStepsComplete = (): boolean =>
    Object.keys(Steps)
      .filter((item) => !isNaN(Number(item)))
      .every((x) => isStepComplete(Number(x)));

  useEffect(() => {
    if (initialLoadComplete) return;
    if (!integration && !initialLoadComplete) return;
    if (integration && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [initialLoadComplete, integration]);
  //#endregion

  //#region Handle Install
  useEffect(() => {
    if (isInstalling || isUnInstalling) return;
    if (installedSuccess || unInstalledSuccess) {
      if (installResult?.status === ApiResultStatus.Failed) {
        ui.showToast({
          message: installResult.message,
          alertType: "error",
          autoHideDuration: 1000,
          position: {
            horizontal: "right",
            vertical: "top"
          }
        });
      } else {
        refetchIntegration();
      }
    }
  }, [isInstalling, installedSuccess, isUnInstalling, unInstalledSuccess, isDisconnecting, disconnectSuccess]);

  const onInstallClick = () => {
    if (isStepComplete(Steps.Install)) {
      //uninstall
      uninstallIntegration(integrationId as string);
    } else {
      //install
      installIntegration(integrationId as string);
    }
  };

  //#endregion

  //#region Handle Authenticate

  useEffect(() => {
    if (isDisconnecting) return;
    if (disconnectSuccess) {
      fetchInstalled();
      refetchIntegration();
    }
  }, [isDisconnecting, disconnectSuccess]);

  const onAuthenticateClick = async () => {
    if (isStepComplete(Steps.Authenticate)) {
      // un-authenticate
      disconnectConnector({ integrationId: integrationId.toString(), accountConnectorId: getConnector(connector?.name)?.accountConnectorId });
    } else {
      setShowAuthentication(true);
    }
  };

  const onAuthActionSuccess = async () => {
    setShowAuthentication(false);
    if (isOAuth) {
      setIsAuthRedirecting(true);
      const encodedUri = encodeURIComponent(`${router.pathname}?modal=integration-widget&integrationId=${integrationId}`)
      const uri = await getAuthUrl({
        accountConnectorId: getConnector(connector?.name)?.accountConnectorId,
        callbackUrl: `${process.env.HOST_URL}${encodedUri}`
      });

      if (uri?.data) await router.push(uri.data);

      //
    } else {
      //Authenticate non-OAuth
      fetchInstalled();
      refetchIntegration();
    }

    return;
  };
  //#endregion

  //#region Handle Start
  useEffect(() => {
    if (activatingIntegration || stoppingIntegration) return;
    if (stopIntegrationSuccess) {
      fetchInstalled();
      refetchIntegration();
      return;
    }
    if (activatingIntegrationSuccess) {
      fetchInstalled();
      refetchIntegration();
      ui.showToast({
        message: "Integration Started",
        alertType: "success",
        autoHideDuration: 1000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });
      // router.push("/multi-web-app/lightning/connections");
    }
  }, [activatingIntegration, activatingIntegrationSuccess, stoppingIntegration]);

  const onStartClick = () => {
    if (isStepComplete(Steps.Start)) {
      stopIntegration({ integrationId: integrationId as string });
    } else {
      // start service
      activateIntegration({ integrationId: integrationId as string });
    }
  };
  //#endregion

  if (initialLoadComplete === false) return <Loading when />;

  return (
    <>
      <ModalContainer id="integration-widget-modal-container" style={{ minWidth: "700px", height: "auto", width: "45%", paddingBottom: "15px" }}>
        {/* Modal Header */}
        <Box id="integration-widget-modal-content-header" sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Box sx={{ marginTop: "15px" }}>
              <LogoContainer>
                {integration?.connectors?.map((connection, index) => (
                  <Logo key={index} size="4" alt="connection-logo" src={connection.iconUrl} />
                ))}
              </LogoContainer>
            </Box>
            <ModalTitle>{integration?.name}</ModalTitle>
          </Box>
          <ModalHeaderCloseWrapper style={{ alignSelf: "center", justifySelf: "end" }} onClick={() => router.push({ pathname: router.pathname, query: null })}>
            <Cancel />
          </ModalHeaderCloseWrapper>
        </Box>
        {/* Modal Body */}
        <Box id="integration-widget-modal-content-body" sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", minHeight: "200px", width: "100%" }}>
          {/* Step 1 */}
          <Step id="install-step" hidden={showAuthentication}>
            <StepHeader active={isStepActive(Steps.Install)} complete={isStepComplete(Steps.Install)}>
              1
            </StepHeader>
            <Box>{isStepComplete(Steps.Install) ? "Installed" : "To get started click Install."}</Box>
            <Loading when={isStepLoading(Steps.Install)} />
            <Button
              onClick={onInstallClick}
              type="button"
              disabled={isStepDisabled(Steps.Install) || isStepLoading(Steps.Install)}
              variant={isStepComplete(Steps.Install) ? "outlined" : "contained"}
              color={isStepComplete(Steps.Install) ? "secondary" : "primary"}
            >
              {isStepComplete(Steps.Install) ? "Uninstall" : "Install"}
            </Button>
          </Step>
          {/* Step 2 */}
          <Step id="auth-step">
            <StepHeader active={isStepActive(Steps.Authenticate)} complete={isStepComplete(Steps.Authenticate)}>
              2
            </StepHeader>
            <Box> {isStepComplete(Steps.Authenticate) ? "Authenticated" : "Authenticate"}</Box>
            {showAuthentication && <AuthForm accountConnector={accountConnector} onSuccess={onAuthActionSuccess} cancelAction={() => setShowAuthentication(false)} />}
            <Loading when={isStepLoading(Steps.Authenticate)} />
            <Button
              sx={{ display: showAuthentication ? "none" : "inherit" }}
              onClick={onAuthenticateClick}
              type="button"
              disabled={isStepDisabled(Steps.Authenticate) || isStepLoading(Steps.Authenticate)}
              variant={isStepComplete(Steps.Authenticate) ? "outlined" : "contained"}
              color={isStepComplete(Steps.Authenticate) ? "secondary" : "primary"}
            >
              {isStepComplete(Steps.Authenticate) ? "Disconnect" : "Click to Authenticate"}
            </Button>
          </Step>
          {/* Step 3 */}
          <Step id="start-step" hidden={showAuthentication}>
            <StepHeader active={isStepActive(Steps.Start)} complete={isStepComplete(Steps.Start)}>
              3
            </StepHeader>
            <Box> Start</Box>
            <Loading when={isStepLoading(Steps.Start)} />
            <Button
              onClick={onStartClick}
              type="button"
              disabled={isStepDisabled(Steps.Start) || isStepLoading(Steps.Start)}
              variant={isStepComplete(Steps.Start) ? "outlined" : "contained"}
              color={isStepComplete(Steps.Start) ? "secondary" : "primary"}
            >
              {isStepComplete(Steps.Start) ? "Stop" : "Start"}
            </Button>
          </Step>
        </Box>
        <Box
          sx={{
            marginBottom: "15px"
          }}
        >
          {allStepsComplete() ? (
            <>
              <Button
                sx={{
                  marginBottom: "15px"
                }}
                type="button"
                variant={"contained"}
                color={"primary"}
                onClick={() => router.push({ pathname: router.pathname, query: null })}
              >
                Back to Connections
              </Button>
            </>
          ) : (
            <></>
          )}
        </Box>
      </ModalContainer>
    </>
  );
};

export default IntegrationsWidget;
