import { observer } from "mobx-react-lite";
import { Suspense, useEffect, useState } from "react";
import { Title, Button } from "@platform/common";
import WelcomeIntro, { ButtonWrap, Subtitle } from "./styles/welcome-intro.styles";
import IntroGraphic from "./intro-graphic";

export type WelcomeIntroProps = {
  /** called when the Continue button is pressed */
  onContinue?: () => void;
};

const WELCOME_INTRO = observer(({ onContinue }: WelcomeIntroProps) => {
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => setFadeIn(true), []);

  return (
    <Suspense>
      <WelcomeIntro visible={fadeIn} id="welcome-intro-container">
        <Title label="Welcome to BlockSpaces" style="intro" />
        <Subtitle>
          The easy way to <em>Connect</em> & <em>Integrate</em> with Blockchain Networks
        </Subtitle>
        <IntroGraphic style={{ width: "100%" }} />
        <ButtonWrap>
          <Button id="btnWelcomeIntro" label="CONTINUE" width="26rem" onClick={onContinue} customStyle={{ zIndex: 10, marginTop: "-3.75rem" }} />
        </ButtonWrap>
      </WelcomeIntro>
    </Suspense>
  );
});

export default WELCOME_INTRO;
