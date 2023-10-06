import { EndpointWithUrl } from "@blockspaces/shared/models/endpoints/Endpoint";
import { Button } from "@platform/common";
import { Trash } from "@icons";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { StyledEndpointSelect, ActiveEndpoints, EndpointTab, DeleteEndpoint, AddFirstEndpoint, AddEndpointCopy, AddEndpointButton } from "./endpoint-select.styles";
import { useEndpoints, useNetworkData } from "@endpoints/queries";
import { useAddEnpoint } from "@endpoints/mutations";
import { useEffect } from "react";
import { UserNetwork, UserNetworkStatus } from "@blockspaces/shared/models/networks";

type Props = {
  userNetworkData: UserNetwork;
  endpoints: EndpointWithUrl[];
  selectedEndpoint: EndpointWithUrl;
  setSelectedEndpoint: (endpoint: EndpointWithUrl) => void;
};

export const EndpointSelect = observer(({ userNetworkData, endpoints, selectedEndpoint, setSelectedEndpoint }: Props) => {
  const router = useRouter();
  const { nid } = router.query;

  const { network } = useNetworkData(nid as string);
  const { addEndpointMutation, addEndpointLoading } = useAddEnpoint();
  const { endpointsRefetch } = useEndpoints(nid as string);

  // Logic for after adding an endpoint, update the endpoint tabs.
  useEffect(() => {
    if (addEndpointLoading) return;
    endpointsRefetch();
  }, [addEndpointLoading]);

  const _canDelete = () => {
    return userNetworkData?.status === null;
  };
  const addEndPoint = (networkId) => {
    if (userNetworkData?.status === UserNetworkStatus.TemporarilyPaused) return;
    addEndpointMutation(networkId);
  };

  return (
    <StyledEndpointSelect noEndpoints={endpoints.length === 0}>
      {endpoints.length ? (
        <>
          <ActiveEndpoints>
            {endpoints.map((endpoint) => {
              const isSelected = endpoint.endpointId === selectedEndpoint?.endpointId;
              return (
                <EndpointTab key={`endpoint-tab-${endpoint.endpointId}`} id={`endpoint-tab-${endpoint.endpointId}`} selected={isSelected} onClick={() => !isSelected && setSelectedEndpoint(endpoint)}>
                  {endpoint.alias}
                  <DeleteEndpoint
                    id="open-delete-endpoint-modal"
                    onClick={() => _canDelete() && router.push({ pathname: router.pathname, query: { ...router.query, endpointId: endpoint.endpointId, modal: "delete-endpoint" } })}
                  >
                    <Trash />
                  </DeleteEndpoint>
                </EndpointTab>
              );
            })}
          </ActiveEndpoints>
          <Button
            id="btnSelectEndpoint"
            label="+ Add Endpoint"
            variation="default-new"
            width="9rem"
            height="2.5rem"
            submitting={addEndpointLoading}
            customStyle={{
              fontSize: ".875rem",
              marginTop: "-.25rem",
              marginRight: "1.125rem"
            }}
            onClick={() => !addEndpointLoading && addEndPoint(network._id)}
          />
        </>
      ) : (
        <AddFirstEndpoint id="add-endpoint-call-to-action" addingEndpoint={addEndpointLoading} onClick={() => !addEndpointLoading && addEndPoint(network._id)}>
          <AddEndpointCopy>{`Click here to create your first ${network.chain ? `${network.name} ${network.chain}` : network.name} endpoint`}</AddEndpointCopy>
          <AddEndpointButton>{addEndpointLoading ? `Adding Endpoint...` : `Add Endpoint`}</AddEndpointButton>
        </AddFirstEndpoint>
      )}
    </StyledEndpointSelect>
  );
});
