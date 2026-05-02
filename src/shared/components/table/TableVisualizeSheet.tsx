"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  ChartColumn,
  Database,
  LineChart,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TableColumn } from "./models/table.model";
import { getValueByAccessor } from "./helpers/table-value.helper";
import { cn } from "@/lib/utils";

type TableVisualizeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  rows: unknown[];
  columns: TableColumn<unknown>[];
  totalRecords: number;
};

type VisualizationChartType = "bar" | "line" | "donut";
type VisualizationDimensionKind = "string" | "date" | "boolean";

type DimensionOption = {
  key: string;
  label: string;
  kind: VisualizationDimensionKind;
  getLabel: (row: unknown) => string | null;
  getSortValue: (row: unknown) => number | string;
};

type MetricOption = {
  key: string;
  label: string;
  getValue: (row: unknown) => number;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
};

type AggregatedChartDatum = {
  label: string;
  value: number;
  fill: string;
  sortValue: number | string;
};

const CHART_TYPE_OPTIONS: Array<{
  key: VisualizationChartType;
  label: string;
  icon: typeof BarChart3;
}> = [
    { key: "bar", label: "Bar", icon: BarChart3 },
    { key: "line", label: "Line", icon: LineChart },
    { key: "donut", label: "Donut", icon: PieChartIcon },
  ];

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
  "#dc2626",
  "#ca8a04",
  "#4f46e5",
];

const MAX_BUCKETS = 8;

function getColumnKey(column: TableColumn<unknown>, index: number) {
  const accessor = String(column.accessor ?? "").trim();
  const fallback = String(column.key ?? column.header ?? `column-${index}`).trim();
  return accessor || fallback || `column-${index}`;
}

function toPrimitiveValue(value: unknown) {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  return null;
}

function isDateLike(value: unknown) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime());
  }

  if (typeof value !== "string") {
    return false;
  }

  if (!/[T/-]/.test(value)) {
    return false;
  }

  return Number.isFinite(new Date(value).getTime());
}

