import React from "react";
import { AppLauncherIcon, AppLauncherIconBG, ChainInitials, StyledAppLauncher, AppName } from "./app-launcher.styles";
import Link from "next/link";
import fontColorContrast from "font-color-contrast";
import { Network, NetworkId } from "@blockspaces/shared/models/networks";
import { NetworkIcon } from "@icons";
import { BillingTier } from "@blockspaces/shared/models/network-catalog/Tier";
import { NetworkPriceBillingCategory } from "@blockspaces/shared/models/network-catalog";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "styled-components";
import { Tooltip } from "@mui/material";

type Props = {
  id: string;
  network?: Network;
  billingCategory?: NetworkPriceBillingCategory;
  billingTier?: BillingTier;
  showAdd?: boolean;
};

const LauncherBG = ({ style }: { style: any }) => {
  return (
    <svg style={style} width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M109.445 35.7024L109.445 56.7584L64.2888 99.5678C59.081 104.505 50.9207 104.505 45.7129 99.5678L0.556334 56.7583L0.55634 35.7023C0.556343 25.6052 7.00631 16.6367 16.5786 13.4238L50.7051 1.96931C53.4925 1.03372 56.5092 1.03372 59.2966 1.96932L93.423 13.4238C102.995 16.6367 109.445 25.6052 109.445 35.7024Z"
        stroke="#E7EBFF"
      />
    </svg>
  );
};

export function trimString(str: string): string {
  if (!str) return "";

  const words = str.split(" ");
  if (words.length >= 2) {
    return words.map((word) => word[0].toUpperCase()).join("");
  } else {
    return str.substring(0, 2);
  }
}

export const AppLauncher = ({ id, network, billingCategory, showAdd = false }: Props) => {
  const theme = useTheme();
  if (!network)
    if (showAdd) {
      return (
        <Link href={`/connect?modal=add-app`} legacyBehavior>
          <StyledAppLauncher empty={false} id={id}>
            <Tooltip title={`Add ${billingCategory.name} service`}>
              <AppLauncherIcon>
                <AddIcon sx={{ color: theme.palette.primary.main }} />
              </AppLauncherIcon>
            </Tooltip>
            <AppName />
          </StyledAppLauncher>
        </Link>
      );
    } else
      return (
        <StyledAppLauncher empty={true} id={id}>
          <AppLauncherIcon />
          <AppName />
        </StyledAppLauncher>
      );

  const { _id, name, chain, primaryColor, secondaryColor } = network;
  const background = secondaryColor ? `linear-gradient(45deg, ${primaryColor} 10%, ${secondaryColor} 90%)` : primaryColor;

  return (
    <Link href={`/${billingCategory.slug}/${network._id}`} legacyBehavior>
      <StyledAppLauncher empty={false} id={id}>
        <AppLauncherIcon>
          <AppLauncherIconBG bgColor={background}>
            <NetworkIcon networkId={_id} style={{ transform: "rotate(-45deg)", width: "70%", height: "70%" }} />
            {chain && (
              <ChainInitials background={background} color={fontColorContrast(network.primaryColor, 0.8)}>
                {trimString(chain)}
              </ChainInitials>
            )}
          </AppLauncherIconBG>
          <LauncherBG
            style={{
              position: "absolute",
              top: "-.3125rem",
              fill: "#FFFFFF",
              width: "102%",
              height: "102%"
            }}
          />
        </AppLauncherIcon>
        <AppName>{chain ? `${name} ${chain}` : name}</AppName>
      </StyledAppLauncher>
    </Link>
  );
};
