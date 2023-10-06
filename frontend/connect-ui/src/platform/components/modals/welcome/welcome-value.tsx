import { observer } from 'mobx-react-lite';
import { Suspense, useEffect, useState } from 'react';
import { Title, Button } from "@platform/common";

import WelcomeValue, { ListItem, ListLabel, ListTitle, TagLine, ValueProp, ValueSummary, ValueTitle, ValueWrap } from './styles/welcome-value.styles';

export type WelcomeValueProps = {
  /** called when the Continue button is pressed */
  onContinue?: () => void;
};

const WELCOME_VALUE = observer(({ onContinue }: WelcomeValueProps) => {
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => setFadeIn(true), []);

  return (
    <Suspense>
      <WelcomeValue visible={fadeIn}>
        <Title label="The BlockSpaces Advantage" style="intro" />
        <ValueWrap>
          <ValueProp>
            <ValueTitle>Connect</ValueTitle>
            <TagLine>
              Simple & reliable network <br />
              provisioning & configuration
            </TagLine>
            <ListTitle>Connect to blockchain networks in minutes</ListTitle>
            <ListLabel>BUILT FOR</ListLabel>
            <ListItem>Developers</ListItem>
            <ListItem>Investors</ListItem>
            <ListItem>Businesses</ListItem>
            <ValueSummary>
              Spin up blockchain infrastructure <br />
              And unlock its potential via our intuitive interfaces
            </ValueSummary>
          </ValueProp>
          <ValueProp>
            <ValueTitle>Integrate</ValueTitle>
            <TagLine>
              Powerful no-code <br />
              integration platform
            </TagLine>
            <ListTitle>Integrate blockchain into your business systems</ListTitle>
            <ListLabel>COMPATIBLE WITH</ListLabel>
            <ListItem>ERPs</ListItem>
            <ListItem>CRMs</ListItem>
            <ListItem>Accounting Software</ListItem>
            <ValueSummary>
              Take your blockchain infrastructure <br />
              and make it useful via our no-code integration tools
            </ValueSummary>
          </ValueProp>
        </ValueWrap>
        <Button id="btnWelcomeValue" label="GET STARTED" width="26rem" onClick={onContinue} />
        </WelcomeValue>
      </Suspense>
  );
});

export default WELCOME_VALUE;
