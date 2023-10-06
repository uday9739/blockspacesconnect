import { fetchCatalog, getNetworkCatalogCategories, getActiveNetworkOfferings } from "@platform/api/network-catalog"
import { useQuery } from "@tanstack/react-query"

export const useNetworkCatalog = () => {
  const { data: catalog, isLoading: catalogLoading, error: catalogError } = useQuery(["network-catalog"], () => fetchCatalog())

  return {
    catalog,
    catalogLoading,
    catalogError,
    getNetwork: (networdId: string) => catalog?.find(network => network?._id === networdId)
  }
}

export const useGetNetworkCatalogCategories = () => {
  return useQuery(["network-catalog-categories"], () => getNetworkCatalogCategories(), { staleTime: Infinity })
}

export const useGetActiveNetworkOfferings = () => {
  return useQuery(["active-offers"], () => getActiveNetworkOfferings(), {})
}