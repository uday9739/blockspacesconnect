import { NetworkId } from '@blockspaces/shared/models/networks/Network'
import { LightningUI } from '@lightning/routes/lightning-ui'
import { LightningReporterUI } from '@lightning/routes/lightning-reporter-ui';
import { PocketUI } from 'src/features/pocket/routes/pocket-ui';
import { EndpointsUI } from "src/features/endpoints/routes/endpoints-ui";

// TODO need generic landing , need way to templatize network landing pages, for example if network type is A use page type A
export const GetNetworkUiComponent = (networkId?: string) => {
  switch (networkId) {
    case NetworkId.LIGHTNING:
      return LightningUI;
    case NetworkId.LIGHTNING_REPORTER:
      return LightningReporterUI
    case NetworkId.POCKET:
      return PocketUI;
    default:
      // Default to Endpoints UI
      return EndpointsUI;
  }
}