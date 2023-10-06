import { observer } from 'mobx-react-lite';

import NodeSummaryStyles, {
  ActiveBar, SummaryBar, SummaryBody, SummaryCount, SummaryLabel, StatusBar,
} from './node-summary.styles';

import { Loading } from '@platform/common';
import { usePocketSummaryData } from '@pocket/queries';

const usePageData = () => {
  const { summaryData, summaryDataLoading, summaryDataError } = usePocketSummaryData()
  const nodeCountsTotal = summaryData?.userFleet.nodeCounts.total
  const needAttentionPct = (summaryData?.userFleet.nodeCounts.unhealthy / summaryData?.userFleet.nodeCounts.total) * 100
  const jailedPct = (summaryData?.userFleet.nodeCounts.jailed / summaryData?.userFleet.nodeCounts.total) * 100
  const offlinePct = (summaryData?.userFleet.nodeCounts.offline / summaryData?.userFleet.nodeCounts.total) * 100

  return {
    nodeCountsTotal,
    needAttentionPct,
    jailedPct,
    offlinePct,
    loading: summaryDataLoading,
    error: summaryDataError
  }
}

export const NodeSummary = observer(() => {
  const { nodeCountsTotal, needAttentionPct, loading } = usePageData()

  return (
    <NodeSummaryStyles>
      <SummaryBody>
        <SummaryLabel>NODE COUNT</SummaryLabel>
        <SummaryCount>
          <Loading when={loading}>{Intl.NumberFormat('en-US').format(nodeCountsTotal)}</Loading>
        </SummaryCount>
      </SummaryBody>
      <SummaryBar>
        <ActiveBar />
        {
          needAttentionPct > 0 && <StatusBar background="#F3BA2F" width={needAttentionPct} />
        }
        {/* { jailedPct > 0 && <StatusBar background="#E84142" width={jailedPct} /> } */}
        {/* { offlinePct > 0 && <StatusBar background="#323756" width={offlinePct} /> } */}
      </SummaryBar>
    </NodeSummaryStyles>
  );
});
