import React, { useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import {useWindowSize} from 'src/platform/hooks';
import { ObservableLightningNetwork } from 'src/features/lightning/api';
import LightningDemoUI, {
  Body, DemoBG, LeftPanel, Networks, Network, NetworkRow, RightPanel,
} from './styles/demo-ui';
import Activity from './activity';
import SuperChannel from './super-channel';
import Channels from './channels';
import Applications from './applications';

import LightningLogoCircle from './lightning-logo-circle';

type Props = {
  node: ObservableLightningNetwork,
}

const LIGHTNING_DEMO_UI = observer(({ node }: Props) => {
  const demoBG = useRef(null);
  const windowSize = useWindowSize();

  const networkDimensions = {
    width: `${3.5 * windowSize.rem}px`,
    height: `${3.5 * windowSize.rem}px`,
    margin: `${0.125 * windowSize.rem}px`,
  };

  const NetworkComponents = useMemo(() => {
    if (!demoBG.current) return [];

    const rows = Array(Math.ceil(demoBG.current.offsetHeight / (parseInt(networkDimensions.height) + (2 * parseInt(networkDimensions.margin))) + 2)).fill(null);
    const networksPerRow = Array(Math.ceil(demoBG.current.offsetWidth / (parseInt(networkDimensions.width) + (2 * parseInt(networkDimensions.margin))) + 2)).fill(null);
    return rows.map((_, i) => (
      <NetworkRow
        key={`Auth-Network-Row-${i}`}
        style={{
          minHeight: `${parseInt(networkDimensions.height) + 2 * parseInt(networkDimensions.margin)}px`,
          marginLeft: `-${i % 2 * (parseInt(networkDimensions.width) + parseInt(networkDimensions.margin))}px`,
        }}
      >
        {networksPerRow.map((_, k) => {
          let glowType;
          const animationDuration = 5;
          const animationRandomness = Math.ceil(Math.random() * 100);
          if (animationRandomness > 97) glowType = 'a';
          else if (animationRandomness > 92) glowType = 'b';
          else if (animationRandomness > 84) glowType = 'c';

          return (
            <Network
              key={`Auth-Network-Icon-${i}-${k}`}
              data-glow-type={glowType}
              style={networkDimensions}
            >
              <LightningLogoCircle style={{
                animationDuration: `${animationDuration}s`,
                animationDelay: `${Math.random() * animationDuration - animationDuration}s`,
              }}
              />
            </Network>
          );
        })}

      </NetworkRow>
    ));
  }, [demoBG.current, windowSize]);

  const nodeBalanceInfo = {
    local: Number(node.nodeBalance.local_balance.sat),
    remote: Number(node.nodeBalance.remote_balance.sat),
    localRatio: ((node.nodeBalance.local_balance.sat / 1000000) / ((node.nodeBalance.balance / 1000000) + (node.nodeBalance.remote_balance.sat / 1000000))) * 100,
    remoteRatio: ((node.nodeBalance.remote_balance.sat / 1000000) / ((node.nodeBalance.balance / 1000000) + (node.nodeBalance.remote_balance.sat / 1000000))) * 100,
  };

  return (
    <LightningDemoUI ref={demoBG}>
      <Body>
        <LeftPanel>
          <Activity node={node} />
        </LeftPanel>
        <RightPanel>
          <SuperChannel balance={nodeBalanceInfo} />
          <Channels />
          <Applications />
        </RightPanel>
      </Body>
      <DemoBG>
        <Networks>
          {NetworkComponents}
        </Networks>
      </DemoBG>
    </LightningDemoUI>
  );
});

export default LIGHTNING_DEMO_UI;
