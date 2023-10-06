import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import fontColorContrast from "font-color-contrast";
import { useTheme } from "styled-components";
import {
  AppMain,
  AppModule,
  AppName,
  AppUtilities,
  DividerBar,
  LogoWrap,
  ChainInitials,
  Name,
  PlatformNavigation,
  StyledHeader,
  AppLink,
  NavOptions,
  PlanModule,
  PlanStatus,
  PlanIcons,
  PlanTXDetail,
  PlanDetails,
  TXDetail,
  PlanName,
  PlanEditBox,
  LogoBG
} from "./header.styles";
import { Network, UserNetwork } from "@blockspaces/shared/models/networks";
import { NetworkCuratedResources, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { Cancel, RoundTrip, Check, Edit, NetworkIcon } from "@icons";
import { ResourcesDropdown } from "@endpoints/components/header/resources-drodown";
import { useGetConnectSubscription } from "@src/platform/hooks/user/queries";
import { ModalHeaderCloseWrapper } from "@src/platform/components/common/modal/styles";
import { BillingTier, BillingTierCode } from "@blockspaces/shared/models/network-catalog/Tier";
import { useGetSystemFlags } from "@src/platform/hooks/system-flags";

type Props = {
  network: Network;
  resources: NetworkCuratedResources;
  userNetworkData?: UserNetwork;
  leftView?: React.ReactNode;
};

export const Header = ({ network, resources, userNetworkData, leftView }: Props) => {
  const { data: systemFlags } = useGetSystemFlags();
  const router = useRouter();
  const { data: subscription } = useGetConnectSubscription();
  const theme: any = useTheme();
  const plan = subscription?.items?.filter((product) => product?.networkId === network._id && product.billingCategory.code === NetworkPriceBillingCodes.Infrastructure);
  const isFreeTier = (userNetworkData?.billingTier as BillingTier)?.code === BillingTierCode.Free;
  const planName = isFreeTier ? "Free" : plan ? plan[0]?.offer : ``;
  const { _id, name, chain, primaryColor, secondaryColor } = network;
  const networkBG = secondaryColor ? `linear-gradient(45deg, ${primaryColor} 10%, ${secondaryColor} 90%)` : primaryColor;

  const isLight = fontColorContrast(network.primaryColor, 0.8) === "#000000";
  const FREE_WEB3_ENDPOINT_TRANSACTIONS = systemFlags?.find((x) => x.FreeWeb3EndpointTransactionLimit)?.FreeWeb3EndpointTransactionLimit;
  const FORMATTED_FREE_WEB3_ENDPOINT_TRANSACTIONS = new Intl.NumberFormat().format(FREE_WEB3_ENDPOINT_TRANSACTIONS);
  function trimString(str: string): string {
    if (!str) return "";

    const words = str.split(" ");
    if (words.length >= 2) {
      return words.map((word) => word[0].toUpperCase()).join("");
    } else {
      return str.substring(0, 2);
    }
  }

  const blockExplorer = resources && resources.resources.find((resource) => resource.category === "Block Explorer" || "Network Explorer");
  const chainResources = resources && resources.resources.filter((resource) => resource.category !== "Block Explorer" || "Network Explorer");

  const _canCancel = () => {
    return !userNetworkData?.status;
  };

  return (
    <StyledHeader>
      <PlatformNavigation>
        <NavOptions side={"left"}></NavOptions>
        <NavOptions side={"right"}>
          <ModalHeaderCloseWrapper onClick={() => router.push("/connect")}>
            <Cancel />
          </ModalHeaderCloseWrapper>
        </NavOptions>
      </PlatformNavigation>
      <AppUtilities>
        {blockExplorer && (
          <Link legacyBehavior passHref href={blockExplorer.url || ""}>
            <AppLink target="_blank">{blockExplorer.category}</AppLink>
          </Link>
        )}
        {chainResources && chainResources.length > 0 && <ResourcesDropdown resources={chainResources} />}

        <LogoWrap>
          <LogoBG background={networkBG}>
            <NetworkIcon networkId={network._id} />
            {chain && (
              <ChainInitials background={networkBG} color={fontColorContrast(network.primaryColor, 0.8)}>
                {trimString(chain)}
              </ChainInitials>
            )}
          </LogoBG>
        </LogoWrap>
        <svg className="header-curved-border" viewBox="0 0 300 25">
          <ellipse cx="150" cy="60" rx="150" ry="75" fill="#FFFFFF" stroke="#f0f3ff" strokeWidth="1" />
        </svg>
      </AppUtilities>
      <AppMain>
        <AppModule>
          {leftView}
          {/* <TXTotalModule>
            <TXTotalLabel>Total TXs</TXTotalLabel>
            <TXTotalCount>{totalTXs}</TXTotalCount>
          </TXTotalModule> */}
        </AppModule>
        <AppName>
          <Name>{chain ? `${name} ${chain}` : name}</Name>
          <DividerBar />
        </AppName>
        <AppModule>
          <Link
            legacyBehavior
            href={_canCancel() ? { pathname: router.pathname, query: { nid: network._id, modal: "cancel-subscription", billingTier: (userNetworkData?.billingTier as BillingTier)?.code } } : "#"}
          >
            <PlanModule id="link-open-plan-overview-cancel">
              <PlanIcons>
                <PlanStatus background={isLight ? theme.bscBlue : networkBG}>
                  <Check />
                </PlanStatus>
                <PlanTXDetail networkColor={isLight ? theme.bscBlue : network.primaryColor}>
                  <RoundTrip />
                </PlanTXDetail>
              </PlanIcons>
              <PlanDetails>
                <PlanName>{planName} Plan</PlanName>
                <TXDetail>{isFreeTier ? FORMATTED_FREE_WEB3_ENDPOINT_TRANSACTIONS : "Unlimited"} TXs</TXDetail>
              </PlanDetails>
              <PlanEditBox>
                <Edit />
              </PlanEditBox>
            </PlanModule>
          </Link>
        </AppModule>
      </AppMain>
    </StyledHeader>
  );
};
