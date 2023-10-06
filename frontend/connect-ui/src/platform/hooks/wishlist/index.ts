import * as api from "@src/platform/api/wishlist"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"



export const useGetMyWishlist = () => {
  return useQuery(["my-wishlist"], () => api.getMine(), {})
}



export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { connectorId?: string, offerId?: string, networkId?: string }) => api.useAddToWishlist(args.connectorId, args.offerId, args.networkId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries(["my-wishlist"], {})
    }
  });
}

