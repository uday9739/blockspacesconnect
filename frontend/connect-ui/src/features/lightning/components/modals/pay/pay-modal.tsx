import { useState } from "react";

import { ModalContainer, TitleContainer, PayTitle } from "./pay-modal.styles"
import { PayToggle } from "./pay-toggle";
import { LightningRequest } from "./lightning-request";
import { WithdrawBitcoin } from "./withdraw-bitcoin";


export const PayModal = () => {

  const [toggleLightning, setToggleLightning] = useState(true);

  return (
    <ModalContainer id="pay-modal">
      <TitleContainer>
        <PayTitle>Send Money</PayTitle>
        <PayToggle toggleLightning={toggleLightning} setToggleLightning={setToggleLightning} />
      </TitleContainer>
      {toggleLightning ? <LightningRequest /> : <WithdrawBitcoin /> }
    </ModalContainer>
  )
}