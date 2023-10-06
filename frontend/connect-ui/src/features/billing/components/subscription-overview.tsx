import { NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog";
import { Box, Button, Chip, Grid, Tooltip, Typography } from "@mui/material";
import { Loading } from "@src/platform/components/common";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { BillingSection, BillingSectionBody, BillingSectionHeader, BillingSectionTitle, PillContainer } from "./billing-section";
import BoltIcon from "@mui/icons-material/Bolt";
import HardwareIcon from "@mui/icons-material/Hardware";
import { useNetworkCatalog } from "@src/platform/hooks/network-catalog/queries";
import { AppLogoBG } from "@src/platform/components/cancel-subscription//cancel-subscription.styles";
import { Cancel, NetworkIcon, Plus } from "@src/platform/components";
import { ConnectSubscriptionItemStatus, ConnectSubscriptionRecurrence, ConnectSubscriptionStatus } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { ConnectSubscriptionExpandedDto, ConnectSubscriptionItemExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto";
import { useRouter } from "next/router";
import { Network, NetworkId, UserNetworkStatus } from "@blockspaces/shared/models/networks";
import InfoIcon from "@mui/icons-material/Info";
import Link from "next/link";
import * as utils from "../utils";
import AddIcon from "@mui/icons-material/Add";
import { _getShortHandRecurrence } from "@src/platform/utils/connect-subscription";
import { useGetUserNetworks, useIsUserFeatureEnabled } from "@src/platform/hooks/user/queries";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";
import { ChainInitials } from "@src/platform/routes/networks/app-launcher.styles";
import fontColorContrast from "font-color-contrast";
import { trimString } from "@src/platform/routes/networks/app-launcher";
import { ModalHeaderCloseWrapper } from "@src/platform/components/common/modal/styles";

type SubscriptionOverviewProps = { connectSubscription: ConnectSubscriptionExpandedDto };
export const SubscriptionOverview = ({ connectSubscription }: SubscriptionOverviewProps) => {
  const { getNetwork, catalogLoading } = useNetworkCatalog();
  const router = useRouter();
  // handle loading
  if (!connectSubscription || catalogLoading)
    return (
      <BillingSection>
        <Loading when={catalogLoading}></Loading>
      </BillingSection>
    );
  return (
    <BillingSection>
      <BillingSectionHeader>
        <BillingSectionTitle> Connect Subscription Details</BillingSectionTitle>
        <ModalHeaderCloseWrapper style={{ alignSelf: "center", marginRight: "10px" }} onClick={() => router.back()}>
          <Cancel />
        </ModalHeaderCloseWrapper>
      </BillingSectionHeader>
      <BillingSectionBody>
        <Grid container>
          {/* Left */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              "& .MuiGrid-root": { marginBottom: "10px" }
            }}
          >
            <ConnectSubscriptionOverview connectSubscription={connectSubscription} />
          </Grid>
          {/* Right */}
          <Grid item xs={12} sm={8} sx={{ flexDirection: "row", display: "flex", padding: "10px" }}>
            <ConnectSubscriptionServices connectSubscription={connectSubscription} getNetwork={getNetwork} />
          </Grid>
        </Grid>
      </BillingSectionBody>
    </BillingSection>
  );
};

type ItemStatusProps = { status: string; prepend?: string };
const ItemStatus = ({ status, prepend }: ItemStatusProps) => {
  const _prepend = prepend ? prepend : "";
  switch (status) {
    case ConnectSubscriptionItemStatus.PendingCancelation:
      return <Chip label={`${_prepend}Pending`} color="warning" size="small" variant="outlined" sx={{ marginTop: "3px" }} />;
    default:
      return <Chip label={`${_prepend}Active`} color="success" size="small" variant="outlined" sx={{ marginTop: "3px" }} />;
  }
};

type SubscriptionStatusChipProps = { connectSubscription: ConnectSubscriptionExpandedDto };
const SubscriptionStatusChip = ({ connectSubscription }: SubscriptionStatusChipProps) => {
  const itemsPendingCancelation = connectSubscription?.items?.filter((x) => x.statusOverride === ConnectSubscriptionItemStatus.PendingCancelation);
  const cancelingOverride = itemsPendingCancelation?.length === connectSubscription?.items?.length;
  const status = cancelingOverride ? ConnectSubscriptionStatus.PendingCancelation : connectSubscription?.status;
  switch (status) {
    case ConnectSubscriptionStatus.Active:
      return <Chip id="ConnectSubscriptionStatusActive" label="Active" color="success" size="small" sx={{ marginTop: "3px" }} />;
    case ConnectSubscriptionStatus.PendingCancelation:
      return <Chip id="ConnectSubscriptionStatusCancelationRequested" label="Cancelation Requested" color="warning" size="small" sx={{ marginTop: "3px" }} />;
    default:
      return <></>;
  }
};

const ConnectSubscriptionOverview = ({ connectSubscription }) => {
  const isInactive = connectSubscription?.status === ConnectSubscriptionStatus.Inactive;
  if (isInactive)
    return (
      <Box sx={{ padding: "10px" }}>
        <h1> Welcome to Blockspaces Connect.</h1>
        <br />
        <Typography>Empowering any developer to easily integrate Web3 payments and protocols into existing business systems.</Typography>
        <Link legacyBehavior href={"/connect?modal=add-app"}>
          <Button id="btnGetStartedToday" variant="contained" color="primary" sx={{ float: "right", marginTop: "25px" }}>
            Get Started Today
          </Button>
        </Link>
      </Box>
    );
  return (
    <Grid container sx={{ padding: "10px" }}>
      {/*Status  */}
      <Grid item xs={6}>
        <b>Status</b>
      </Grid>
      <Grid item xs={6}>
        <SubscriptionStatusChip connectSubscription={connectSubscription} />
      </Grid>
      {/* Current Period Start */}
      <Grid item xs={6}>
        <b>Period Start</b>
      </Grid>
      <Grid item xs={6}>
        {utils._getUiDate(connectSubscription?.currentPeriod?.billingStart * 1000)}
      </Grid>
      {/* Current Period End */}
      <Grid item xs={6}>
        <b>Period End</b>
      </Grid>
      <Grid item xs={6}>
        {utils._getUiDate(connectSubscription?.currentPeriod?.billingEnd * 1000)}
      </Grid>
    </Grid>
  );
};

const ConnectSubscriptionServices = ({ connectSubscription, getNetwork }) => {
  const isUserFeatureEnabled = useIsUserFeatureEnabled();
  const isLightningSelfServiceCancelUserFeatureEnabled = isUserFeatureEnabled(FeatureFlags.lightningSelfServiceCancel) === true;
  const router = useRouter();
  const { data: userNetworks } = useGetUserNetworks();
  const isInactive = connectSubscription?.status === ConnectSubscriptionStatus.Inactive;
  const lightingNetworkData = getNetwork(NetworkId.LIGHTNING);
  const bipItems = connectSubscription?.items?.filter((x) => x.networkId === NetworkId.LIGHTNING && x.billingCategory?.code === NetworkPriceBillingCodes.MultiWebApp);
  const isBIPPendingCancelation = userNetworks?.find((x) => x.networkId === NetworkId.LIGHTNING && (x.billingCategory as any)?.code === NetworkPriceBillingCodes.MultiWebApp)?.status === UserNetworkStatus.PendingCancelation;
  const infrastructureItems = connectSubscription?.items?.filter((x) => x.billingCategory?.code === NetworkPriceBillingCodes.Infrastructure);
  const infrastructureItemsByNetwork = infrastructureItems?.reduce((results: { [key: string]: { network: string; statusOverride?: string; items: ConnectSubscriptionItemExpandedDto[] } }, item) => {
    if (!results[item.networkId]) {
      results[item.networkId] = {
        network: item.networkId,
        statusOverride: item.statusOverride,
        items: []
      };
    }
    results[item.networkId].items.push(item);
    return results;
  }, {});
  const infrastructureNetworks = Object.keys(infrastructureItemsByNetwork || {});
  const _cancelNetwork = (networkId: string, statusOverride: string, billingTierCode: string) => {
    if (statusOverride === ConnectSubscriptionItemStatus.PendingCancelation) return;
    router.push({ pathname: router.pathname, query: { nid: networkId, modal: "cancel-subscription", onComplete: "back", billingTier: billingTierCode } });
  };
  return (
    <Box sx={{ width: "100%" }}>
      {/* Lightning*/}
      <PillContainer id="lightning" style={{ justifyContent: "space-between" }}>
        {/* Icon */}
        <Box sx={{ display: "flex", alignItems: "center", alignSelf: "center", padding: "5px", marginRight: "10px" }}>
          <BoltIcon fontSize="large" color="primary" />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <b>Lightning</b>
            <small>{lightingNetworkData?.name}</small>
          </Box>
        </Box>
        {/* Handle In-Active*/}
        {isInactive === true && isBIPPendingCancelation === false ? (
          <Box style={{ alignSelf: "center" }}>
            <Link href={`/connect?modal=add-app&autoInit=lightning`} legacyBehavior>
              <Button variant="outlined" color="primary" id="add-lightning">
                <AddIcon />
                Start Collecting Bitcoin Payments Today
              </Button>
            </Link>
          </Box>
        ) : null}
        {/* Handle Pending Cancelation*/}
        {isBIPPendingCancelation === true ? (
          <>
            <ItemStatus status={ConnectSubscriptionItemStatus.PendingCancelation} prepend={`Status:`} />
          </>
        ) : null}
        {/* Handle Active with no lightning Items*/}
        {isInactive === false && bipItems?.length === 0 && isBIPPendingCancelation === false ? (
          <Box style={{ alignSelf: "center" }}>
            <Link href={`/connect?modal=add-app&autoInit=lightning`} legacyBehavior>
              <Button variant="outlined" color="primary" id="add-lightning">
                <AddIcon />
                Start Collecting Bitcoin Payments Today
              </Button>
            </Link>
          </Box>
        ) : null}
        {/* Handle Active with  lightning Items*/}
        {isInactive === false && bipItems?.length > 0 ? (
          <>
            {/* Price/Plan Details */}
            <Box sx={{ margin: "auto" }}>
              <Box sx={{ display: "flex" }}>
                <b>{bipItems[0].offer} </b>
                <Tooltip
                  title={
                    <Box>
                      {bipItems
                        .filter((x) => !x.isMetered)
                        .map((item, key) => {
                          return (
                            <Box key={key}>
                              {item.displayName} @ ${item.unitAmount}
                            </Box>
                          );
                        })}
                      <b> Tx based fees</b>
                      {bipItems
                        .filter((x) => x.isMetered)
                        .map((item, key) => {
                          return <Box key={key}>{item.displayName}</Box>;
                        })}
                    </Box>
                  }
                >
                  <InfoIcon fontSize="small" />
                </Tooltip>
              </Box>
              <Typography fontFamily={"'Roboto Mono', monospace"}>
                <Tooltip
                  title={
                    <Box>
                      {bipItems
                        .filter((x) => !x.isMetered)
                        .map((item, key) => {
                          return (
                            <Box key={key}>
                              {item.displayName} @ ${item.unitAmount}
                            </Box>
                          );
                        })}
                    </Box>
                  }
                >
                  <span style={{ cursor: "pointer" }}>
                    {" "}
                    {utils._getNetworkPrice(bipItems)} / {_getShortHandRecurrence(bipItems[0].recurrence)} +
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    <Box>
                      {bipItems
                        .filter((x) => x.isMetered)
                        .map((item, key) => {
                          return <Box key={key}>{item.displayName}</Box>;
                        })}
                    </Box>
                  }
                >
                  <span style={{ cursor: "pointer" }}> tx fee</span>
                </Tooltip>
              </Typography>
            </Box>
            {/* Actions */}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ alignSelf: "flex-end" }}>
                <ItemStatus status={bipItems[0].statusOverride} prepend={`Status:`} />
              </Box>
              <br />
              {!isBIPPendingCancelation && isLightningSelfServiceCancelUserFeatureEnabled === true ? (
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "initial" }}
                  onClick={() => _cancelNetwork(bipItems[0].networkId, bipItems[0].statusOverride, bipItems[0].userNetwork?.billingTier?.code)}
                >
                  Request Cancellation
                </Button>
              ) : null}
            </Box>
          </>
        ) : null}
      </PillContainer>

      {/* Infrastructure */}
      <PillContainer id="developer-endpoints">
        {/* Icon */}
        <Box sx={{ display: "flex", alignItems: "center", alignSelf: "center", padding: "5px", marginRight: "10px" }}>
          <HardwareIcon fontSize="large" color="primary" />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <b>Infrastructure</b>
            <small>Connect Web2 & Web3</small>
          </Box>
        </Box>
        {/* Handle In-Active*/}
        {isInactive === true ? (
          <Box style={{ display: "flex", width: "100%", height: "100%", margin: "auto", justifyContent: "end" }}>
            <Link href={`/connect?modal=add-app`} legacyBehavior>
              <Button variant="outlined" color="primary" id="add-endpoints">
                <AddIcon />
                Start Building today
              </Button>
            </Link>
          </Box>
        ) : null}
        {/* Handle Active with no endpoint Items*/}
        {isInactive === false && infrastructureNetworks?.length === 0 ? (
          <Box style={{ display: "flex", width: "100%", height: "100%", margin: "auto", justifyContent: "end" }}>
            <Link href={`/connect?modal=add-app`} legacyBehavior>
              <Button variant="outlined" color="primary" id="add-endpoints">
                <AddIcon />
                Start Building today
              </Button>
            </Link>
          </Box>
        ) : null}
        {isInactive === false && infrastructureNetworks?.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", width: "100%", justifyContent: "end" }}>
            {/* Selected Networks */}
            {infrastructureNetworks.map((networkId, key) => {
              const data = infrastructureItemsByNetwork[networkId];
              const network = getNetwork(networkId);
              const background = network?.secondaryColor ? `linear-gradient(45deg, ${network?.primaryColor} 10%, ${network?.secondaryColor} 90%)` : network?.primaryColor;
              return (
                <Box id={`${networkId}-${data?.statusOverride || "active"}`} key={key} sx={{ display: "flex", flexDirection: "column", marginBottom: "7px", marginRight: "7px" }}>
                  <span id={`${networkId}-wrapper`} style={{ cursor: "pointer" }} onClick={() => _cancelNetwork(data.network, data.statusOverride, data.items[0].userNetwork?.billingTier?.code)}>
                    <Tooltip title={`${utils._getNetworkServiceToolTip(network, data.statusOverride)}`}>
                      <AppLogoBG background={background}>
                        <NetworkIcon networkId={networkId} />
                        {network.chain && (
                          <ChainInitials
                            style={{
                              transform: "none"
                            }}
                            background={background}
                            color={fontColorContrast(network.primaryColor, 0.8)}
                          >
                            {trimString(network.chain)}
                          </ChainInitials>
                        )}
                      </AppLogoBG>
                    </Tooltip>
                  </span>
                  <ItemStatus status={data?.statusOverride} />
                </Box>
              );
            })}
          </Box>
        ) : null}
      </PillContainer>
    </Box>
  );
};
