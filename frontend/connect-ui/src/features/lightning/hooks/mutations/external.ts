import { useMutation } from "@tanstack/react-query"
import * as api from "@lightning/api"

type UseCheckMacaroonPermissionsArgs = { macaroon: string, endpoint: string, certificate: string }
export const useCheckMacaroonPermissions = () => {
  return useMutation({
    mutationFn: async (args: UseCheckMacaroonPermissionsArgs) => api.checkMacaroonPermissions(args.macaroon, args.endpoint, args.certificate)
  })
}

type UseAddExternalNodeArgs = { macaroon: string, endpoint: string, certificate: string }
export const useAddExternalNode = () => {
  return useMutation({
    mutationFn: async (args: UseAddExternalNodeArgs) => api.addExternalNode(args.macaroon, args.endpoint, args.certificate)
  })
}