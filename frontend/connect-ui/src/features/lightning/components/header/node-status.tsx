import { Styles } from "./superchannel.styles";

import { Loading, Tooltip } from "@platform/common";
import { useExternalHeyHowAreYa, useHeyhowareya, useNodeDoc } from "@lightning/queries";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { ExternalLightningOnboardingStep, LightningOnboardingStep } from "@blockspaces/shared/models/lightning/Node";
import { isExternalNode } from "@lightning/utils/node";
import { Network } from "@blockspaces/shared/models/networks";

type PageData = {
  nodeHealth: ApiResult<LightningOnboardingStep | ExternalLightningOnboardingStep>,
  loading: boolean,
  error: any
}

const usePageData = (): PageData => {
  const { nodeDoc } = useNodeDoc()
  const isExternal = isExternalNode(nodeDoc?.data);
  const { nodeHealth, nodeHealthLoading, nodeHealthError } = useHeyhowareya()
  const { data: externalNodeHealth, isLoading: externalNodeHealthLoading, error: externalNodeHealthError } = useExternalHeyHowAreYa()


  return {
    nodeHealth: isExternal ? externalNodeHealth : nodeHealth,
    loading: nodeHealthLoading || externalNodeHealthLoading,
    error: nodeHealthError || externalNodeHealthError
  }
}

export const NodeStatus = ({ color }: { color: string }) => {
  const { Superchannel, SuperchannelBody, SuperchannelLabel, SuperchannelInfo, IconWrap, Icon, SummaryBar, ActiveBar, StatusBar } = Styles;

  const { nodeHealth, loading } = usePageData()
  // const inactivePct = (nodeInfo?.data.num_inactive_channels / (nodeInfo?.data.num_active_channels + nodeInfo?.data.num_inactive_channels)) * 100;

  return (
    <Superchannel>
      <SuperchannelBody>
        <SuperchannelLabel>ACCOUNT STATUS</SuperchannelLabel>
        <Tooltip placement="bottom" content={nodeStatusTooltip(nodeHealth?.data)}>
          <SuperchannelInfo id="lblSuperchannelInfo">
            <Loading when={loading}>{nodeHealth?.data}</Loading>
          </SuperchannelInfo>
        </Tooltip>
      </SuperchannelBody>
      <SummaryBar>
        <ActiveBar color={color} />
        {/* {inactivePct > 0 && <StatusBar background="#D8DCF0" width={inactivePct} />} */}
      </SummaryBar>
    </Superchannel>
  );
};

const nodeStatusTooltip = (nodeHealth: LightningOnboardingStep | ExternalLightningOnboardingStep): string => {
  switch (nodeHealth) {
    case LightningOnboardingStep.NoInboundChannelOpened:
      return "We have not opened an automatic inbound channel yet. You will not be able to receive payments until we do.";
    case LightningOnboardingStep.NoPeers:
      return "The node is not connected to the network. Please wait until it connects."
    case LightningOnboardingStep.InboundChannelOpening:
      return "We are opening an automatic inbound channel. Please give it up to 1 hour."
    case LightningOnboardingStep.NotSyncedToGraph:
      return "The node is syncing with the Lightning network. Please give it up to one day."
    case LightningOnboardingStep.ImDoingGood:
      return "The node is connected to the network and synced. You can start sending & receiving payments."
    case ExternalLightningOnboardingStep.MacHasWrongPermission:
      return "The macaroon you provided does not have the correct permissions. Please provide a read-only macaroon."
    default:
      return "The status of your node."
  }
}
