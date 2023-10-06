import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { IsNotEmpty, MinLength } from "class-validator";

import { Text, ModalContainer, RequestInboundForm, Row, Subtitle, Title, TitleContainer, SkipText, Stack, SatsNumber, BigNumber } from "./liquidity-modal.styles"

import { Button } from "@platform/common";
import { useUIStore } from "@ui";
import { Satoshi } from "@icons"
import { Slider } from "@mui/material";
import { useHeyhowareya, useNodeDoc } from "@lightning/queries";
import { observer } from "mobx-react-lite";
import { LiquidityResponses, useRequestLiquidity } from "@src/features/lightning/hooks/mutations";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import ApiResult from "@blockspaces/shared/models/ApiResult";

export class PasswordFormDto {
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8)
  nodePassword: string;
}

type PageData = {
  refetch: any,
  mutate: any,
  liquidityRes: LiquidityResponses,
  data: any,
  loading: boolean, 
  nodeDoc: ApiResult<LightningNodeReference>,
  nodeDocLoading: boolean,
  nodeDocError: Error | unknown,
}

const usePageData = (): PageData => {
  const { refetch } = useHeyhowareya()
  const { nodeDoc, nodeDocLoading, nodeDocError } = useNodeDoc();
  const { mutate, liquidityRes, data, requestLiquidityLoading } = useRequestLiquidity()
  return { refetch, mutate, liquidityRes, data, loading: requestLiquidityLoading, nodeDoc, nodeDocLoading, nodeDocError }
}

export const LiquidityModal = observer(() => {
  const { refetch, mutate, liquidityRes, data, loading, nodeDoc, nodeDocError, nodeDocLoading } = usePageData()
  const UI = useUIStore()
  const router = useRouter()
  const [sliderValue, setSliderValue] = useState(50);

  useEffect(() => {
    if (!liquidityRes) return
    displayToast()
  }, [liquidityRes])

  useEffect(() => {
    if (!liquidityRes) return
    displayToast()
  }, [liquidityRes])

  const displayToast = () => {
    switch (liquidityRes) {
      case LiquidityResponses.WalletSyncing:
        return UI.showToast({
          message: 'Could not fulfill liquidity request. Wallet syncing. Wait 10 minutes and try again.',
          alertType: 'error',
          position: { vertical: 'top', horizontal: 'right' },
        })
      case LiquidityResponses.Failure:
        return UI.showToast({
          message: `Could not make request for liquidity. Refresh the page and try again.`,
          alertType: 'error',
          position: { vertical: 'top', horizontal: 'right' },
        })
      case LiquidityResponses.Success:
        refetch()
        router.push("/multi-web-app/lightning")
        router
        return UI.showToast({
          message: 'Request for Inbound Liquidity Succeeded!',
          alertType: 'success',
          position: { vertical: 'top', horizontal: 'right' },
        });
      default:
        return UI.showToast({
          message: 'Request for Inbound Liquidity failed. Please contact a BlockSpaces Representative.',
          alertType: 'error',
          position: { vertical: 'top', horizontal: 'right' },
        })
    }
  }
  
  return !nodeDocLoading && (
    <ModalContainer id="liquidity-modal">
      <TitleContainer>
        <Title>Liquidity Setup - Inbound</Title>
        <Subtitle>
          <b>Inbound Liquidity</b> allows you to <u><b>receive</b></u> payments over the Lightning Network.
        </Subtitle>
      </TitleContainer>
      <Text>
        How much <u><b>Inbound Liquidity</b></u> would you like to request from BlockSpaces? 
      </Text>
      <RequestInboundForm>
        <SatsNumber>
          <Satoshi color="black" />
          <BigNumber>
            {sliderValue}
          </BigNumber>
          <Text size={2}>million</Text>
        </SatsNumber>
        <Slider 
          name="sliderInbound"
          defaultValue={50}
          min={10}
          max={100}
          value={sliderValue}
          onChange={(_, val:number) => setSliderValue(val) }
        />
        <Stack>
          <Button
            id="btnSubmit"
            label="Request Inbound"
            variation="simple"
            width="16rem"
            labelOnSubmit="Requesting Inbound..."
            submitting={loading}
            customStyle={{fontWeight: '10rem'}}
            onClick={() => mutate(sliderValue * 1_000_000)}
          />
          <Link legacyBehavior href='/multi-web-app/lightning'>
            <SkipText id="skipStep"> Skip this step </SkipText>
          </Link>
        </Stack>
      </RequestInboundForm>
    </ModalContainer>
  )
})