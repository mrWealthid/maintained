import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IListResponse } from "../models/table.model";

export function useTable<T>(
  page: number,
  limit: number,
  service: any,
  queryKey: string,
  search?: any
): IListResponse<T> {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: [queryKey, limit, page, search],
    queryFn: () => service({ page, limit, search }),
    // placeholderData: undefined
    placeholderData: keepPreviousData,
  });

  return {
    isLoading,
    isRefetching,
    error,
    data: data?.data,
    summary: data?.summary,
    totalRecords: data?.totalRecords,
    results: data?.results,
  };
}

// export function usePaginate(
// 	page: number,

// 	service: any,
// 	queryKey: string
// ) {
// 	const queryClient = useQueryClient();
// 	const { isLoading: isPaginating, mutate: paginate }: any = useMutation({
// 		mutationFn: (limit) => service(page, limit),
// 		onSuccess: () => {
// 			// toast.success('Bookings checked-out successfully');
// 			queryClient.invalidateQueries({
// 				queryKey: [queryKey]
// 			});
// 		},
// 		onError: (err: any) => toast.error(err.message)
// 	});

// 	return {
// 		isPaginating,
// 		paginate
// 	};
// }

// function handlePaginate(val: number, limit: number) {
// 	// setPage(val);
// 	// setLimit(limit);
// 	// fetchTableData(val, limit);
// }
