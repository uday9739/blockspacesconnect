import { Button } from "@mui/material"
import { Loading } from "@src/platform/components/common"
import DevLayout from "@src/platform/components/layouts/dev-layout"
import { useReactQueryExample } from "@src/features/dev-examples/hooks/queries"
import { useReactQueryMutation } from "@src/features/dev-examples/hooks/mutations"
import React from "react"

const ReactQuery = () => {
  const { 
    data, // The data returned from the query.
    isLoading, // The loading state of the query.
    isError, // If an error was returned
    error, // The error returned if there is one
    refetch, // Function to refetch the query
  } = useReactQueryExample()

  const {
    data: mutationData, // The data returned from the mutation.
    isLoading: mutateLoading, // If the mutation is loading.
    isError: isMutateError, // If there is an error in the mutation.
    error: mutateError, // The mutation error object.
    isSuccess, // If the mutation is successful.
    mutate // Call the mutation
  } = useReactQueryMutation()

  if (isLoading || mutateLoading) return <Loading when={isLoading || mutateLoading} />
  if (isError || isMutateError) return <h1>Doh! {JSON.stringify(error || mutateError)}</h1>

  return (
    <div style={{flex: 1, justifyContent: "center", alignItems: "center", width: "100%", height: "100%", padding: "4rem"}}>
      <h1>Query: <code>{JSON.stringify(data)}</code></h1>
      <hr />
      <Button variant="outlined" onClick={() => mutate({example: true, message: "Called the mutation."})}>Mutate</Button>
      <h1>Mutation: <code>{JSON.stringify(mutationData?.data?.data)}</code></h1>
    </div>
  )
}

export default ReactQuery
ReactQuery.getLayout = function getLayout(page) {
  return <DevLayout>{page}</DevLayout>;
};