import { useMutation } from "@tanstack/react-query"
import { withdrawBitcoin } from "../../api"
import { useNodeDoc } from "../queries"

type UseWithdrawBitcoinArgs = { address:string, amount?:number, send_all?:boolean }
export const useWithdrawBitcoin = () => {
  const { nodeDoc } = useNodeDoc()
  return useMutation({
    mutationFn: (args:UseWithdrawBitcoinArgs) => withdrawBitcoin(nodeDoc.data.apiEndpoint, args.address, args.amount, nodeDoc?.data?.cert, nodeDoc?.data?.nodeId, args.send_all)
  })
}