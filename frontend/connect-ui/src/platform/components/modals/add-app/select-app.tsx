import { App, AppLogo, AppLogoBG, AppName, Catalog, ChainInitials, Connector, ConnectorLogo, ConnectorName, IsInstalledCheck, IsInterestedCheck } from "./select-app.styles";
import { Check, NetworkIcon } from "@icons";
import fontColorContrast from "font-color-contrast";
import { useGetActiveNetworkOfferings, useGetNetworkCatalogCategories, useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import { useGetConnectSubscription, useGetCurrentUser, useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { InitCartArgs, useInitCart } from "@platform/cart/mutations";
import { useEffect, useState } from "react";
import { MAX_SUBSCRIPTION_LINE_ITEMS } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { Loading } from "../../common";
import { Box, Tooltip } from "@mui/material";
import { Network, NetworkId } from "@blockspaces/shared/models/networks";
import { useAddUserNetwork } from "@src/platform/hooks/user/mutations";
import { useRouter } from "next/router";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import InfoIcon from "@mui/icons-material/Info";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import React from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "styled-components";
import { event } from "nextjs-google-analytics";
import { useGetActiveConnectors } from "@src/platform/hooks/connectors";
import { Connectors } from "@blockspaces/shared/models/connectors";
import { useGetMyWishlist } from "@src/platform/hooks/wishlist";
import CheckIcon from "@mui/icons-material/Check";
//
type Props = { next: () => void; setErrorMsg?: any; allowAdd: boolean };

export const SelectApp = ({ next, setErrorMsg, allowAdd }: Props) => {
  const router = useRouter();
  const { data: user } = useGetCurrentUser();
  const { data: userNetworks } = useGetUserNetworks();
  const { data: connectors, isLoading: isConnectorsLoading } = useGetActiveConnectors();
  const { catalog } = useNetworkCatalog();
  const { data: myWishlist, isLoading: isMyWishlistLoading } = useGetMyWishlist();
  const { data: categories, isLoading: isCategoriesLoading } = useGetNetworkCatalogCategories();
  const { data: activeNetworkOfferings, isLoading: activeNetworkOfferingsIsLoading } = useGetActiveNetworkOfferings();
  const { mutate: initCart, isSuccess: initSuccess, error: initCartError, isLoading: initCartLoading } = useInitCart();
  const { mutate: addUserNetwork, isSuccess: addUserNetworkIsSuccess, isLoading: addUserNetworkIsLoading } = useAddUserNetwork();
  const theme = useTheme();

  function trimString(str: string): string {
    if (!str) return "";
    const words = str.split(" ");
    if (words.length >= 2) {
      return words.map((word) => word[0].toUpperCase()).join("");
    } else {
      return str.substring(0, 2);
    }
  }

  if (initCartError) setErrorMsg(initCartError["message"]);
  if (initSuccess) next();

  useEffect(() => {
    if (addUserNetworkIsSuccess) router.push(`/infrastructure/${NetworkId.POCKET}`);
  }, [addUserNetworkIsSuccess]);

  const getAvailableNetworksForCategory = (categoryCode: string) => {
    const categoryOffers = activeNetworkOfferings?.filter((x) => (x.billingCategory as NetworkPriceBillingCategory)?.code === categoryCode);
    const networkIds = Array.from(new Set(categoryOffers?.map((item: any) => item.network)));
    const filtered = catalog?.filter((x) => networkIds.indexOf(x._id) > -1);
    const sorted = filtered?.sort((a, b) => Number(b.isFeatured || null) - Number(a.isFeatured || null));
    return sorted.map(x => ({
      ...x,
      offerings: categoryOffers
    }));
  };

  const initCartHelper = (data: InitCartArgs) => {
    event("initCart", {
      category: `cart`,
      label: `${data.billingCategoryCode}-${data.networkId}`,
      userId: user.id
    });
    initCart(data);
  };

  const onConnectorClick = (connector: Connectors) => {
    router.push({ pathname: router.pathname, query: { modal: "join-private-beta", connectorId: connector._id } });
  };

  if (isCategoriesLoading) {
    return (
      <Box id="select-app-container" sx={{ overflow: "auto" }}>
        <Loading when></Loading>
      </Box>
    );
  }

  return (
    <Box id="select-app-container" sx={{ maxWidth: "auto", overflowY: "auto" }}>
      <Loading when={initCartLoading || addUserNetworkIsLoading || activeNetworkOfferingsIsLoading || isConnectorsLoading}></Loading>
      {categories?.map((category, key) => {
        const availableNetworksForCategory = getAvailableNetworksForCategory(category.code);
        return (
          <Box key={key}>
            <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
              <Box sx={{ display: "flex", alignItems: "center", color: theme.palette.primary.main }}>
                <h3> {category.name}</h3>
                <Tooltip title={category.description}>
                  <InfoIcon fontSize="small" sx={{ marginLeft: "5px", fontSize: "small", color: theme.palette.primary.main }} />
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ margin: "20px 15px 20px 15px" }}>
              <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
                {category.code === NetworkPriceBillingCodes.BusinessConnectors
                  ?
                  //#region connectors
                  connectors?.map((connector: Connectors, index) => {
                    const requested = !!myWishlist?.find((x) => !x.networkId && x.connectorId === connector._id);
                    return (
                      <Connector requested={requested} id={`select-${connector.name}`} key={`connector-${connector.name}`} onClick={() => onConnectorClick(connector)}>
                        <ConnectorLogo>
                          <img src={connector.base64Icon as any} alt={connector.name} />
                        </ConnectorLogo>
                        <ConnectorName>{connector.name} </ConnectorName>
                        <Box
                          sx={{
                            display: `${connector.isFeatured ? "" : "none"}`,
                            position: "absolute",
                            top: "0",
                            right: "-5px",
                            color: "#FFB800"
                          }}
                        >
                          <StarIcon />
                        </Box>
                        {requested && (
                          <IsInterestedCheck color={theme.palette.primary.main} background={theme.palette.grey[300]}>
                            <CheckIcon />
                            Interested
                          </IsInterestedCheck>
                        )}
                      </Connector>
                    );
                  })
                  //#endregion
                  :
                  //#region Offerings
                  availableNetworksForCategory?.map((network: Network, index) => {
                    const { name, chain, _id } = network;
                    const offering = network["offerings"]?.find(x => x.network === network._id);
                    const requested = !!myWishlist?.find((x) => x.networkId === network._id && x.offerId === offering?._id);
                    const isWishListItem = network._id === NetworkId.ARC_LENDING || network._id === NetworkId.ARC_OTC_DERIVATIVES;
                    const installed = userNetworks?.find((x) => x.networkId === network._id && !x.status) != null;
                    const background = network.secondaryColor ? `linear-gradient(45deg, ${network.primaryColor} 10%, ${network.secondaryColor} 90%)` : network.primaryColor;
                    return (
                      <App
                        id={`select-${network._id}`}
                        installed={installed}
                        key={`app-${name}-${chain}`}
                        onClick={() => {
                          if (requested || installed || !allowAdd) return;

                          if (isWishListItem) {
                            router.push({ pathname: router.pathname, query: { modal: "join-private-beta", networkId: network._id, offerId: offering?._id } });
                          } else if (network._id === NetworkId.POCKET) {
                            addUserNetwork({ networkId: NetworkId.POCKET, billingCategoryCode: NetworkPriceBillingCodes.Infrastructure, billingTierCode: BillingTierCode.Standard });
                          } else {
                            initCartHelper({ networkId: network._id, billingCategoryCode: category.code });
                          }
                        }}
                      >
                        <AppLogo>
                          <AppLogoBG background={background}>
                            <NetworkIcon networkId={network._id} />
                            {chain && (
                              <ChainInitials background={background} installed={installed} color={fontColorContrast(network.primaryColor, 0.8)}>
                                {trimString(chain)}
                              </ChainInitials>
                            )}
                            {installed && (
                              <IsInstalledCheck color={fontColorContrast(network.primaryColor, 0.8)} background={background}>
                                <Check />
                                Installed
                              </IsInstalledCheck>
                            )}
                            {requested && (
                              <IsInstalledCheck color={fontColorContrast(network.primaryColor, 0.8)} background={background}>
                                <Check />
                                Interested
                              </IsInstalledCheck>
                            )}
                          </AppLogoBG>
                        </AppLogo>
                        <AppName>{chain ? `${name} ${chain}` : name} </AppName>
                        <Box
                          sx={{
                            display: `${network.isFeatured ? "" : "none"}`,
                            position: "absolute",
                            top: "0",
                            right: "-5px",
                            color: "#FFB800"
                          }}
                        >
                          <StarIcon />
                        </Box>

                      </App>
                    );
                  })
                  //#endregion
                }
              </ScrollMenu>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev, visibleElements, initComplete } = React.useContext(VisibilityContext);
  const [disabled, setDisabled] = React.useState(!initComplete || (initComplete && isFirstItemVisible));
  const theme = useTheme();
  React.useEffect(() => {
    if (visibleElements.length) {
      setDisabled(isFirstItemVisible);
    }
  }, [isFirstItemVisible, visibleElements]);
  return (
    <ArrowBackIosIcon sx={{ cursor: "pointer", color: theme.bscBlue, margin: "auto", opacity: `${disabled ? "0%" : "100%"}` }} onClick={() => scrollPrev()}>
      Left
    </ArrowBackIosIcon>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext, visibleElements } = React.useContext(VisibilityContext);
  const [disabled, setDisabled] = React.useState(!visibleElements.length && isLastItemVisible);
  const theme = useTheme();
  React.useEffect(() => {
    if (visibleElements.length) {
      setDisabled(isLastItemVisible);
    }
  }, [isLastItemVisible, visibleElements]);
  return (
    <ArrowForwardIosIcon sx={{ cursor: "pointer", color: theme.bscBlue, margin: "auto", opacity: `${disabled ? "0%" : "100%"}` }} onClick={() => scrollNext()}>
      Right
    </ArrowForwardIosIcon>
  );
}
