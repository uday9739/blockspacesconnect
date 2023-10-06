import { useLndVersion, useNodeDoc } from "@src/features/lightning/hooks/queries"
import { CopyText, InfoHelper } from "@src/platform/components/common"
import { Heading, InfoLine, NodeInfoContainer, TitleWithInfo } from "./index.styles"

export const NodeInfo = () => {
  const {data:lnd} = useLndVersion()
  const {nodeDoc} = useNodeDoc()
  return (
    <NodeInfoContainer>
      <Heading>Node Info</Heading>
      <InfoLine>
        <TitleWithInfo>
          <h1 style={{paddingRight:".25rem"}}>Version</h1>
          <InfoHelper content="Version of LND the node is running." url="https://github.com/lightningnetwork/lnd/releases"/>
        </TitleWithInfo>
        <h3>{lnd?.data?.version}</h3>
      </InfoLine>
      <InfoLine>
        <TitleWithInfo>
          <h1 style={{paddingRight:".25rem"}}>REST Endpoint</h1>
          <InfoHelper content="URL for interacting with the LND REST interface." url="https://lightning.engineering/api-docs/api/lnd/index.html#rest" />
        </TitleWithInfo>
        <CopyText label="URL" text={nodeDoc?.data.apiEndpoint} style={{display: "flex", alignItems: "center", width: "16.125rem", height: "2rem"}} />
      </InfoLine>
      <InfoLine>
        <TitleWithInfo>
          <h1 style={{paddingRight:".25rem"}}>gRPC Endpoint</h1>
          <InfoHelper content="URL for interacting with the LND gRPC interface." url="https://lightning.engineering/api-docs/api/lnd/index.html#grpc" />
        </TitleWithInfo>
        <CopyText label="URL" text={`${nodeDoc?.data.apiEndpoint}:10009`} style={{display: "flex", alignItems: "center", width: "16.125rem", height: "2rem"}} />
      </InfoLine>
      <InfoLine>
        <TitleWithInfo>
          <h1 style={{paddingRight:".25rem"}}>Connect</h1>
          <InfoHelper content="Pubkey and gossip endpoint for your node." url="https://docs.lightning.engineering/the-lightning-network/the-gossip-network"/>
        </TitleWithInfo>
        <CopyText label="Pubkey & Endpoint" text={`${nodeDoc?.data.pubkey}@${nodeDoc?.data?.gossipEndpoint}`} style={{display: "flex", alignItems: "center", width: "16.125rem", height: "2rem"}} />
      </InfoLine>
    </NodeInfoContainer>
  )
}