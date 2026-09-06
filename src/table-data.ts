import type { Child } from "@luon/view";
import type { Live, UiProps } from "./types.ts";

export type TableSort = { key: string; direction: "asc" | "desc" };
export type TableQuery = {
  search: string;
  filters: Record<string, string>;
  sort: TableSort[];
  /** One-based page number. */
  page: number;
  pageSize: number;
};
export type TableColumn<Row = Record<string, any>> = {
  key?: keyof Row & string | string;
  data?: string;
  accessorKey?: string;
  name?: string;
  title?: string;
  label?: string;
  header?: string;
  type?: "text" | "number" | "date";
  align?: "left" | "center" | "right";
  width?: string | number;
  hidden?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  /** Text matching, or a fixed list of exact-match choices. */
  filter?: boolean | string[];
  value?: (row: Row) => unknown;
  cell?: (row: Row) => Child;
  format?: "number" | "percent" | "date";
  compare?: (left: unknown, right: unknown) => number;
};
export type TableOptions = {
  search?: boolean;
  sortable?: boolean;
  filters?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  columnToggle?: boolean;
  selection?: boolean;
};
export type TableProps<Row = Record<string, any>> = UiProps & {
  rows?: Live<Row[]>;
  data?: Live<Row[]>;
  columns?: TableColumn<Row>[];
  options?: TableOptions;
  query?: Live<Partial<TableQuery>>;
  defaultQuery?: Partial<TableQuery>;
  onQueryChange?: (query: TableQuery) => void;
  /** Supply a page of rows and the filtered total; handle query changes. */
  manual?: boolean;
  total?: Live<number>;
  rowKey?: keyof Row & string | ((row: Row) => string | number);
  selected?: Live<(string | number)[]>;
  onSelectionChange?: (keys: (string | number)[]) => void;
  caption?: string;
  ariaLabel?: string;
  density?: "compact" | "normal" | "comfortable";
  empty?: string;
  loading?: Live<boolean>;
  sticky?: boolean;
  height?: number | string;
  striped?: boolean;
  hover?: boolean;
  locale?: string;
  slotEmpty?: () => Child;
  slotLoading?: () => Child;
};

export function columnKey<Row>(column: TableColumn<Row>) {
  return String(column.key ?? column.accessorKey ?? column.data
    ?? column.name ?? "");
}
export function columnTitle<Row>(column: TableColumn<Row>) {
  return column.title ?? column.label ?? column.header ?? columnKey(column)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_.]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function fieldValue(row: unknown, key: string): unknown {
  if (row && typeof row === "object" && Object.hasOwn(row, key)) {
    return (row as Record<string, unknown>)[key];
  }
  let value = row;
  for (const part of key.split(".")) {
    if (!value || typeof value !== "object"
      || !Object.hasOwn(value, part)) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}
export function cellValue<Row>(row: Row, column: TableColumn<Row>) {
  return column.value ? column.value(row) : fieldValue(row, columnKey(column));
}
export function positive(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && value! > 0 ? Math.max(1, Math.floor(value!)) : fallback;
}
export function tableQuery(
  query: Partial<TableQuery> = {}, options: TableOptions = {},
): TableQuery {
  return {
    search: query.search ?? "", filters: { ...query.filters },
    sort: (query.sort ?? []).map((sort) => ({ ...sort })),
    page: positive(query.page, 1),
    pageSize: positive(query.pageSize, positive(options.pageSize, 10)),
  };
}
function sortValue(value: unknown, type?: string) {
  if (value == null || value === "") return null;
  if (type === "number") {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (type === "date" || value instanceof Date) {
    const number = new Date(value as string).getTime();
    return Number.isFinite(number) ? number : null;
  }
  return typeof value === "number" && Number.isFinite(value)
    ? value : String(value);
}
export function tablePage<Row>(
  rows: Row[], columns: TableColumn<Row>[], query: TableQuery,
  options: TableOptions = {}, manual = false, total = rows.length,
  locale?: string,
) {
  let result = rows;
  if (!manual) {
    const words = query.search.trim().toLocaleLowerCase(locale)
      .split(/\s+/).filter(Boolean);
    const filters = Object.entries(query.filters).filter(([, v]) => v !== "");
    if (words.length || filters.length) result = rows.filter((row) => {
      const text = columns.filter((c) => c.searchable !== false)
        .map((c) => String(cellValue(row, c) ?? ""))
        .join(" ").toLocaleLowerCase(locale);
      return words.every((word) => text.includes(word))
        && filters.every(([key, term]) => {
          const column = columns.find((c) => columnKey(c) === key);
          if (!column) return true;
          const value = String(cellValue(row, column) ?? "");
          return Array.isArray(column.filter) ? value === term
            : value.toLocaleLowerCase(locale)
              .includes(term.toLocaleLowerCase(locale));
        });
    });
    const sorts = query.sort.map((sort) => ({
      ...sort, column: columns.find((c) => columnKey(c) === sort.key),
    })).filter((sort) => sort.column && sort.column.sortable !== false);
    if (sorts.length) {
      const collator = new Intl.Collator(locale, {
        numeric: true, sensitivity: "base",
      });
      result = [...result].sort((a, b) => {
        for (const { column, direction } of sorts) {
          const left = cellValue(a, column!);
          const right = cellValue(b, column!);
          const x = sortValue(left, column!.type);
          const y = sortValue(right, column!.type);
          // Missing and invalid values stay last in either direction.
          if (x === null || y === null) {
            if (x !== y) return x === null ? 1 : -1;
            continue;
          }
          const diff = column!.compare ? column!.compare(left, right)
            : typeof x === "number" && typeof y === "number" ? x - y
              : collator.compare(String(x), String(y));
          if (diff) return direction === "desc" ? -diff : diff;
        }
        return 0;
      });
    }
    total = result.length;
  }
  total = Math.max(0, Number.isFinite(total) ? Math.floor(total) : 0);
  const pages = options.pagination
    ? Math.max(1, Math.ceil(total / query.pageSize)) : 1;
  const page = Math.min(query.page, pages);
  const start = options.pagination ? (page - 1) * query.pageSize : 0;
  const shown = options.pagination && !manual
    ? result.slice(start, start + query.pageSize) : result;
  return { rows: shown, total, pages, page, start };
}
export function cellText(value: unknown, format?: string, locale?: string) {
  if (value == null) return "";
  if (format === "date") {
    const date = new Date(value as string);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(locale);
  }
  if (format === "number" || format === "percent") {
    const number = Number(value);
    return Number.isFinite(number) ? new Intl.NumberFormat(locale, {
      style: format === "percent" ? "percent" : "decimal",
      maximumFractionDigits: 2,
    }).format(number) : "";
  }
  return String(value);
}
