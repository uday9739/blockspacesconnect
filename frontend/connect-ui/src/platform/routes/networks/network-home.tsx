// framework
import React, { useEffect } from "react";
import Link from "next/link";
// custom
import { Apps, Plus /*, Collaborate, Build, Connect, Discover, Apps*/ } from "@icons";
import { NetworkHome, AddNetwork, Networks, NetworkTitle /*, Header, TopHeader, BottomHeader, AppHeaderNavItem, AppNavigation, TopNavItem*/ } from "./styles/network-home";
import { AppLauncher } from "./app-launcher";
import { useGetNetworkCatalogCategories, useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import { Network, NetworkId, UserNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import { useGetCurrentUser, useGetUserNetworks } from "@src/platform/hooks/user/queries";
import { Loading } from "@src/platform/components/common";
import { useRouter } from "next/router";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import Box from "@mui/material/Box";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "styled-components";
import { sliceIntoChunks } from "@src/platform/utils";

const NETWORK_HOME = () => {
  const router = useRouter();
  const networksPerRow = 5;
  const { data: user, refetch: refetchUser, isLoading: userIsLoading } = useGetCurrentUser();
  const { data: categories, isLoading: isCategoriesLoading } = useGetNetworkCatalogCategories();
  const { data: userNetworks, isLoading, refetch: refetchUn } = useGetUserNetworks();
  const { catalogLoading, getNetwork } = useNetworkCatalog();
  const theme = useTheme();
  const activeUserNetworks =
    userNetworks?.filter(
      (x) =>
        x.status !== UserNetworkStatus.PendingCancelation || (x.networkId === NetworkId.LIGHTNING && (x.billingCategory as NetworkPriceBillingCategory)?.code === NetworkPriceBillingCodes.MultiWebApp)
    ) || [];

  useEffect(() => {
    if (router.pathname === "/connect") {
      refetchUser();
      refetchUn();
    }
  }, [router.isReady, router.events]);

  const getInstalledByCategoryChunks = (categoryCode: string): Array<any> => {
    const filteredUserNetworks = activeUserNetworks?.filter((x) => (x.billingCategory as NetworkPriceBillingCategory)?.code === categoryCode);
    const padding = networksPerRow - (filteredUserNetworks.length % networksPerRow) - 1;
    const empty = [{ showAdd: true }].concat(Array(padding).fill({}));
    const paddedUserNetworks = filteredUserNetworks?.filter((x) => (x.billingCategory as NetworkPriceBillingCategory)?.code === categoryCode).concat(empty as any);
    return sliceIntoChunks(paddedUserNetworks, networksPerRow);
  };

  if (isLoading || isCategoriesLoading) return <Loading when />;

  return (
    <NetworkHome id="network-home-wrapper" style={{ paddingTop: "55px" }}>
      {categories?.map((category, key) => {
        return (
          <Box key={key}>
            <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
              <Box sx={{ display: "flex", alignItems: "center", color: theme.palette.primary.main }}>
                <h1 style={{ fontSize: "1.4375rem", fontWeight: "900" }}> {category.name}</h1>
                <Tooltip title={category.description}>
                  <InfoIcon fontSize="small" sx={{ marginLeft: "5px", fontSize: "small", color: theme.palette.primary.main }} />
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ margin: "20px 15px 20px 15px", display: "flex", flexDirection: "column" }}>
              {getInstalledByCategoryChunks(category.code)?.map((chunk, index) => {
                return (
                  <Box key={index} sx={{ display: "flex" }}>
                    {chunk.map((userNetwork: any, index) => {
                      const network = getNetwork(userNetwork.networkId);
                      return (
                        <AppLauncher
                          showAdd={userNetwork.showAdd}
                          network={network}
                          billingCategory={category as any}
                          key={network ? network._id : `empty-${index}`}
                          id={network ? `installed-${network._id}` : userNetwork.showAdd ? `add-new-${category.code}` : `empty-${index}`}
                        />
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </NetworkHome>
  );
};

export default NETWORK_HOME;
