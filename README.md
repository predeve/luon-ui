# @luon/ui

Part of [Luon](https://www.luon.dev) — Native View UI for Luon sites.

[Package guide](https://pkg.luon.dev/packages/ui/) ·
[Source](https://github.com/predeve/luon-ui) ·
[Developer tools](https://www.luon.dev/tools)

## Install

```bash
bun add @luon/ui --registry https://pkg.luon.dev
```

## Who it is for

Luon Site authors using ready-made View UI primitives.

## Core concepts

### Light component package

View components, props, icons, and shared styles ship in the package; large browser engines stay outside the application bundle.

### Lazy browser engines

Editor and CodeEditor load their CDN engines when first rendered.
Chart and Table are native components with no CDN engine.
Chart renders native SVG and needs no external chart engine.

### Site-owned theme

Components inherit --ui-* tokens and the Site font. Tailwind utilities can override the component layer.

### Global or explicit use

Official Sites receive components through Runtime registration; normal View applications import the same components directly.

## Quick reference

### Scrollbars

Scrollbars default to `0px` with transparent thumbs and tracks. Scrolling
remains enabled. Import `@luon/ui/style.css` or `@luon/ui/scroll.css`, then
override the variables on `:root` or a scroll container to show the bars:

```css
:root {
  --luon-scroll-size: 5px;
  --luon-scroll-width: thin;
  --luon-scroll-thumb: #8b949e;
  --luon-scroll-track: transparent;
}
```

`--luon-scroll-size` controls both axes in WebKit scrollbar implementations.
Firefox uses `--luon-scroll-width`: `none` (default), `thin`, or `auto`.
ScrollArea uses these same variables.

### Component families

Start with a family, then inspect its live variants on ui.luon.dev.

| Family | Common components |
| --- | --- |
| Content | Text, Badge, Avatar, Card, Table, Empty |
| Forms | Input, Select, Checkbox, Slider, FileUpload |
| Navigation | Breadcrumb, Tabs, Pagination, Stepper |
| Overlays | Modal, Drawer, Popover, Tooltip, Toast |
| Interaction | Draggable, Sortable, DropdownMenu, Tree |
| Data and editing | Chart, Table, Editor, CodeEditor |

### Engine-backed components

Only these features load a larger versioned browser engine.

| Component | Engine | Load point |
| --- | --- | --- |
| Editor | Tiptap | First Editor mount |
| CodeEditor | CodeMirror | First CodeEditor mount |

### Customization order

Prefer the smallest override that expresses the product design.

| Need | Use |
| --- | --- |
| Brand colors and font | Site --ui-* tokens |
| One instance adjustment | class, style, or props |
| Shared component variation | Site-owned wrapper View |
| Complete replacement | Same-name Site component |
| Private engine host | globalThis.__LUON_CDN__ |

### Control options

| Component | Options |
| --- | --- |
| Button | Five sizes, five variants, square icons, loading and addon slots |
| Input | Outline, soft, subtle, ghost, none; color, prefix, suffix and slots |
| Textarea | Control variants, resize, autoresize and maxRows |
| SelectMenu | Search, groups, multiple values, clear, custom items and values |
| Card | Outline, soft, subtle, elevated, ghost; three sizes and header slots |
| Table | JSON columns, sorting, filters, selection, paging, custom cells |

Input addons can coexist with loading, clear and password actions. Disabled
and read-only fields retain their values; clearing returns focus to the input.
Use `id` with a string `error` to connect Input to its error description.

SelectMenu supports arrow keys, Home, End, Enter and Escape. Group options with
`{ group, items }`; use `maxVisible` for compact multiple selections. `name`
adds hidden form inputs for the selected values. Use `searchTerm` with
`onSearchChange`, `filter` or `ignoreFilter` for custom search. `slotItem`,
`slotValue` and `slotEmpty` customize the display without replacing selection.

Theme tokens resolve at each component boundary, including nested previews.
Pair action colors with foreground tokens such as `--ui-primary-foreground`.
Secondary, error, warning and success have matching foreground tokens. Switch
the default palette with `data-theme="light"` or `data-theme="dark"`, and
adjust `--ui-radius` and `--ui-shadow` for the Site's surface treatment.

## Examples

### Use global components in a Site

Runtime registers common Luon components without imports.

```tsx
export default () => <Card
  description="Gateway · port 6010"
  slotFooter={() => <Button size="sm">Open logs</Button>}
  title="Project status"
>
  <Badge color="success" label="Ready" />
</Card>;
```

### Native interaction and lazy engines

Drag interactions stay native while heavy engines load independently.

```tsx
<Draggable bind={position} bounds="parent">Move me</Draggable>

<Sortable bind={tasks} group="tasks">
  {tasks.map((task) => <article key={task.id}>{task.title}</article>)}
</Sortable>

<Chart type="line" data={chartData} />
<Editor value={content} onChange={setContent} />
```

### Use a private CDN

Set the base before rendering any lazy component.

```ts
globalThis.__LUON_CDN__ = "https://assets.example.com";

const { Editor } = await import("@luon/ui/editor");
```

### Build a validated form

Use View binding with UI controls and keep validation in Rule.

```tsx
export const data = {
  email: "",
  role: "member",
};

const Email = r.email(160).required();

export default () => <Card>
  <FormField label="Email">
    <Input bind={data.email} type="email" />
  </FormField>
  <Select bind={data.role} items={["member", "admin"]} />
  <Button disabled={!Email.safeParse(data.email).success}>Invite</Button>
</Card>;
```

### Render typed table data

Columns select raw row values. Native options enable only the controls you need.

```tsx
const columns = [
  { data: "name", title: "Name" },
  { data: "status", title: "Status" },
];

export default () => <Table
  columns={columns}
  options={{ pagination: true, pageSize: 5, search: true, sortable: true }}
  rows={data.users}
/>;
```

## API reference

### `Button / Input`

Primary controls exported by the package root.

### `Content and layout`

Text, Badge, Chip, Avatar, Card, Table, Empty, and ScrollArea.

### `Form controls`

Select, Checkbox, Slider, FormField, FileUpload, Tags, and ratings.

### `Navigation`

Link, Breadcrumb, Accordion, Tabs, Pagination, Stepper, and Timeline.

### `Overlays`

Modal, Drawer, Popover, Tooltip, Toast, and contextual menus.

### `Interaction`

Draggable, Sortable, Carousel, Marquee, Tree, and Calendar.

### `Chart`

Native SVG chart core with typed data, shared scales, legends, tooltips,
keyboard selection, live updates, and SVG export. `ChartSvg` is a compatibility
alias for the same component. `Chart` no longer downloads Chart.js.

Use `data={{ labels, datasets }}` or the shorter `values` / `series` props.
Types: line, area, bar, horizontal, stacked, mixed, pie, donut/doughnut,
radar, polarArea, scatter, and bubble. Numeric points use `{ x, y, r? }`;
`null` and non-finite values are gaps. Empty inputs show an empty state.
Pie/donut values are normalized by their total, not assumed to be percentages.
Negative radial values are unsupported; pie/donut/polarArea ignore them.

```tsx
<Chart
  type="bar"
  label="Monthly balance"
  data={{
    labels: ["Jan", "Feb", "Mar"],
    datasets: [
      { label: "Income", data: [80, 95, 110], borderColor: "#818cf8" },
      { label: "Costs", data: [-45, -55, -60], borderColor: "#fb7185" }
    ]
  }}
  stacked
  formatValue={(value) => `$${value}`}
/>
```

| Controls | Supported behavior |
| --- | --- |
| `height`, `axes`, `grid`, `points` | Responsive plot and compact sparklines |
| `legend`, `tooltip` | Series/slice toggles and shared value readout |
| `loading`, `empty` | Loading and empty content |
| `formatValue` | Value formatting for ticks and tooltips |
| `maxPoints` | Per-line-segment point budget; default 1000, minimum 4 |
| `onSelect` | Pointer or Enter/Space selection with series and point indices |
| `onReady` | Native `{ element, toSVG() }` handle after mount |

Core Chart.js-style options supported: `indexAxis` for bars; `cutout`;
`plugins.legend.display/position` (top/bottom); `plugins.tooltip.enabled`;
`interaction.mode` (index/nearest) and `intersect`; `scales.x/y` with
`display`, `min`, `max`, `beginAtZero`, `stacked`, axis titles and tick
formatters/limits. Numeric x coordinates use `scales.x.type: "linear"`.
Radars use `scales.r.min/max` (minimum is zero). Value-axis grid lines can be
hidden with `grid.display`. Dataset styles include color, fill, border width,
dash, point radius, stepped lines, bounded smoothing (`tension`), and gaps.

This is a focused API, not a Chart.js configuration interpreter. Version 0.8
replaces the old canvas wrapper: arbitrary plugins, animation settings,
log/time scales, multiple y axes, stack groups, zoom/pan and the Chart.js
instance API are not supported. `onReady` no longer returns a Chart.js object.
Supply new data through View live values instead of calling `update()`.
`ChartSvg` single-value donuts now represent totals; use `[72, 28]` for a
72% share. Smooth curves stay within neighboring values rather than matching
Chart.js tension interpolation exactly.

Dense line/area paths preserve endpoints and bucket extrema under `maxPoints`.
Original values remain available for selection and tooltips. Scatter, bubble,
bar and radial marks are not sampled. Benchmark large datasets for the target
device; native SVG does not imply faster rendering than canvas.

### `Table`

Native HTML table, also available from `@luon/ui/table`. All controls are opt-in:

```tsx
import { Table, type TableColumn } from "@luon/ui";

const columns: TableColumn[] = [
  { key: "name", title: "Name" },
  { key: "status", title: "Status", filter: ["Ready", "Pending"] },
  { key: "amount", title: "Amount", type: "number", align: "right",
    format: "number" },
];
const rows = [
  { id: "a", name: "Gateway", status: "Ready", amount: 120 },
  { id: "b", name: "Core", status: "Pending", amount: 80 },
];

<Table columns={columns} rows={rows} rowKey="id"
  options={{ search: true, sortable: true, filters: true,
    pagination: true, pageSize: 10, selection: true, columnToggle: true }} />
```

- `rows` (alias `data`) accepts an array or a View live value. Omit `columns`
  to infer keys and readable headings from the first row. JSON objects can
  configure all standard columns and options; no HTML strings are executed.
- Column `key` supports nested paths such as `user.name`. `data`, `accessorKey`,
  and `name` are key aliases; `label` and `header` are title aliases.
- Column `type: "number" | "date" | "text"` controls stable sorting. Missing or
  invalid values sort last in either direction. `value(row)` and `compare(a,b)`
  customize data access and sorting; `cell(row)` customizes rendered content.
  Search and sort use raw values, independently of cell markup.
- `format: "number" | "percent" | "date"` formats display values; `locale`
  selects the Intl locale. Dates should be ISO strings or Date instances.
- `sortable: false` and `searchable: false` exclude individual columns from
  those operations. `filter: true` enables text filtering; a string array
  creates exact-match choices when `options.filters` is enabled.
- `hidden`, `width`, and `align` configure columns. `options.columnToggle`
  lets readers change visibility. Hidden columns remain searchable unless
  `searchable: false` is set.
- Click a heading to cycle ascending, descending, and unsorted. Shift-click
  adds another sort column. Search matches all whitespace-separated words.
- `options.pagination` enables one-based pages. `pageSize` defaults to 10;
  `pageSizes` defaults to `[5, 10, 25, 50, 100]`. Search, filters, sorting, and
  page size reset to page 1. Client data changes clamp the displayed page.
- `query` is a controlled plain or live partial `TableQuery`:
  `{ search, filters, sort: [{ key, direction }], page, pageSize }`.
  Apply `onQueryChange(next)` to your state. Without `query`, the component
  owns state initialized by `defaultQuery`; callbacks still report changes.
- `manual` accepts one supplied page and a filtered `total`, skipping local
  sorting, filtering, and slicing. Fetch your data in `onQueryChange`, update
  `rows` and `total`, and use `loading` while waiting. Handle cancellation or
  stale responses in your data layer. Initial fetching belongs to the caller.
- `options.selection` requires a unique, stable string or number `rowKey`.
  Select-all applies to the displayed page. `selected` and
  `onSelectionChange(keys)` support controlled selection across pages.
  Selected keys persist until cleared by the caller, including removed rows.
- `density`, `striped`, `hover`, `caption`, `sticky`, and `height` shape the
  presentation. Use a bounded `height` for sticky scrolling. `loading`,
  `empty`, `slotLoading`, and `slotEmpty` cover data states; `ariaLabel`
  names the table and its keyboard-scrollable region.

The old `DataTable` export/subpath is a deprecated name alias for `Table`,
with no separate engine. Migrate old `pageLength` to `pageSize`, `paging` to
`pagination`, `searching` to `search`, and index-based `order` to a keyed
`defaultQuery.sort`. Native controls are opt-in. DataTables plugins, its
constructor API, automatic network requests, exports, and virtual rows are
outside this component. Old package versions that load the retired CDN
DataTables files must upgrade to 0.9.0 or later.

### `Draggable`

Native free placement with position binding.

### `Sortable`

Native sorting, groups, handles, hints, and motion.

### `Editor`

Tiptap content, toolbar, and extension wrapper.

### `CodeEditor`

CodeMirror languages, issues, search, and completion.

### `CDN loaders`

Resolve and cache modules, scripts, and styles.

### `Term and translation helpers`

Protect technical identifiers from browser translation.

## Runtime flow

1. Import the package stylesheet or use the Runtime-provided global setup.
2. Render a compiled View boundary with typed props.
3. The loader resolves the configured CDN base and versioned asset path.
4. The browser caches the immutable engine for later component mounts.

## Boundaries

- Use Site-owned View source when a component needs deep customization.
- A Site component with the same name replaces a global Luon component.
- Set __LUON_CDN__ before the first feature component is rendered.

## More documentation

- [UI and styling guide](https://docs.luon.dev/frontend/ui)
- [Live UI examples](https://ui.luon.dev)
- [CDN packages](https://cdn.luon.dev)

## License

[MIT](LICENSE) © predeve

## Input and overlay behavior

`FormField` connects its label, description, and error to child inputs. Use
`required` for native required state and `orientation="horizontal"` for a
responsive two-column field. Validation remains in Rule or the consuming page.

`InputNumber` emits `undefined` when cleared and respects `min`, `max`, `step`,
and `readOnly`. Tag entry ignores Enter while an IME composition is active.

`FileUpload` applies `accept`, `maxSize` (bytes), and `maxFiles` to both browsing
and dropping. Valid files replace the current selection; cancellation or a fully
rejected selection preserves it. Multiple mode emits `File[]`; single mode emits
`File | null`. `onReject` receives `{ file, reason }[]`, with `type`, `size`, or
`count` as the reason. `removable={false}` hides removal actions. `readOnly` and
`disabled` prevent changes. Send files and validate uploads in the consuming app.

Menus support arrow keys, Home/End, character navigation, and Escape/Tab to close.
Disabled links cannot navigate or run callbacks. Context menus also open with
Shift+F10. Dropdown placement accepts `align`, `side`, and `width`.

`Modal` and `Drawer` accept `size` (`sm`, `md`, `lg`, `xl`), `width`, and
`initialFocus` (a selector inside the dialog). They restore trigger focus by
default; set `restoreFocus={false}` to opt out. `dismissible={false}` blocks
Escape and backdrop dismissal while keeping explicit footer close actions usable.
Use `--ui-shadow-overlay` to customize popup and dialog shadows.

Calendar date-only strings use local calendar dates. Bounds compare whole days;
Today, Clear, disabled state, and read-only state use the same selection guards.
