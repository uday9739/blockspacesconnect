import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEndpoint, deleteEndpoint, testEndpoint, updateEndpoint } from "@endpoints/api";
import { UpdateEndpointDto } from "@blockspaces/shared/dtos/endpoints";
import { useState } from "react";

export const useAddEnpoint = () => {
  const { mutate: addEndpointMutation, data: addEndpointData, isLoading: addEndpointLoading } = useMutation({
    mutationFn: (networkId: string) => addEndpoint(networkId)
  });

  return { addEndpointMutation, addEndpointData, addEndpointLoading };
};

type UseUpdateEndpointType = { endpoint: UpdateEndpointDto, endpointId: string }
export const useUpdateEndpoint = (nid: string) => {
  const queryClient = useQueryClient()
  const { mutate: updateEndpointMutation, data: updateEndpointData, isLoading: updateEndpointLoading } = useMutation({
    mutationFn: (args: UseUpdateEndpointType) => updateEndpoint(args.endpoint, args.endpointId),
    // force a refresh of data to reflect latest changes 
    onSuccess: () => queryClient.invalidateQueries(["fetch-endpoints", nid])
  });

  return { updateEndpointMutation, updateEndpointData, updateEndpointLoading };
};

export const useDeleteEndpoint = () => {
  const { mutate: deleteEndpointMutation, data: deleteEndpointData, isLoading: deleteEndpointSubmitting } = useMutation({
    mutationFn: (endpointId: string) => deleteEndpoint(endpointId)
  });

  return { deleteEndpointMutation, deleteEndpointData, deleteEndpointSubmitting };
};

type TestEndpointArgs = { endpointUrl: string, body: Record<any, any> }
export const useTestEndpoint = () => {
  const [testResponse, setResponse] = useState(null)
  const { mutate: testEndpointMutation, data: testEndpointData, isLoading: testEndpointLoading, reset } = useMutation({
    mutationFn: (args: TestEndpointArgs) => testEndpoint(args.endpointUrl, args.body),
    onSuccess: (data) => setResponse(JSON.stringify(data))
  })

  return { testEndpointMutation, testResponse, reset, testEndpointLoading }
}
