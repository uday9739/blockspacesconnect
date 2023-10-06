import { fetchCyclr } from "@platform/api/cyclr"
import { useQuery } from "@tanstack/react-query"

export const useCyclr = () => {
  const { data: embedLink, isFetching } = useQuery(["cyclr"], () => fetchCyclr())

  return {
    embedLink,
    isFetching
  }
}