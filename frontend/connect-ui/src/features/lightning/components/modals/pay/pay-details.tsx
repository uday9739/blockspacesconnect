import { AmountReference } from "@blockspaces/shared/models/lightning/Invoice";

import { CondensedRow, Description, DetailsRow, Line, PaymentDetails, SpinnerContainer, Stack, Text } from "./pay-details.styles";

import { CircularLoader } from "@platform/components/common";
import { Tooltip } from "@platform/common";
import { Satoshi } from "@icons";

export const PayDetails = (props: { loading: boolean; hide: boolean; memo?: string; amount?: AmountReference }) => {
  if (props.hide) {
    return <></>
  } else if (props.loading) {
    return (
      <SpinnerContainer>
        <CircularLoader customStyle={{ height: "5rem", width: "5rem" }} />
      </SpinnerContainer>
    )
  } else {
    return (
    <PaymentDetails>
      <DetailsRow>
        <Text size="1.1rem" weight="bold">
          Amount
        </Text>
        <Tooltip content={`= ₿${props.amount?.btcValue}`}>
          <Stack>
            <CondensedRow>
              <Satoshi color={"black"} />
              <Text size="1rem">{(props.amount?.btcValue * 100_000_000).toFixed(0)}</Text>
            </CondensedRow>
            <Text size="1.7rem">≈ ${props.amount?.fiatValue}</Text>
          </Stack>
        </Tooltip>
      </DetailsRow>
      <Line />
      <DetailsRow>
        <Text size="1.1rem" weight="bold">
          Memo
        </Text>
        <Tooltip content={props.memo ? props.memo : "Bitcoin ipsum dolor sit amet. Whitepaper transaction private key \
            difficulty Satoshi Nakamoto satoshis blockchain! Wallet"}>
          <Description>
            "{props.memo ? props.memo : "Bitcoin ipsum dolor sit amet. Whitepaper transaction private key \
              difficulty Satoshi Nakamoto satoshis blockchain! Wallet"}"
          </Description>
        </Tooltip>
      </DetailsRow>
    </PaymentDetails>
    )
  }
};
