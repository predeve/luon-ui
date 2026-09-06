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

Chart, DataTable, Editor, and CodeEditor import their CDN engine only when that component is first rendered.

### Site-owned theme

Components inherit --ui-* tokens and the Site font. Tailwind utilities can override the component layer.

### Global or explicit use

Official Sites receive components through Runtime registration; normal View applications import the same components directly.

## Quick reference

### Component families

Start with a family, then inspect its live variants on ui.luon.dev.

| Family | Common components |
| --- | --- |
| Content | Text, Badge, Avatar, Card, Table, Empty |
| Forms | Input, Select, Checkbox, Slider, FileUpload |
| Navigation | Breadcrumb, Tabs, Pagination, Stepper |
| Overlays | Modal, Drawer, Popover, Tooltip, Toast |
| Interaction | Draggable, Sortable, DropdownMenu, Tree |
| Data and editing | Chart, DataTable, Editor, CodeEditor |

### Engine-backed components

Only these features load a larger versioned browser engine.

| Component | Engine | Load point |
| --- | --- | --- |
| Chart | Chart.js | First Chart mount |
| DataTable | DataTables | First DataTable mount |
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
| Table | Density, stripes, hover, sticky header, caption, loading and empty |

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

const { Chart } = await import("@luon/ui/chart");
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

Columns select named row values and options pass to DataTables.

```tsx
const columns = [
  { data: "name", title: "Name" },
  { data: "status", title: "Status" },
];

export default () => <DataTable
  columns={columns}
  options={{ pageLength: 5, searching: true }}
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

Lazy Chart.js canvas wrapper and lifecycle.

### `DataTable`

Typed responsive DataTables wrapper.

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
