import { useState } from "react";
import { observer } from "mobx-react-lite";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";

import { EndpointTotals, StyledEndpoint, Test, TestEndpoint, TestLabel, TestRequest, TestResponse } from "./endpoint.styles";

import { Endpoint as TEndpoint, EndpointWithUrl } from "@blockspaces/shared/models/endpoints/Endpoint";
import { UpdateEndpointDto } from "@blockspaces/shared/dtos/endpoints";
import { Button, EditableField, CopyText, Loading } from "@platform/common";
import { useTestEndpoint, useUpdateEndpoint } from "@endpoints/mutations";
import { useEndpoints, useNetworkData, useNetworkUsage } from "@endpoints/queries";
import { useRouter } from "next/router";
import { Amount, Label, StyledTotal } from "@src/platform/components/common/total/total.styles";
import { getFormattedNumber } from "@src/platform/utils";
import { UserNetwork } from "@blockspaces/shared/models/networks";

type Props = {
  userNetworkData: UserNetwork;
  endpoint: EndpointWithUrl;
};

const resolver = classValidatorResolver(UpdateEndpointDto);

const usePageData = (endpoint: TEndpoint) => {
  const router = useRouter();
  const { nid } = router.query;
  const { network } = useNetworkData(nid as string);
  const { networkDataset } = useNetworkUsage([endpoint], network);
  const { endpointsRefetch } = useEndpoints(endpoint.networkId);

  // Get transaction count
  const txData = networkDataset && networkDataset.find((dataset) => dataset.endpointId === endpoint.endpointId);
  const totalTXs = txData && txData.data.length ? txData.data.reduce((tx, total) => tx + total) : 0;
  const avgTXs = totalTXs / (txData && txData.data ? txData.data.length : 1);

  return {
    endpointsRefetch,
    totalTXs,
    avgTXs,
    nid: nid as string
  };
};

export const Endpoint = observer(({ userNetworkData, endpoint }: Props) => {
  const { endpointsRefetch, avgTXs, totalTXs, nid } = usePageData(endpoint);
  const { updateEndpointMutation } = useUpdateEndpoint(nid);
  const { testEndpointMutation, testResponse, reset, testEndpointLoading } = useTestEndpoint();

  const [testRequest, setTestRequest] = useState(
    JSON.stringify(
      {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      },
      null,
      2
    )
  );

  const updateAlias = async (alias: string) => {
    const updatedEndpoint: UpdateEndpointDto = { ...endpoint, alias };
    updateEndpointMutation({ endpoint: updatedEndpoint, endpointId: endpoint.endpointId });
  };

  return (
    <StyledEndpoint>
      <EditableField label="ALIAS" value={endpoint.alias} onUpdate={updateAlias} style={{ margin: ".625rem 0" }} />
      <CopyText label="RPC Endpoint" text={endpoint.endpointUrl} style={{ margin: ".625rem 0" }} />
      <EndpointTotals>
        <StyledTotal>
          <Label>{"Total TXs"}</Label>
          <Amount> {getFormattedNumber(totalTXs)}</Amount>
        </StyledTotal>
        <StyledTotal>
          <Label>{"AVG DAILY TXs"}</Label>
          <Amount> {getFormattedNumber(avgTXs)}</Amount>
        </StyledTotal>
      </EndpointTotals>
      <TestEndpoint>
        <TestLabel>Test RPC Endpoint</TestLabel>
        <Test>
          <TestRequest id="outlined-multiline-flexible" spellCheck="false" name="requestJson" rows={6} value={testRequest} onChange={(e) => setTestRequest(e.target.value)} />
          <TestResponse empty={!testResponse}>
            <Loading when={testEndpointLoading}>{testResponse ? testResponse : "RESPONSE"}</Loading>
          </TestResponse>
        </Test>
        <Button
          id="btnSubmitTansaction"
          type="button"
          label="Submit Transaction"
          labelOnSubmit="Sending Test Transaction"
          submitting={testEndpointLoading}
          variation="simple"
          width="22rem"
          customStyle={{ margin: "1.5rem auto .875rem" }}
          onClick={() => {
            testEndpointMutation({ endpointUrl: endpoint.endpointUrl, body: JSON.parse(testRequest) });
          }}
        />
      </TestEndpoint>
    </StyledEndpoint>
  );
});
