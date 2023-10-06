// framework
import React from "react";
import { useRouter } from "next/router";
// 3rd party
import { observer } from "mobx-react-lite";
// app code
import PocketUIProvider from "@pocket/providers";
import { Network } from "@platform/routes/networks/network/network";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { NavOption, NetworkHeader } from "@platform/dashboards";
import { Overview, RelayDashboard, PoktSummary, NodeSummary } from "@pocket/components";
import { NetworkId } from "@blockspaces/shared/models/networks";
import { useNetworkData } from "@endpoints/queries";

export type UIProps = {
  networkId?: string;
};

export const PocketUI = observer((props: UIProps) => {
  const { network } = useNetworkData(NetworkId.POCKET);

  const router = useRouter();

  const navOptions: NavOption[] = [
    {
      label: "PERFORMANCE",
      onClick: () => router.pathname === "/infrastructure/[nid]" && router.push("/infrastructure/pocket"),
      selected: router.pathname === "/infrastructure/[nid]"
    }
  ];

  return (
    <PocketUIProvider>
      <Network id={"pocket-network-container"}>
        <NetworkHeader slotLL={<PoktSummary />} slotLR={<NodeSummary />} network={network} navOptions={navOptions} />
        <Overview />
        <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
          <RelayDashboard />
        </ErrorBoundaryPlus>
      </Network>
    </PocketUIProvider>
  );
});
