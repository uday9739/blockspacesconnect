import React from "react";
import { useRouter } from "next/router";
import { StyledConnection, Logo, Name, StyledConnectionLegacy } from "./connection.styles";
import { QuickBooksConnectionSteps, IntegrationSteps } from "@lightning/types";
import { Button } from "@platform/common";
import { IntegrationDto } from "@blockspaces/shared/dtos/integrations";
import { Connectors } from "@blockspaces/shared/models/connectors";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { FormControl, FormControlLabel, FormGroup, Switch, Tooltip } from "@mui/material";

type Props = {
  disableConnect: boolean;
  connection: {
    name: string;
    logo: string;
    color: string;
    active: boolean;
  };
};

const buttonStyles = {
  position: "absolute",
  top: "2.5rem",
  right: "2rem",
};

export const Connection = ({ connection, disableConnect = false }: Props) => {
  const router = useRouter();

  return (
    <StyledConnection>
      <Logo alt="connection-logo" src={connection.logo} />
      <Name>{connection.name}</Name>
      <Tooltip title={connection.active ? "Connected" : "Connect"}>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <Switch
              size="medium"
              id={"btn" + connection.name}
              checked={connection.active}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.checked) {
                  router.replace({ pathname: router.pathname, query: { modal: "finalizeConnection", step: QuickBooksConnectionSteps.NotConnected } });
                } else {
                  //
                }
              }}
            />
          </FormGroup>
        </FormControl>
      </Tooltip>
    </StyledConnection>
  );
};

type CyclrProps = {
  disableConnect: boolean;
  integration: IntegrationDto;
};
export const CyclrConnection = ({ integration, disableConnect = false }: CyclrProps) => {
  const router = useRouter();
  if (integration.connectors.length === 0) return;

  return (
    <StyledConnectionLegacy>
      {integration.connectors.map((connection) => (
        <Logo key={connection.name} alt="connection-logo" src={connection.iconUrl} />
      ))}
      <Name>{integration.name}</Name>
      <Button
        variation="simple"
        label={integration?.installed === true && integration?.active === true ? 'Manage' : integration?.installed === true && integration.active !== true ? 'Continue setup' : 'Install'}
        height="3rem"
        width="10rem"
        disabled={disableConnect}
        customStyle={buttonStyles}
        onClick={() => router.push({ pathname: router.pathname, query: { modal: "integration-widget", integrationId: integration.integrationId } })}
      >
        Connect
      </Button>
    </StyledConnectionLegacy>
  );
};

type ConnectorProps = { connector: Connectors; requested: boolean };
export const Connector = ({ connector, requested }: ConnectorProps) => {
  const router = useRouter();

  return (
    <StyledConnection>
      <Logo alt="connection-logo" src={connector?.base64Icon} />
      <Name>{connector?.name}</Name>
      <Tooltip title={requested ? "Requested" : "Join private beta"}>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <Switch
              size="medium"
              id={"btn" + connector?.name}
              disabled={requested}
              checked={requested}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (event.target.checked) router.replace({ query: { modal: "join-private-beta", connectorId: connector._id, networkId: NetworkId.LIGHTNING }, pathname: router.pathname });
              }}
            />
          </FormGroup>
        </FormControl>
      </Tooltip>
    </StyledConnection>
  );
};
