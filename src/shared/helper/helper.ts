import { http } from "@/services/http";
import { ApiPaginatedResponse } from "../model/model";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";

/**
 * Generic helper for table-compatible list calls.
 *
 * TRow    – row type used in the table
 * TFilter – filter/search type your API expects
 */
export async function fetchListForTable<TRow, TFilter = unknown>({
  route,
  page = 1,
  limit = 10,
  search,
}: {
  route: string;
  page?: number;
  limit?: number;
  search?: TFilter | null;
}): Promise<{
  data: TRow[];
  totalRecords: number;
  results: number;
  summary: Record<string, number>;
}> {
  const queryString = buildQueryString({ limit, page, ...(search ?? {}) });
  const url = `${route}?${queryString}`;

  try {
    const { data } = await http.get<
      ApiPaginatedResponse<TRow[]> & { summary?: Record<string, number> }
    >(url);

    return {
      data: data.data,
      totalRecords: data.totalRecords,
      results: data.results,
      summary: data.summary ?? {},
    };
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
