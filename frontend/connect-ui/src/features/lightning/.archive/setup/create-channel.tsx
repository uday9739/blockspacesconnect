import { Network } from '@blockspaces/shared/models/networks';
import React from 'react'
import CreateChannel, { Body, Title, Subtitle } from './styles/create-channel';


type Props = {
  network: Network
}

export default function LIGHTNING_CREATE_CHANNEL({ network }:Props) {
  return (
    <CreateChannel>
      <Body>
        <Title>CREATE YOUR FIRST CHANNEL</Title>
        <Subtitle>
          In order to send payments on the Lightning Network
          {' '}
          <br />
          you'll need to create at least one channel
        </Subtitle>
      </Body>
    </CreateChannel>
  );
}
