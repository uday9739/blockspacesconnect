import React, { useEffect, useState } from 'react';
import { type ObservableLightningNetwork, LightningStatus } from 'src/features/lightning/api';
import Syncing, {
  Body, Title, Subtitle, SyncProgress, ProgressBarWrap, ProgressBar, ProgressPCT, Continue,
} from './styles/syncing';

type Props = {
  network: ObservableLightningNetwork
}

export default function LIGHTNING_SYNCING({ network }: Props) {
  const [syncProgress, setSyncProgress] = useState(12);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      const newSyncPCT = syncProgress + 4 + Math.ceil(Math.random() * 10);
      setSyncProgress(Math.min(newSyncPCT, 100));
    }, 1000);
    return () => clearInterval(syncInterval);
  }, [syncProgress]);

  return (
    <Syncing>
      <Body>
        <Title>SYNCING NODE</Title>
        <Subtitle>{syncProgress === 100 ? 'Syncing Complete!' : 'Syncing your node to the network'}</Subtitle>
        <SyncProgress>

          {syncProgress === 100
            ? <Continue onClick={() => network.setStatus(LightningStatus.FUNDING_WALLET)}>CONTINUE</Continue>
            : (
              <>
                <ProgressBarWrap>
                  <ProgressBar style={{ width: `${syncProgress}%` }} />
                </ProgressBarWrap>
                <ProgressPCT>
                  {syncProgress}
                  %
                </ProgressPCT>
              </>
            )}

        </SyncProgress>
      </Body>

    </Syncing>
  );
}
