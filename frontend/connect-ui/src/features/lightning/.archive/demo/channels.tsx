import React from 'react';

import Channels, {
  Detail, SectionTitle, AvailableWrap, Label, Quantity, ConversionAmt,
} from './styles/channels';

function CHANNELS() {
  return (
    <Channels>
      <SectionTitle>
        OTHER CHANNELS
      </SectionTitle>
      <Detail>
        <AvailableWrap style={{
          width: '8rem',
          border: '1px dashed #290b51',
        }}
        >
          <Label>ACTIVE</Label>
          <Quantity>
            0
          </Quantity>
          <ConversionAmt />
        </AvailableWrap>
        <AvailableWrap style={{ borderColor: '#7B1AF7' }}>
          <Label>AVAILABLE SEND</Label>
          <Quantity>
            <span className="fak fa-satoshisymbol-solidtilt" />
            0
          </Quantity>
          <ConversionAmt />
        </AvailableWrap>
        <AvailableWrap style={{ borderColor: '#B51AF8' }}>
          <Label>AVAILABLE RECEIVE</Label>
          <Quantity>
            <span className="fak fa-satoshisymbol-solidtilt" />
            0
          </Quantity>
          <ConversionAmt />
        </AvailableWrap>
        <AvailableWrap style={{ width: '8rem', border: '1px dashed #290b51' }} />

      </Detail>
    </Channels>
  );
}

export default CHANNELS;
