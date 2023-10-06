import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as api from "../../api"
/**
 * An example of a GET request.
 */
export const useReactQueryExample = () => {
  const queryClient = useQueryClient() // The query client gives access to the queries that have been triggered
  return useQuery(
    ["react-query-example"], // The query key. Identifies the api call/query.
    () => api.reactQueryExample(), // The query function.
    {
      enabled: true ? true : false, // Can pass a boolean expression to trigger the query. E.x. if user is authenticated.
      onError: (error) => console.log("doh! error!", error), // Do something if an error occurs.
      onSuccess: async (data) => await queryClient.invalidateQueries(["currentUser"]), // You can trigger a refetch of another query if it is successful. e.x. refetch the `currentUser` if this query is successful.
      onSettled: (data) => console.log("settled", data), // On settled allows you to do something even if the call is successful or fails.
      refetchInterval: 0, // If > 0 you can have the query automatically refetched (param is in seconds)
      select: (response) => response.data.data // Select data returned from the api call.
    }
  )
}