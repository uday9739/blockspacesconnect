import React from 'react';
import { observer } from 'mobx-react-lite';
import SuperChannel, {
  AvailableWrap, ChannelSummary, ChannelSummaryBG, Label, Quantity, ConversionAmt, SectionTitle, AutoBalanceSummary, AutoBalanceLabel, AutoBalanceSummaryLabel, AutoBalance, AutoBalanceQuantity, AutoBalanceConversionAmt,
} from './styles/super-channel';

type Balance = {
    local: number,
    remote: number,
    localRatio: number,
    remoteRatio: number
}
type Props = {
    balance:Balance
}
const SUPER_CHANNEL = observer(({ balance }:Props) => (
  <SuperChannel>
    <SectionTitle>
      SUPER CHANNEL
    </SectionTitle>
    <ChannelSummary>
      <AvailableWrap style={{ borderColor: '#7b1af7' }}>
        <Label>AVAILABLE SEND</Label>
        <Quantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat('en-US').format(balance.local)}
        </Quantity>
        <ConversionAmt>
          ~$
          {Intl.NumberFormat('en-US').format(Math.floor(balance.local / 100000000 * 43902))}
        </ConversionAmt>
      </AvailableWrap>
      <AvailableWrap style={{ borderColor: '#be1bf7' }}>
        <Label>AVAILABLE RECEIVE</Label>
        <Quantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat('en-US').format(balance.remote)}
        </Quantity>
        <ConversionAmt>
          ~$
          {Intl.NumberFormat('en-US').format(Math.floor(balance.remote / 100000000 * 43902))}
        </ConversionAmt>
      </AvailableWrap>
      <ChannelSummaryBG src="/images/channel-summary-bg.png" />
    </ChannelSummary>
    <AutoBalanceSummary>
      <AutoBalanceSummaryLabel>
        AUTO-BALANCE SETTINGS
      </AutoBalanceSummaryLabel>
      <AutoBalance data-type="SEND">
        <AutoBalanceLabel>
          MIN SEND CAPACITY
        </AutoBalanceLabel>
        <AutoBalanceQuantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat('en-US').format(10000000)}
        </AutoBalanceQuantity>
        <AutoBalanceConversionAmt>
          ~$
          {Intl.NumberFormat('en-US').format(Math.floor(10000000 / 100000000 * 43902))}
        </AutoBalanceConversionAmt>
      </AutoBalance>
      <AutoBalance data-type="SEND">
        <AutoBalanceLabel>
          MAX SEND CAPACITY
        </AutoBalanceLabel>
        <AutoBalanceQuantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat('en-US').format(100000000)}
        </AutoBalanceQuantity>
        <AutoBalanceConversionAmt>
          ~$
          {Intl.NumberFormat('en-US').format(Math.floor(100000000 / 100000000 * 43902))}
        </AutoBalanceConversionAmt>
      </AutoBalance>
      <AutoBalance data-type="RECEIVE">
        <AutoBalanceLabel>
          MIN RECEIVE CAPACITY
        </AutoBalanceLabel>
        <AutoBalanceQuantity>
          <span className="fak fa-satoshisymbol-solidtilt" />
          {Intl.NumberFormat('en-US').format(15000000)}
        </AutoBalanceQuantity>
        <AutoBalanceConversionAmt>
          ~$
          {Intl.NumberFormat('en-US').format(Math.floor(15000000 / 100000000 * 43902))}
        </AutoBalanceConversionAmt>
      </AutoBalance>
    </AutoBalanceSummary>
  </SuperChannel>
));

export default SUPER_CHANNEL;