function formatDimensionLabel(value: unknown, kind: VisualizationDimensionKind) {
  if (value == null || value === "") {
    return "Unknown";
  }

  if (kind === "boolean") {
    return value ? "Yes" : "No";
  }

  if (kind === "date") {
    const parsed = value instanceof Date ? value : new Date(String(value));
    if (!Number.isFinite(parsed.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  return String(value).trim() || "Unknown";
}

function detectDimensionKind(
  column: TableColumn<unknown>,
  samples: unknown[],
): VisualizationDimensionKind {
  const source = `${String(column.header ?? "")} ${String(column.accessor ?? "")}`.toLowerCase();

  if (/\b(date|time|created|updated|paid|start|end|scheduled|deadline|window)\b/.test(source)) {
    return "date";
  }

  if (samples.some((sample) => typeof sample === "boolean")) {
    return "boolean";
  }

  if (samples.some((sample) => isDateLike(sample))) {
    return "date";
  }

  return "string";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function buildNumberFormatter(options?: Intl.NumberFormatOptions) {
  const standardFormatter = new Intl.NumberFormat("en-US", options);
  const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  });

  return {
    full: (value: number) => standardFormatter.format(value),
    compact: (value: number) => compactFormatter.format(value),
  };
}

function deriveDimensionOptions(
  rows: unknown[],
  columns: TableColumn<unknown>[],
): DimensionOption[] {
  const options: DimensionOption[] = [];
  const seen = new Set<string>();

  columns.forEach((column, index) => {
    const key = getColumnKey(column, index);
    if (seen.has(key)) {
      return;
    }

    const sampleValues = rows
      .slice(0, 24)
      .map((row) => {
        const exportValue = toPrimitiveValue(column.exportValue?.(row));
        if (
          exportValue != null &&
          (typeof exportValue === "string" || typeof exportValue === "boolean" || exportValue instanceof Date)
        ) {
          return exportValue;
        }

        return toPrimitiveValue(getValueByAccessor(row, column.accessor));
      })
      .filter(
        (value): value is string | boolean | Date =>
          value instanceof Date ||
          typeof value === "string" ||
          typeof value === "boolean",
      );

    if (!sampleValues.length) {
      return;
    }

    const kind = detectDimensionKind(column, sampleValues);

    seen.add(key);
    options.push({
      key,
      label: column.header || key,
      kind,
      getLabel: (row) => {
        const exportValue = toPrimitiveValue(column.exportValue?.(row));
        const rawValue = toPrimitiveValue(getValueByAccessor(row, column.accessor));
        const resolvedValue =
          exportValue != null &&
            (typeof exportValue === "string" ||
              typeof exportValue === "boolean" ||
              exportValue instanceof Date)
            ? exportValue
            : rawValue;

        if (
          resolvedValue == null ||
          !(typeof resolvedValue === "string" ||
            typeof resolvedValue === "boolean" ||
            resolvedValue instanceof Date)
        ) {
          return null;
        }

        return formatDimensionLabel(resolvedValue, kind);
      },
      getSortValue: (row) => {
        const rawValue = toPrimitiveValue(getValueByAccessor(row, column.accessor));
        const exportValue = toPrimitiveValue(column.exportValue?.(row));
        const resolvedValue = rawValue ?? exportValue;

        if (kind === "date" && isDateLike(resolvedValue)) {
          return new Date(String(resolvedValue)).getTime();
        }

        return formatDimensionLabel(resolvedValue, kind);
      },
    });
  });

  return options;
}

function deriveMetricOptions(
  rows: unknown[],
  columns: TableColumn<unknown>[],
): MetricOption[] {
  const options: MetricOption[] = [
    {
      key: "row-count",
      label: "Row count",
      getValue: () => 1,
      formatValue: (value) => value.toLocaleString(),
      formatTick: formatCompactNumber,
    },
  ];
  const seen = new Set<string>(["row-count"]);

  columns.forEach((column, index) => {
    const key = getColumnKey(column, index);
    if (seen.has(key)) {
      return;
    }

    const source = `${String(column.header ?? "")} ${String(column.accessor ?? "")}`.toLowerCase();
    const isCurrencyCents = /\bcents\b/.test(source);
    const isCurrencyLike =
      isCurrencyCents || /\b(amount|price|revenue|paid|refund|net)\b/.test(source);

    const resolveNumericCandidate = (row: unknown) => {
      const rawValue = getValueByAccessor(row, column.accessor);
      if (typeof rawValue === "number" || typeof rawValue === "bigint") {
        return rawValue;
      }

      const exportValue = column.exportValue?.(row);
      if (typeof exportValue === "number" || typeof exportValue === "bigint") {
        return exportValue;
      }

      return null;
    };

    const numericValues = rows
      .slice(0, 24)
      .map((row) => {
        const candidate = resolveNumericCandidate(row);

        if (typeof candidate === "bigint") {
          return Number(candidate);
        }

        return typeof candidate === "number" && Number.isFinite(candidate)
          ? candidate
          : null;
      })
      .filter((value): value is number => value != null);

    if (!numericValues.length) {
      return;
    }

    const numberFormatter = isCurrencyLike
      ? buildNumberFormatter({
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
      : buildNumberFormatter({
        maximumFractionDigits: 1,
      });

    seen.add(key);
    options.push({
      key,
      label: column.header || key,
      getValue: (row) => {
        const candidate = resolveNumericCandidate(row);

        let numericValue = 0;
        if (typeof candidate === "bigint") {
          numericValue = Number(candidate);
        } else if (typeof candidate === "number") {
          numericValue = candidate;
        }

        return isCurrencyCents ? numericValue / 100 : numericValue;
      },
      formatValue: numberFormatter.full,
      formatTick: numberFormatter.compact,
    });
  });

  return options;
}

function aggregateRows(
  rows: unknown[],
  dimension: DimensionOption,
  metric: MetricOption,
) {
  const bucketMap = new Map<
    string,
    { label: string; value: number; sortValue: number | string }
  >();

  rows.forEach((row) => {
    const label = dimension.getLabel(row) ?? "Unknown";
    const sortValue = dimension.getSortValue(row);
    const nextValue = metric.getValue(row);

    if (!bucketMap.has(label)) {
      bucketMap.set(label, {
        label,
        value: 0,
        sortValue,
      });
    }

    const current = bucketMap.get(label);
    if (!current) {
      return;
    }

    current.value += nextValue;
  });

  let entries = Array.from(bucketMap.values()).filter((entry) => entry.value > 0);

  if (dimension.kind === "date") {
    entries = entries.sort(
      (left, right) => Number(left.sortValue) - Number(right.sortValue),
    );
  } else {
    entries = entries.sort((left, right) => right.value - left.value);
  }

  if (dimension.kind !== "date" && entries.length > MAX_BUCKETS) {
    const head = entries.slice(0, MAX_BUCKETS - 1);
    const tail = entries.slice(MAX_BUCKETS - 1);
    const otherValue = tail.reduce((sum, entry) => sum + entry.value, 0);

    entries = [
      ...head,
      {
        label: "Other",
        value: otherValue,
        sortValue: "Other",
      },
    ];
  }

  return entries.map<AggregatedChartDatum>((entry, index) => ({
    label: entry.label,
    value: Number(entry.value.toFixed(2)),
    fill: CHART_COLORS[index % CHART_COLORS.length],
    sortValue: entry.sortValue,
  }));
}

export default function TableVisualizeSheet({
  open,
  onOpenChange,
  title,
  rows,
  columns,
  totalRecords,
}: TableVisualizeSheetProps) {
  const dimensionOptions = useMemo(
    () => deriveDimensionOptions(rows, columns),
    [columns, rows],
  );
  const metricOptions = useMemo(
    () => deriveMetricOptions(rows, columns),
    [columns, rows],
  );

  const [chartType, setChartType] = useState<VisualizationChartType>("bar");
  const [dimensionKey, setDimensionKey] = useState("");
  const [metricKey, setMetricKey] = useState("row-count");

  const resolvedDimensionKey = useMemo(() => {
    if (!dimensionOptions.length) {
      return "";
    }

    return dimensionOptions.some((option) => option.key === dimensionKey)
      ? dimensionKey
      : dimensionOptions[0].key;
  }, [dimensionKey, dimensionOptions]);

  const resolvedMetricKey = useMemo(() => {
    if (!metricOptions.length) {
      return "row-count";
    }

    return metricOptions.some((option) => option.key === metricKey)
      ? metricKey
      : metricOptions[0].key;
  }, [metricKey, metricOptions]);

  const selectedDimension =
    dimensionOptions.find((option) => option.key === resolvedDimensionKey) ?? null;
  const selectedMetric =
    metricOptions.find((option) => option.key === resolvedMetricKey) ?? null;
  const resolvedChartType: VisualizationChartType =
    selectedDimension?.kind === "date" && chartType === "donut"
      ? "line"
      : chartType;

  const chartData = useMemo(() => {
    if (!selectedDimension || !selectedMetric) {
      return [];
    }

    return aggregateRows(rows, selectedDimension, selectedMetric);
  }, [rows, selectedDimension, selectedMetric]);

  const donutBreakdown = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items: chartData.map((item) => ({
        ...item,
        share: total > 0 ? (item.value / total) * 100 : 0,
      })),
    };
  }, [chartData]);

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      value: {
        label: selectedMetric?.label ?? "Value",
        color: "#2563eb",
      },
    }),
    [selectedMetric?.label],
  );
  let content: React.ReactNode = null;

  if (!rows.length) {
    content = (
      <div className="rounded-3xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background">
            <ChartColumn className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Nothing to plot yet
            </h3>
            <p className="text-sm text-muted-foreground">
              There are no rows on this page right now, so the table does not
              have anything to visualize.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (!selectedDimension || !selectedMetric) {
    content = (
      <div className="rounded-3xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background">
            <Database className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Not enough chart-ready fields
            </h3>
            <p className="text-sm text-muted-foreground">
              This table does not expose enough numeric or category-friendly
              columns to build a meaningful chart yet.
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    let chart: React.ReactNode = null;

    if (resolvedChartType === "donut") {
      chart = (
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => {
                  const datum = item.payload as AggregatedChartDatum;
                  return (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{datum.label}</span>
                      <span className="font-medium text-foreground">
                        {selectedMetric.formatValue(Number(value))}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            innerRadius={78}
            outerRadius={114}
            paddingAngle={3}
          >
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      );
    } else if (resolvedChartType === "line") {
      chart = (
        <RechartsLineChart data={chartData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={selectedMetric.formatTick}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => selectedMetric.formatValue(Number(value))}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2.5}
            dot={{
              fill: "var(--color-value)",
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{ r: 5 }}
          />
        </RechartsLineChart>
      );
    } else {
      chart = (
        <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={selectedMetric.formatTick}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => selectedMetric.formatValue(Number(value))}
              />
            }
          />
          <Bar
            dataKey="value"
            radius={[10, 10, 0, 0]}
            fill="var(--color-value)"
          />
        </BarChart>
      );
    }

    content = (
      <div className="space-y-6">
        {(() => {
          let chartTypeLabel = "Bar chart";
          if (resolvedChartType === "line") {
            chartTypeLabel = "Line chart";
          } else if (resolvedChartType === "donut") {
            chartTypeLabel = "Donut chart";
          }

          return (
            <>
              <div className="rounded-3xl border border-border bg-linear-to-br from-muted/35 via-background to-background p-5">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">
                        Visual summary
                      </h3>
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        Choose a category and a metric, then switch between chart
                        types to explore the rows currently loaded in this table.
                      </p>
                    </div>
                    {/* <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] font-medium">
                      Current page data
                    </Badge> */}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background/85 p-4 shadow-xs">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Loaded rows</span>
                        <Database className="size-4 text-primary" />
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {rows.length.toLocaleString()}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The rows currently visible to this chart tool.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/85 p-4 shadow-xs">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Filtered total</span>
                        <ChartColumn className="size-4 text-primary" />
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {totalRecords.toLocaleString()}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Total records matching the current table filters.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/85 p-4 shadow-xs">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Plotted groups</span>
                        <BarChart3 className="size-4 text-primary" />
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {chartData.length.toLocaleString()}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Distinct groups created from your selected dimension.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid gap-4 rounded-3xl border border-border bg-muted/20 p-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Group rows by
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Pick the category the chart should bucket rows into.
                    </p>
                    <Select value={resolvedDimensionKey} onValueChange={setDimensionKey}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {dimensionOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Measure
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Choose the numeric value to summarize across each group.
                    </p>
                    <Select value={resolvedMetricKey} onValueChange={setMetricKey}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {metricOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-muted/20 p-3">
                  <div className="mb-3 space-y-1 px-1">
                    <h4 className="text-sm font-medium text-foreground">Chart type</h4>
                    <p className="text-xs text-muted-foreground">
                      Switch the presentation without changing the underlying grouping.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    {CHART_TYPE_OPTIONS.map((option) => {
                      const active = resolvedChartType === option.key;
                      const disabled =
                        option.key === "donut" && selectedDimension.kind === "date";

                      return (
                        <Button
                          key={option.key}
                          type="button"
                          variant="outline"
                          disabled={disabled}
                          className={cn(
                            "h-auto min-h-14 justify-start rounded-2xl border-border bg-background px-4 py-3 text-left text-xs",
                            active && "border-primary bg-primary/8 text-primary shadow-xs",
                          )}
                          onClick={() => setChartType(option.key)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex size-8 items-center justify-center rounded-xl border border-border bg-muted/40",
                              active && "border-primary/30 bg-primary/10",
                            )}>
                              <option.icon className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {option.key === "bar" && "Best for quick comparisons"}
                                {option.key === "line" && "Best for ordered progressions"}
                                {option.key === "donut" && "Best for share breakdowns"}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-5 shadow-xs">
                {chartData.length ? (
                  <>
                    <div className="mb-5 flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {selectedMetric.label} by {selectedDimension.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Built from the rows currently loaded in this table view.
                        </p>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] font-medium">
                        {chartTypeLabel}
                      </Badge>
                    </div>

                    {resolvedChartType === "donut" ? (
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
                        <ChartContainer
                          config={chartConfig}
                          className="h-[400px] w-full rounded-2xl bg-muted/10 p-2 text-xs"
                        >
                          {chart}
                        </ChartContainer>

                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <div className="space-y-1 border-b border-border pb-3">
                            <p className="text-sm font-medium text-foreground">
                              Breakdown summary
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Color-coded share of the plotted donut values.
                            </p>
                          </div>

                          <div className="mt-4 rounded-2xl border border-border bg-background/80 p-3">
                            <div className="text-[11px] text-muted-foreground">
                              Total plotted
                            </div>
                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {selectedMetric.formatValue(donutBreakdown.total)}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {donutBreakdown.items.map((item) => (
                              <div
                                key={item.label}
                                className="rounded-2xl border border-border bg-background/80 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="size-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: item.fill }}
                                      />
                                      <span className="truncate text-sm font-medium text-foreground">
                                        {item.label}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.share.toFixed(1)}% of plotted total
                                    </div>
                                  </div>
                                  <div className="text-right text-sm font-medium text-foreground">
                                    {selectedMetric.formatValue(item.value)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ChartContainer
                        config={chartConfig}
                        className="h-[400px] w-full rounded-2xl bg-muted/10 p-2 text-xs"
                      >
                        {chart}
                      </ChartContainer>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-5 text-sm text-muted-foreground">
                    This combination does not produce any chartable values from the current rows.
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full min-h-0 w-full flex-col p-0 sm:max-w-4xl">
        <SheetHeader className="shrink-0 border-b border-border bg-card/90 px-6 pb-5 pt-6 pr-14 text-left">
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/40">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div className="space-y-1.5">
              <SheetTitle className="text-lg">{title}</SheetTitle>
              <SheetDescription className="max-w-2xl text-sm leading-6">
                Plot the currently loaded table rows into a quick chart view. This
                reflects the rows on the page right now, not a separate details
                screen.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
