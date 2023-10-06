import { getApiUrl } from "@src/platform/utils"
import axios from "axios"

export const reactQueryExample = async () => {
  return await axios.get(getApiUrl("/platform/status/detailed"))
}

export const reactQueryMutationExample = async (example: boolean, message: string) => {
  return await axios.post(getApiUrl("/sample/react-query-mutation"), {example: example, message: message})
}