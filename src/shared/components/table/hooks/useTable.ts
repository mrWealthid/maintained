import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { IListResponse, IsearchParams } from "../models/table.model";

export function useTable<T>(
  page: number,
  limit: number,
  service: (params: {
    page: number;
    limit: number;
    search?: IsearchParams | null;
  }) =>
    | Promise<{
        data: T[];
        totalRecords: number;
        results: number;
        summary: Record<string, number>;
      }>
    | {
        data: T[];
        totalRecords: number;
        results: number;
        summary: Record<string, number>;
      },
  queryKey: string,
  search?: IsearchParams | null
): IListResponse<T> {
  const { isLoading, data, error, isRefetching, refetch } = useQuery({
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
    summary: data?.summary ?? {},
    totalRecords: data?.totalRecords ?? 0,
    results: data?.results ?? 0,
    reload: () => refetch(),
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
