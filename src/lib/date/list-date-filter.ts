import {
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfYear,
  subDays,
} from "date-fns";

import {
  LIST_DATE_FILTER,
  type ListDateFilter,
  type ListDateFilterQuery,
} from "@/shared/model/list-date-filter.model";

function formatDateToYmd(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function buildListDateFilterQuery(
  dateFilter: ListDateFilter,
): ListDateFilterQuery | null {
  const today = new Date();

  if (dateFilter === LIST_DATE_FILTER.ALL) {
    return null;
  }

  if (dateFilter === LIST_DATE_FILTER.TODAY) {
    const value = formatDateToYmd(today);

    return {
      dateFilter,
      startDate: value,
      endDate: value,
    };
  }

  if (dateFilter === LIST_DATE_FILTER.LAST_7_DAYS) {
    return {
      dateFilter,
      startDate: formatDateToYmd(subDays(today, 6)),
      endDate: formatDateToYmd(today),
    };
  }

  if (dateFilter === LIST_DATE_FILTER.LAST_30_DAYS) {
    return {
      dateFilter,
      startDate: formatDateToYmd(subDays(today, 29)),
      endDate: formatDateToYmd(today),
    };
  }

  if (dateFilter === LIST_DATE_FILTER.LAST_90_DAYS) {
    return {
      dateFilter,
      startDate: formatDateToYmd(subDays(today, 89)),
      endDate: formatDateToYmd(today),
    };
  }

  if (dateFilter === LIST_DATE_FILTER.YEAR_TO_DATE) {
    return {
      dateFilter,
      startDate: formatDateToYmd(startOfYear(today)),
      endDate: formatDateToYmd(today),
    };
  }

  if (dateFilter === LIST_DATE_FILTER.UPCOMING) {
    return {
      dateFilter,
      startDate: formatDateToYmd(today),
    };
  }

  return null;
}

export function buildCustomListDateFilterQuery(args: {
  startDate: string;
  endDate: string;
}): ListDateFilterQuery {
  return {
    dateFilter: LIST_DATE_FILTER.CUSTOM,
    startDate: args.startDate,
    endDate: args.endDate,
  };
}

export function buildMongoDateRangeFilter(args: {
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
}) {
  const dateFilter = args.dateFilter as ListDateFilter | undefined;
  const { startDate, endDate } = args;

  if (!dateFilter || dateFilter === LIST_DATE_FILTER.ALL || !startDate) {
    return null;
  }

  const start = startOfDay(parseISO(startDate));

  if (dateFilter === LIST_DATE_FILTER.UPCOMING) {
    return {
      gte: start.toISOString(),
    };
  }

  const resolvedEndDate = endDate ?? startDate;
  const end = endOfDay(parseISO(resolvedEndDate));

  return {
    gte: start.toISOString(),
    lte: end.toISOString(),
  };
}

export function applyListDateFilterToQuery(args: {
  transformedQuery: Record<string, unknown>;
  targetField: string;
}) {
  const { transformedQuery, targetField } = args;
  const dateRange = buildMongoDateRangeFilter({
    dateFilter:
      typeof transformedQuery.dateFilter === "string"
        ? transformedQuery.dateFilter
        : undefined,
    startDate:
      typeof transformedQuery.startDate === "string"
        ? transformedQuery.startDate
        : undefined,
    endDate:
      typeof transformedQuery.endDate === "string"
        ? transformedQuery.endDate
        : undefined,
  });

  delete transformedQuery.dateFilter;
  delete transformedQuery.startDate;
  delete transformedQuery.endDate;
  delete transformedQuery.dateField;

  if (dateRange) {
    transformedQuery[targetField] = dateRange;
  }
}
