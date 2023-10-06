import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";

import { StyledDeleteEndpoint, Title, PromptCopy, Options, DeleteConfirm } from "./delete-endpoint.styles";

import { Button } from "@platform/common";
import { useEndpoints } from "@endpoints/queries";
import { useDeleteEndpoint } from "@endpoints/mutations";

type Props = { closeModal:() => void }
export const DeleteEndpoint = observer(({ closeModal }: Props ) => {

  const [confirmString, setConfirmString] = useState('');
  const confirmInput = useRef<HTMLInputElement>(null);
  const router = useRouter()
  const { endpointId, nid } = router.query;

  const { endpoints } = useEndpoints(nid as string)
  const { deleteEndpointMutation, deleteEndpointSubmitting } = useDeleteEndpoint()
  const { endpointsRefetch } = useEndpoints(nid as string)

  const deleteEndpoint = async () => {
    if (!endpointId || !nid) return
    deleteEndpointMutation(endpointId as string)
    endpointsRefetch()
    closeModal();
  };

  useEffect(() => {
    if (!confirmInput.current) return
    confirmInput.current.focus();
  }, [confirmInput?.current])

  if (!endpoints?.length) return <></>
  const selectedEndpoint = endpoints.find(endpoint => endpoint.endpointId === endpointId)

  if (!selectedEndpoint) {
    closeModal();
    return <></>
  }

  return (
    <StyledDeleteEndpoint id="delete-endpoint-modal">
      <Title>
        Delete Endpoint
      </Title>
      <PromptCopy>
        {`Confirm you want to delete this endpoint by typing its alias in the box below.`}
      </PromptCopy>
      <DeleteConfirm
        type="text"
        ref={confirmInput}
        placeholder={selectedEndpoint.alias}
        maxLength={selectedEndpoint.alias.length}
        value={confirmString}
        onKeyUp={e => e.key === 'Enter' && confirmString === selectedEndpoint.alias && deleteEndpoint()}
        onChange={e => setConfirmString(e.target.value)}
      />
      <Options>
        <Button
          id="btnCancelEndpoint"
          label="Cancel"
          width="14rem"
          height="3.3125rem"
          variation="default-new"
          customStyle={{ margin: '0 .25rem'}}
          onClick={closeModal}
        />
        <Button
          id="btnDeletteEndpoint"
          label="Delete Endpoint"
          width="14rem"
          height="3.3125rem"
          variation="default-new"
          disabled={confirmString !== selectedEndpoint.alias}
          submitting={deleteEndpointSubmitting}
          customStyle={{ margin: '0 .25rem'}}
          onClick={() => deleteEndpoint()}
        />
      </Options>
    </StyledDeleteEndpoint>
  )

})