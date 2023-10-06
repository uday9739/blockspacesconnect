import React from 'react'
import { ObservableLightningNetwork, LightningStatus } from 'src/features/lightning/api'
import Lightning, { SectionHeader, Icon, Label, Node, SetupProgress, Step } from './styles/lightning'
import { observer } from 'mobx-react-lite'
import { Icons} from 'src/platform/components';
import AddCredential from './add-credential'
import Syncing from './syncing'
import CreateChannel from './create-channel'
import FundWallet from './fund-wallet'

const { Bolt, Check, Key, NewBlockflow, Sync } = Icons;
type Props = {
  network: ObservableLightningNetwork
}

const LIGHTNING = observer(({ network }: Props) => {
  const { status } = network


  if (status === LightningStatus.SYNCING) {
    return (
      <Lightning>
        <SectionHeader>INITIAL SETUP</SectionHeader>
        <Syncing network={network} />
        <SetupProgress>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Check />
              </Icon>
            </Node>
            <Label>
              GENERATE <br />
              CREDENTIALS
            </Label>
          </Step>
          <Step data-active-step data-touched-setup-step>
            <Node>
              <Icon>
                <Sync />
              </Icon>
            </Node>
            <Label>
              SYNC TO <br />
              NETWORK
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              FUND <br />
              WALLET
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              CREATE <br />
              CHANNEL
            </Label>
          </Step>
        </SetupProgress>
      </Lightning>
    )
  }

  if (status === LightningStatus.FUNDING_WALLET) {
    return (
      <Lightning>
        <SectionHeader>INITIAL SETUP</SectionHeader>
        <FundWallet network={network} />
        <SetupProgress>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Check />
              </Icon>
            </Node>
            <Label>
              GENERATE <br />
              CREDENTIALS
            </Label>
          </Step>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Check />
              </Icon>
            </Node>
            <Label>
              SYNC TO <br />
              NETWORK
            </Label>
          </Step>
          <Step data-active-step data-touched-setup-step>
            <Node>
              <Icon>
                <Bolt />
              </Icon>
            </Node>
            <Label>
              FUND <br />
              WALLET
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              CREATE <br />
              CHANNEL
            </Label>
          </Step>
        </SetupProgress>
      </Lightning>
    )
  }

  if (status === LightningStatus.CREATING_CHANNEL) {
    return (
      <Lightning>
        <SectionHeader>INITIAL SETUP</SectionHeader>
        <CreateChannel network={network} />
        <SetupProgress>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Check />
              </Icon>
            </Node>
            <Label>
              GENERATE <br />
              CREDENTIALS
            </Label>
          </Step>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Check />
              </Icon>
            </Node>
            <Label>
              SYNC TO <br />
              NETWORK
            </Label>
          </Step>
          <Step data-touched-setup-step>
            <Node>
              <Icon>
                <Bolt />
              </Icon>
            </Node>
            <Label>
              FUND <br />
              WALLET
            </Label>
          </Step>
          <Step data-active-step data-touched-setup-step>
            <Node>
              <Icon>
                <NewBlockflow />
              </Icon>
            </Node>
            <Label>
              CREATE <br />
              CHANNEL
            </Label>
          </Step>
        </SetupProgress>
      </Lightning>
    )
  }
  if (true) {
    return (
      <Lightning>
        <SectionHeader>INITIAL SETUP</SectionHeader>
        <AddCredential network={network} />
        <SetupProgress>
          <Step data-active-step data-touched-setup-step>
            <Node>
              <Icon>
                <Key />
              </Icon>
            </Node>
            <Label>
              GENERATE <br />
              CREDENTIALS
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              SYNC TO <br />
              NETWORK
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              FUND <br />
              WALLET
            </Label>
          </Step>
          <Step>
            <Node>
              <Icon />
            </Node>
            <Label>
              CREATE <br />
              CHANNEL
            </Label>
          </Step>
        </SetupProgress>
      </Lightning>
    )
  }

  return <Lightning />
})

export default LIGHTNING
