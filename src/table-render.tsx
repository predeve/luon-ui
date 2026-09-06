/** @jsxImportSource @luon/view */
import {
  effectView as effect, liveView as live, state, untrackView,
} from "@luon/view";
import {
  cellText, cellValue, columnKey, columnTitle, fieldValue,
  tablePage, tableQuery, type TableColumn, type TableProps,
  type TableQuery,
} from "./table-data.ts";
import { read, target } from "./util.ts";

export function renderTable(props: TableProps) {
  const options = props.options ?? {};
  if (options.selection && !props.rowKey) {
    throw new Error("Table selection requires a stable rowKey.");
  }
  const local = state({
    query: tableQuery(props.defaultQuery, options),
    selected: [] as (string | number)[],
    hidden: props.columns?.filter((c) => c.hidden).map(columnKey) ?? [],
  });
  const query = () => tableQuery(
    props.query === undefined ? local.query : read(props.query), options,
  );
  const rows = () => read(props.rows ?? props.data ?? []);
  const columns = (): TableColumn[] => props.columns
    ?? Object.keys(rows()[0] ?? {}).map((key) => ({ key }));
  const visible = () => columns().filter((c) => (
    !local.hidden.includes(columnKey(c))
  ));
  const compute = () => tablePage(
    rows(), columns(), query(), options, props.manual,
    read(props.total ?? rows().length), props.locale,
  );
  const cached = state({ value: untrackView(compute) });
  let stop: (() => void) | undefined;
  const connect = (node: Element | null) => {
    stop?.();
    stop = node ? effect(() => { cached.value = compute(); }) : undefined;
  };
  const page = () => cached.value;
  const busy = () => Boolean(read(props.loading ?? false));
  const selected = () => read(props.selected ?? local.selected);
  const rowKey = (row: Record<string, any>) => {
    const key = typeof props.rowKey === "function" ? props.rowKey(row)
      : fieldValue(row, props.rowKey!);
    if (typeof key !== "string" && typeof key !== "number") {
      throw new Error("Table rowKey must resolve to a string or number.");
    }
    return key;
  };
  const update = (patch: Partial<TableQuery>) => {
    const next = tableQuery({ ...query(), page: page().page, ...patch }, options);
    if (props.query === undefined) local.query = next;
    props.onQueryChange?.(next);
  };
  const select = (keys: (string | number)[], checked: boolean) => {
    const next = new Set(selected());
    for (const key of keys) checked ? next.add(key) : next.delete(key);
    const value = [...next];
    if (props.selected === undefined) local.selected = value;
    props.onSelectionChange?.(value);
  };
  const toggleSort = (column: TableColumn, multi: boolean) => {
    const key = columnKey(column);
    const current = query().sort.find((sort) => sort.key === key);
    const sort = multi ? query().sort.filter((sort) => sort.key !== key) : [];
    if (current?.direction !== "desc") {
      sort.push({ key, direction: current ? "desc" : "asc" });
    }
    update({ sort, page: 1 });
  };
  const search = (value: string) => update({ search: value, page: 1 });
  const filter = (key: string, value: string) => update({
    filters: { ...query().filters, [key]: value }, page: 1,
  });
  const initial = untrackView(query);
  const filterInput = (column: TableColumn) => {
    const key = columnKey(column);
    const label = `Filter ${columnTitle(column)}`;
    return Array.isArray(column.filter) ? <select
      aria-label={label}
      value={live(() => query().filters[key] ?? "")}
      onChange={(event: Event) => filter(key,
        target<HTMLSelectElement>(event).value)}
    ><option value="">All</option>{column.filter.map((value) => (
        <option value={value}>{value}</option>
      ))}</select> : <input
      type="search" aria-label={label} placeholder={label}
      value={live(() => query().filters[key] ?? "")}
      onInput={(event: Event) => filter(key,
        target<HTMLInputElement>(event).value)}
    />;
  };
  const head = (column: TableColumn) => <th scope="col"
    style={{ textAlign: column.align, width: typeof column.width === "number"
      ? `${column.width}px` : column.width }}
    aria-sort={live(() => {
      const sort = query().sort.find((s) => s.key === columnKey(column));
      return sort ? sort.direction === "asc" ? "ascending" : "descending"
        : "none";
    })}
  >{options.sortable && column.sortable !== false ? <button
      type="button" class="lui-table-sort"
      disabled={live(busy)}
      onClick={(event: MouseEvent) => toggleSort(column, event.shiftKey)}
    >{columnTitle(column)}<span aria-hidden="true">{live(() => {
        const sort = query().sort.find((s) => s.key === columnKey(column));
        return sort ? sort.direction === "asc" ? "↑" : "↓" : "↕";
      })}</span></button> : columnTitle(column)}</th>;
  const allKeys = () => page().rows.map(rowKey);
  const selectAll = () => <input type="checkbox"
    aria-label="Select page"
    checked={live(() => allKeys().length > 0
      && allKeys().every((key) => selected().includes(key)))}
    indeterminate={live(() => allKeys().some((key) => selected().includes(key))
      && !allKeys().every((key) => selected().includes(key)))}
    disabled={live(() => busy() || !allKeys().length)}
    onChange={(event: Event) => select(allKeys(),
      target<HTMLInputElement>(event).checked)}
  />;
  const body = () => {
    const current = page();
    const cols = visible();
    return busy() || !current.rows.length ? <tr><td
      colspan={Math.max(1, cols.length + Number(Boolean(options.selection)))}
      class="lui-table-empty"
    ><div role="status">{busy() ? props.slotLoading?.() ?? "Loading…"
        : props.slotEmpty?.() ?? props.empty ?? "No results."}</div></td></tr>
      : current.rows.map((row) => <tr
        aria-selected={options.selection
          ? live(() => selected().includes(rowKey(row))) : undefined}
      >{options.selection ? <td class="lui-table-check"><input
          type="checkbox" aria-label={`Select row ${rowKey(row)}`}
          checked={live(() => selected().includes(rowKey(row)))}
          onChange={(event: Event) => select([rowKey(row)],
            target<HTMLInputElement>(event).checked)}
        /></td> : null}{cols.map((column) => <td
          style={{ textAlign: column.align }}
        >{column.cell ? column.cell(row) : cellText(
            cellValue(row, column), column.format, props.locale,
          )}</td>)}</tr>);
  };
  const nav = (label: string, symbol: string, to: () => number,
    disabled: () => boolean) => <button type="button" aria-label={label}
      disabled={live(() => busy() || disabled())}
      onClick={() => update({ page: to() })}
    >{symbol}</button>;
  return <div class="lui-table-root" ref={connect}
    data-density={props.density ?? "normal"}
    data-striped={props.striped || undefined}
    data-hover={props.hover || undefined}
  >{options.search || options.columnToggle ? <div class="lui-table-tools">
      {options.search ? <label class="lui-table-search">
        <span>Search</span><input type="search" aria-label="Search table"
          placeholder="Search rows…" value={live(() => query().search)}
          onInput={(event: Event) => search(
            target<HTMLInputElement>(event).value,
          )}
        /></label> : null}
      {options.columnToggle ? <details class="lui-table-columns">
        <summary>Columns</summary><div>{columns().map((column) => (
          <label><input type="checkbox"
            checked={live(() => !local.hidden.includes(columnKey(column)))}
            disabled={live(() => visible().length === 1
              && !local.hidden.includes(columnKey(column)))}
            onChange={(event: Event) => {
              const key = columnKey(column);
              local.hidden = target<HTMLInputElement>(event).checked
                ? local.hidden.filter((value) => value !== key)
                : [...local.hidden, key];
            }}
          />{columnTitle(column)}</label>
        ))}</div></details> : null}
    </div> : null}
    <div class="lui-table-wrap" tabindex="0" role="region"
      aria-label={props.ariaLabel ?? props.caption ?? "Table"}
      style={{ maxHeight: typeof props.height === "number"
        ? `${props.height}px` : props.height }}
    ><table class="lui-table" aria-busy={live(busy)}
        aria-label={props.ariaLabel}
      >{props.caption ? <caption>{props.caption}</caption> : null}
        <thead data-sticky={props.sticky || undefined}>
          <tr>{options.selection ? <th scope="col"
            class="lui-table-check">{selectAll()}</th> : null}
            {live(() => visible().map(head))}</tr>
          {options.filters ? <tr class="lui-table-filters">
            {options.selection ? <th /> : null}
            {live(() => visible().map((column) => <th>
              {column.filter ? filterInput(column) : null}
            </th>))}</tr> : null}
        </thead><tbody>{live(body)}</tbody>
      </table></div>
    {options.pagination || options.selection ? <div class="lui-table-footer">
      <span role="status" aria-live="polite">{live(() => {
        const p = page();
        const count = p.rows.length;
        const range = `${count ? p.start + 1 : 0}–${p.start + count}`;
        return `${range} of ${p.total} rows`
          + (options.selection ? ` · ${selected().length} selected` : "");
      })}</span>
      {options.pagination ? <div class="lui-table-pages">
        <label>Rows per page<select aria-label="Rows per page"
          value={live(() => String(query().pageSize))}
          disabled={live(busy)}
          onChange={(event: Event) => update({ page: 1,
            pageSize: Number(target<HTMLSelectElement>(event).value) })}
        >{[...new Set([initial.pageSize, ...(options.pageSizes
          ?? [5, 10, 25, 50, 100])])].filter((n) => n > 0 && Number.isInteger(n))
          .sort((a, b) => a - b).map((size) => (
            <option value={String(size)}>{size}</option>
          ))}</select></label>
        <nav aria-label="Table pages">
          {nav("First page", "«", () => 1, () => page().page === 1)}
          {nav("Previous page", "‹", () => page().page - 1,
            () => page().page === 1)}
          <span>{live(() => `${page().page} / ${page().pages}`)}</span>
          {nav("Next page", "›", () => page().page + 1,
            () => page().page >= page().pages)}
          {nav("Last page", "»", () => page().pages,
            () => page().page >= page().pages)}
        </nav>
      </div> : null}
    </div> : null}
  </div>;
}
