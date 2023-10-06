import { Box, Button, Grid } from "@mui/material";
import { useAddToWishlist } from "@src/platform/hooks/wishlist";
import { ModalContent } from "@src/platform/components/common/modal/modal-content";
import { useGetActiveConnectors, useGetConnector } from "@src/platform/hooks/connectors";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AppLogo, AppLogoBG, ChainInitials, Connector, ConnectorLogo, ConnectorName } from "../add-app/select-app.styles";
import { useUIStore } from "@src/providers";
import { useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import fontColorContrast from "font-color-contrast";
import { NetworkIcon } from "../../icons";
import { trimString } from "@src/platform/routes/networks/app-launcher";

export const JoinPrivateBeta = () => {
  const router = useRouter();
  const ui = useUIStore();
  const [network, setNetwork] = useState(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const connectorId = router.query.connectorId;
  const networkId = router.query.networkId;
  const offerId = router.query.offerId;
  const isBusinessConnectors = !!connectorId;
  const isNetworkOffer = !!networkId && !!offerId;
  const { data: connector, isLoading: isConnectorLoading } = useGetConnector(connectorId);
  const { getNetwork } = useNetworkCatalog();
  const { mutate: addToWishlist, isLoading: addToWishlistIsLoading, isSuccess: addToWishlistIsSuccess } = useAddToWishlist();

  useEffect(() => {
    if (isBusinessConnectors) {
      setTitle(`${connector?.name}`);
      setDescription(connector?.description);
    } else if (isNetworkOffer) {
      const network = getNetwork(networkId?.toString());
      setNetwork(network);
      setTitle(`${network?.name}`);
      setDescription(network?.description);
    }

  }, [router.isReady, isBusinessConnectors, connector, isNetworkOffer]);

  useEffect(() => {
    if (addToWishlistIsSuccess) {
      ui.showToast({
        message: "Added successfully",
        alertType: "success",
        autoHideDuration: 1000,
        position: {
          horizontal: "right",
          vertical: "top"
        }
      });

      _onCancel();
    }
  }, [addToWishlistIsLoading, addToWishlistIsSuccess]);

  const _onCancel = () => {
    if (router.pathname === "/connect") {
      router.back();
    } else router.replace({ pathname: router.pathname });
  };
  return (
    <ModalContent
      size="small"
      title={`Join private beta for ${title}`}
      primaryBtnText="Join Private Beta"
      onPrimaryActionClick={() => {
        addToWishlist({
          connectorId: connectorId?.toString(),
          offerId: offerId?.toString(),
          networkId: networkId?.toString()
        });
      }}
      onCancel={_onCancel}
      isSubmitting={addToWishlistIsLoading}
    >
      <JoinPrivateBetaBody>
        <Grid container sx={{ padding: "10px" }}>
          <Grid item sm={12} md={3}>
            <Connector
              id={`select-${connectorId || networkId}`}
              key={`connector-${connectorId || networkId}`}
              style={{
                margin: "-5px"
              }}
            >
              {isBusinessConnectors ?
                <ConnectorLogo>
                  <img src={connector?.base64Icon as any} alt={connector?.name} />
                </ConnectorLogo>
                :
                <AppLogo>
                  <AppLogoBG background={network?.secondaryColor ? `linear-gradient(45deg, ${network?.primaryColor} 10%, ${network?.secondaryColor} 90%)` : network?.primaryColor}>
                    <NetworkIcon networkId={network?._id} />
                    {network?.chain && (
                      <ChainInitials background={network?.secondaryColor ? `linear-gradient(45deg, ${network?.primaryColor} 10%, ${network?.secondaryColor} 90%)` : network?.primaryColor} installed={false} color={fontColorContrast(network?.primaryColor, 0.8)}>
                        {trimString(network?.chain)}
                      </ChainInitials>
                    )}
                  </AppLogoBG>
                </AppLogo>}

              <ConnectorName>{title} </ConnectorName>
              <Box
                sx={{
                  display: `${connector?.isFeatured ? "" : "none"}`,
                  position: "absolute",
                  top: "0",
                  right: "-5px",
                  color: "#FFB800"
                }}
              ></Box>
            </Connector>
          </Grid>
          <Grid item sm={12} md={9}>
            <Grid container>
              {/* <Grid item sm={6}>
                <h1> {title}</h1>
              </Grid>
              <Grid item sm={6} sx={{ textAlign: "end" }}>
                Coming soon!
              </Grid> */}
              <Grid item sm={12}>
                <p>{description}</p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </JoinPrivateBetaBody>
    </ModalContent>
  );
};

const JoinPrivateBetaBody = styled.div``;
