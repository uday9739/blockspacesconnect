import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "../../api"
/**
 * An example of a POST request.
 */
type MutationExampleArgs = { example: boolean, message: string } // Define the args for the mutation function.
export const useReactQueryMutation = () => {
  const queryClient = useQueryClient() // Can also use the query client in mutations.
  return useMutation({
    mutationKey: ["react-query-mutation"], // Optional set mutation key.
    mutationFn: (args: MutationExampleArgs) => api.reactQueryMutationExample(args.example, args.message), // The mutation function. Params MUST be an object.
    onMutate: () => console.log("Do something when the request is made."),
    onError: (error) => console.log("doh!", error), // Do something when there is an error.
    onSuccess: (data) => console.log("Do something when the request is successful."),
    onSettled: (data) => console.log("Do something whether the request was successful or there was an error."),
    retry: 3 // If the mutation failed, retry _n_ amount of times.
  })
}