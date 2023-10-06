import React from "react";
import { Body, StyledConnections, Header, Title, ConnectionPanel, ConnectionPlaceholder } from "./connections.styles";
import { Connection, Connector, CyclrConnection } from "@lightning/components";
import { useCheckQuickBooksIntegrationForTenant } from "@lightning/queries";
import { useGetCurrentUser } from "@src/platform/hooks/user/queries";
import { useAvailableIntegrations } from "@platform/integrations/queries";
import { Loading } from "@src/platform/components/common";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { useGetActiveConnectorsForNetwork } from "@src/platform/hooks/connectors";
import { useGetMyWishlist } from "@src/platform/hooks/wishlist";
import { Box } from "@mui/material";

export const Connections = () => {
  const { data: user } = useGetCurrentUser();
  return user?.featureFlags?.cyclrUserBIP ? <ConnectionsCyclr /> : <ConnectionsLegacy />;
};

export const ConnectionsCyclr = () => {
  const { data: integrations, isLoading } = useAvailableIntegrations();
  const { data: businessConnecters, isLoading: businessConnectersIsLoading } = useGetActiveConnectorsForNetwork(NetworkId.LIGHTNING);
  const { data: myWishlist, isLoading: isMyWishlistLoading } = useGetMyWishlist();
  
  if (isLoading)
    return (
      <StyledConnections>
        <Body>
          <Header>
            <Title>CONNECTIONS</Title>
          </Header>
          <ConnectionPanel>
            <Loading when={isLoading} />
          </ConnectionPanel>
        </Body>
      </StyledConnections>
    );

  return (
    <StyledConnections>
      <Body>
        <Header>
          <Title>CONNECTIONS</Title>
        </Header>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "flex-start",
            padding: "15px"
          }}
        >
          <>
            <Box>
              {integrations?.data?.map((integration) => {
                return <CyclrConnection key={integration.integrationId} integration={integration} disableConnect={false} />;
              })}
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexWrap:"wrap",
                justifyContent: "center",
                paddingTop: "15px",
                paddingBottom: "15px"
              }}
            >
              {businessConnecters?.map((x) => {
                const requested = !!myWishlist?.find((y) => y.networkId === NetworkId.LIGHTNING && y.connectorId === x.connector._id);
                return <Connector connector={x.connector} requested={requested}></Connector>;
              })}
            </Box>
          </>
        </Box>
      </Body>
    </StyledConnections>
  );
};

export const ConnectionsLegacy = () => {
  const { data: isQuickBooksEnabled, isLoading } = useCheckQuickBooksIntegrationForTenant();
  const { data: businessConnecters, isLoading: businessConnectersIsLoading } = useGetActiveConnectorsForNetwork(NetworkId.LIGHTNING);
  const { data: myWishlist, isLoading: isMyWishlistLoading } = useGetMyWishlist();
  const installedConnections = [
    {
      name: "QuickBooks",
      logo: "/images/logos/quickbooks.png",
      color: "#2ba01d",
      active: isQuickBooksEnabled,
      loading: isLoading
    }
  ];
  const connectionList = [];
  for (let i = 0; i < 1; i++) {
    connectionList.push(<ConnectionPlaceholder key={`placeholder-${i}`} />);
  }

  return (
    <StyledConnections>
      <Body>
        <Header>
          <Title>CONNECTIONS</Title>
        </Header>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexWrap:"wrap",
            justifyContent: "center",
            paddingBottom: "15px"
          }}
        >
          <>
            {installedConnections?.map((x) => (
              <Connection key={`connection-${x.name}`} connection={x} disableConnect={x.loading} />
            ))}
            {businessConnecters?.map((x) => {
              const requested = !!myWishlist?.find((y) => y.networkId === NetworkId.LIGHTNING && y.connectorId === x.connector._id);
              return <Connector connector={x.connector} requested={requested}></Connector>;
            })}
          </>
        </Box>
      </Body>
    </StyledConnections>
  );
};
