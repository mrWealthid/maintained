export const LIST_DATE_FILTER = {
  ALL: "all",
  TODAY: "today",
  LAST_7_DAYS: "last7",
  LAST_30_DAYS: "last30",
  LAST_90_DAYS: "last90",
  YEAR_TO_DATE: "ytd",
  UPCOMING: "upcoming",
  CUSTOM: "custom",
} as const;

export type ListDateFilter =
  (typeof LIST_DATE_FILTER)[keyof typeof LIST_DATE_FILTER];

export type ListDateFilterQuery = {
  dateFilter?: ListDateFilter | "";
  startDate?: string;
  endDate?: string;
  dateField?: string;
};

export type ListDateFieldOption = {
  label: string;
  value: string;
};
