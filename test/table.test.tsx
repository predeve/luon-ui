/** @jsxImportSource @luon/act */
import { afterEach, expect, test } from "bun:test";
import { act, mount, state } from "@luon/act";
import { Window } from "happy-dom";
import { Table, DataTable } from "../src/index.ts";
import { tablePage, tableQuery } from "../src/table-data.ts";

const window = new Window({ url: "http://localhost" });
Object.assign(globalThis, {
  window, document: window.document, Node: window.Node,
  Element: window.Element, HTMLElement: window.HTMLElement,
  Event: window.Event, MouseEvent: window.MouseEvent,
});
afterEach(() => document.body.replaceChildren());
const rows = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, name: `Item ${i + 1}`, amount: (i + 1) * 10,
  group: i % 2 ? "Ready" : "Draft",
}));
const columns = [
  { key: "name", title: "Name" },
  { key: "amount", title: "Amount", type: "number" as const },
  { key: "group", title: "Status", filter: ["Ready", "Draft"] },
];
const click = (label: string) => {
  const button = document.querySelector<HTMLButtonElement>(
    `[aria-label="${label}"]`,
  );
  expect(button).not.toBeNull();
  button!.click();
};
const input = (label: string, value: string, event = "input") => {
  const node = document.querySelector<HTMLInputElement>(
    `[aria-label="${label}"]`,
  )!;
  node.value = value;
  node.dispatchEvent(new Event(event, { bubbles: true }));
  return node;
};
const names = () => [...document.querySelectorAll("tbody tr")]
  .map((row) => row.textContent);

test("stable typed sorting, nested JSON, filters and pagination", () => {
  const data = [
    { user: { name: "Beta" }, n: "100", date: "2025-12-01" },
    { user: { name: "Alpha" }, n: "20", date: "2026-01-01" },
    { user: { name: "Alpha" }, n: null, date: "invalid" },
  ];
  const cols = [
    { key: "user.name" }, { key: "n", type: "number" as const },
    { key: "date", type: "date" as const },
  ];
  const sort = (key: string, direction: "asc" | "desc") => tablePage(
    data, cols, tableQuery({ sort: [{ key, direction }] }),
  ).rows;
  expect(sort("n", "asc")).toEqual([data[1]!, data[0]!, data[2]!]);
  expect(sort("n", "desc")).toEqual([data[0]!, data[1]!, data[2]!]);
  expect(sort("date", "desc")).toEqual([data[1]!, data[0]!, data[2]!]);
  expect(sort("user.name", "asc")).toEqual([data[1]!, data[2]!, data[0]!]);
  expect(data[0]!.n).toBe("100");
  const p = tablePage(rows, columns, tableQuery({
    search: "item", filters: { group: "Ready" }, page: 20, pageSize: 5,
    sort: [{ key: "amount", direction: "desc" }],
  }), { pagination: true });
  expect(p.total).toBe(6);
  expect(p.page).toBe(2);
  expect(p.rows.map((r) => r.id)).toEqual([2]);
});

test("plain Table stays minimal, escapes text and preserves custom cells", () => {
  const close = mount(<Table rows={[{ name: "<script>alert(1)</script>" }]}
    columns={[{ key: "name" }, { key: "action", cell: () => <b>Edit</b> }]}
  />, document.body);
  expect(document.querySelector("script")).toBeNull();
  expect(document.querySelector("tbody")!.textContent).toContain("<script>");
  expect(document.querySelector("b")?.textContent).toBe("Edit");
  expect(document.querySelector(".lui-table-tools")).toBeNull();
  expect(document.querySelector(".lui-table-footer")).toBeNull();
  expect(DataTable).toBe(Table);
  close();
});

test("search retains focus; filters and page size reset the page", () => {
  const close = mount(<Table columns={columns} rows={rows}
    options={{ search: true, sortable: true, filters: true,
      pagination: true, pageSize: 5 }}
  />, document.body);
  expect(names()).toHaveLength(5);
  click("Next page");
  expect(names()[0]).toContain("Item 6");
  const search = document.querySelector<HTMLInputElement>(
    '[aria-label="Search table"]',
  )!;
  search.focus();
  input("Search table", "Item 12");
  expect(names()).toHaveLength(1);
  expect(document.activeElement).toBe(search);
  input("Search table", "");
  input("Filter Status", "Ready", "change");
  expect(names()[0]).toContain("Item 2");
  click("Next page");
  expect(names()).toHaveLength(1);
  input("Rows per page", "10", "change");
  expect(names()).toHaveLength(6);
  expect(document.querySelector('[aria-label="Previous page"]')
    ?.hasAttribute("disabled")).toBeTrue();
  const sort = document.querySelectorAll<HTMLButtonElement>("thead button")[1]!;
  sort.click();
  expect(document.querySelectorAll("th")[1]?.getAttribute("aria-sort"))
    .toBe("ascending");
  expect(document.querySelectorAll("thead button")[1]).toBe(sort);
  sort.click();
  expect(names()[0]).toContain("Item 12");
  close();
});

test("reactive rows clamp pages and selection persists across pages", () => {
  const data = state({ rows, selected: [] as (string | number)[] });
  const close = mount(<Table rows={act(() => data.rows)} columns={columns}
    rowKey="id" selected={act(() => data.selected)}
    onSelectionChange={(keys) => { data.selected = keys; }}
    options={{ pagination: true, pageSize: 5, selection: true }}
  />, document.body);
  click("Select page");
  expect(data.selected).toEqual([1, 2, 3, 4, 5]);
  click("Next page");
  click("Select row 6");
  expect(data.selected).toEqual([1, 2, 3, 4, 5, 6]);
  const all = document.querySelector<HTMLInputElement>(
    '[aria-label="Select page"]',
  )!;
  expect(all.indeterminate).toBeTrue();
  click("Last page");
  data.rows = rows.slice(0, 3);
  expect(names()).toHaveLength(3);
  expect(document.querySelector('[aria-label="Next page"]')
    ?.hasAttribute("disabled")).toBeTrue();
  close();
});

test("manual query emits complete requests and never filters supplied rows", () => {
  const data = state({ query: tableQuery({ page: 3, pageSize: 5 }) });
  const close = mount(<Table rows={rows.slice(0, 5)} columns={columns}
    manual total={100} query={act(() => data.query)}
    onQueryChange={(next) => { data.query = next; }}
    options={{ search: true, pagination: true, pageSize: 5 }}
  />, document.body);
  click("Next page");
  expect(data.query.page).toBe(4);
  input("Search table", "server query");
  expect(data.query.page).toBe(1);
  expect(data.query.search).toBe("server query");
  expect(names()).toHaveLength(5);
  close();
});
