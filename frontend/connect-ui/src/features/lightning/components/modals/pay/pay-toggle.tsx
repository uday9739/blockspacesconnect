import { Row } from "./pay-modal.styles";
import { Button, Tooltip } from "@platform/common"
import { BoltUp, BoltUpFilled, BtcMinus, BtcMinusFilled } from "@icons";
import { useIsUserFeatureEnabled } from "@src/platform/hooks/user/queries";
import { FeatureFlags } from "@blockspaces/shared/models/feature-flags/FeatureFlags";

export const PayToggle = (props: {toggleLightning: boolean, setToggleLightning}) => {
  const enabled = useIsUserFeatureEnabled()
  const withdrawEnabled = enabled(FeatureFlags.withdrawBitcoin)
  
  return (
    <Row gap={'3.5rem'}>
      <Tooltip placement="bottom" content={'Send a payment over the Lightning Network.'}>
        <Button 
          label="PAY INVOICE" type="toggle" selected={props.toggleLightning}
          variation='toggle' width="16rem" onClick={() => props.setToggleLightning(true)}
          icon={ props.toggleLightning ? <BoltUp /> : <BoltUpFilled /> }
        />
      </Tooltip>
      <Tooltip placement="bottom" content={withdrawEnabled ? 'Send an on-chain Bitcoin payment.' : 'Coming soon!'}>
        <Button
          label="WITHDRAW BTC" type="toggle" selected={!props.toggleLightning}
          disabled={!withdrawEnabled}
          variation='toggle' width="16rem" 
          onClick={() => props.setToggleLightning(false)}
          icon={ (props.toggleLightning && withdrawEnabled) ? <BtcMinusFilled /> : <BtcMinus /> }
        />
      </Tooltip>
    </Row>
  );
};