import { ApiResponse } from "../../model/model";
import { useQuery } from "@tanstack/react-query";

export function useAutoComplete<T>(
  search: string,
  service: (query: string) => Promise<ApiResponse<T[]>>,
  queryKey: string = ""
) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["search" + queryKey + search],
    queryFn: () => service(search),
    // placeholderData: () => ({
    // 	status: 'success',
    // 	message: 'placeholder',
    // 	data: [{ name: 'test', id: 33939399 }] as unknown as T[]
    // })
  });

  return {
    isRefetching,
    autoCompleteLoading: isLoading,
    autoCompleteError: error,
    autoCompleteResult: data?.data,
  };
}
