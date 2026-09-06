/** @jsxImportSource @luon/view */
import {
  effectView as effect,
  liveView as live,
  state,
  type Child,
} from "@luon/view";

import { Icon } from "./icon.view.js";
import { loadModule, loadStyle } from "./loader.ts";
import type { Live, UiProps } from "./types.ts";
import { change, $, read, valueOf } from "./util.ts";

type Clean = () => void;

function connect<ElementType extends Element>(
  run: (node: ElementType) => Promise<Clean | void>,
  status: { value: "error" | "loading" | "ready" },
) {
  let version = 0;
  let clean: Clean | void;
  return (node: Element | null) => {
    version++;
    clean?.();
    clean = undefined;
    if (!node) return;
    const current = version;
    status.value = "loading";
    queueMicrotask(() => {
      if (current !== version || !node.isConnected) return;
      void run(node as ElementType).then((dispose) => {
        if (current !== version || !node.isConnected) {
          dispose?.();
          return;
        }
        clean = dispose;
        status.value = "ready";
      }).catch(() => {
        if (current === version) status.value = "error";
      });
    });
  };
}

function stateText(status: { value: string }, name: string): Child {
  return live(() => status.value === "ready" ? null : <span class={$(
    "absolute inset-0 grid place-items-center text-sm",
    status.value === "error" && "$dangerText",
  )}>{status.value === "error" ? `${name} could not be loaded.`
    : `Loading ${name.toLowerCase()}…`}</span>);
}

type ChartApi = {
  data: unknown;
  destroy(): void;
  update(): void;
};
type ChartClass = new (
  canvas: HTMLCanvasElement,
  config: Record<string, unknown>,
) => ChartApi;

export type ChartProps = UiProps & {
  data: Live<unknown>;
  options?: Record<string, unknown>;
  type: string;
  onReady?: (chart: ChartApi) => void;
};

export function Chart(props: ChartProps) {
  const status = state({ value: "loading" as const }) as {
    value: "error" | "loading" | "ready";
  };
  const ref = connect<HTMLCanvasElement>(async (node) => {
    const module = await loadModule<{ default: ChartClass }>(
      "/ui/v2/chart.mjs",
    );
    const chart = new module.default(node, {
      data: read(props.data as any),
      options: {
        maintainAspectRatio: false,
        responsive: true,
        ...props.options,
      },
      type: props.type,
    });
    let initial = true;
    const stop = effect(() => {
      const data = read(props.data);
      if (initial) {
        initial = false;
        return;
      }
      chart.data = data;
      chart.update();
    });
    props.onReady?.(chart);
    return () => {
      stop();
      chart.destroy();
    };
  }, status);
  return <div
    class={"lui-chart relative min-h-48"}
    style={props.height ? { height: `${Number(props.height)}px` } : undefined}
  >
    <canvas
      aria-label={props.ariaLabel || props["aria-label"]}
      ref={ref}
      role="img"
    />
    {stateText(status, "Chart")}
  </div>;
}

export type ChartSvgProps = UiProps & {
  label?: string;
  labels?: string[];
  lineValues?: number[];
  series?: Array<{ color?: string; label?: string; values: number[] }>;
  type: "area" | "bar" | "donut" | "horizontal" | "line" | "mixed"
    | "pie" | "radar" | "scatter" | "stacked";
  value?: string;
  values?: Array<number | { x: number; y: number }>;
};

function nums(values: ChartSvgProps["values"]) {
  return (values || []).map((value) => typeof value === "number"
    ? value : value.y);
}

function linePoints(values: number[]) {
  const max = Math.max(1, ...values);
  const gap = 256 / Math.max(1, values.length - 1);
  return values.map((value, index) => (
    `${12 + index * gap},${132 - value / max * 104}`
  )).join(" ");
}

function ChartGrid() {
  return <g class="lui-chart-svg__grid">
    <path d="M12 38H268M12 76H268M12 114H268" />
  </g>;
}

export function ChartSvg(props: ChartSvgProps) {
  const values = nums(props.values).length
    ? nums(props.values) : [38, 56, 49, 72, 64, 88, 78];
  const labels = props.labels || values.map((_, index) => String(index + 1));
  const points = linePoints(values);
  const max = Math.max(1, ...values);
  const bars = values.map((value, index) => {
    const width = 220 / values.length;
    const height = value / max * 104;
    return <rect
      height={height}
      rx="5"
      width={Math.max(8, width - 9)}
      x={18 + index * width}
      y={138 - height}
    />;
  });
  const chart = props.type === "horizontal" ? <div
    class="lui-chart-svg__hbars"
  >{values.map((value, index) => <div>
      <span>{labels[index]}</span><i><b style={{ width: `${value}%` }} /></i>
      <em>{value}%</em>
    </div>)}</div> : props.type === "donut"
    ? <div class="lui-chart-svg__circle">
      <svg aria-label={props["aria-label"] || `${props.type} chart`}
        role="img" viewBox="0 0 120 120">
        <circle class="track" cx="60" cy="60" r="44" pathLength="100" />
        <circle class="value" cx="60" cy="60" r="44" pathLength="100"
          style={{ strokeDasharray: `${values[0] || 0} 100` }} />
      </svg>
      <b>{values[0]}%</b>
    </div> : props.type === "pie" ? <div class="lui-chart-svg__circle">
      <svg aria-label={props["aria-label"] || "Pie chart"}
        role="img" viewBox="0 0 120 120">
        {values.map((value, index) => <circle
          class={`slice series-${index}`}
          cx="60"
          cy="60"
          pathLength="100"
          r="25"
          style={{
            strokeDasharray: `${value} 100`,
            strokeDashoffset: `-${values.slice(0, index)
              .reduce((sum, item) => sum + item, 0)}`,
          }}
        />)}
      </svg>
    </div> : props.type === "radar" ? <svg
      aria-label={props["aria-label"] || "Radar chart"}
      class="lui-chart-svg__radar"
      role="img"
      viewBox="0 0 220 170"
    >
      <g class="grid">
        <polygon points="110,18 190,62 174,145 46,145 30,62" />
        <polygon points="110,42 164,72 153,126 67,126 56,72" />
        <polygon points="110,66 139,82 132,108 88,108 81,82" />
      </g>
      <polygon class="value" points={values.slice(0, 5).map(
        (value, index) => {
          const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
          const radius = Math.min(100, value) / 100 * 76;
          return `${110 + Math.cos(angle) * radius},`
            + `${88 + Math.sin(angle) * radius}`;
        },
      ).join(" ")} />
    </svg> : props.type === "scatter" ? <svg
      aria-label={props["aria-label"] || "Scatter chart"}
      class="lui-chart-svg__plot"
      role="img"
      viewBox="0 0 280 150"
    ><ChartGrid /><g class="scatter">{(props.values || []).map(
      (value, index) => {
        const point = typeof value === "number"
          ? { x: 12 + index * 40, y: value } : value;
        return <circle
          cx={12 + Math.min(100, point.x) / 100 * 256}
          cy={138 - Math.min(100, point.y) / 100 * 112}
          r={4 + index % 3}
        />;
      },
    )}</g><path class="trend" d="M20 124L264 32" /></svg>
    : props.type === "stacked" ? <svg
      aria-label={props["aria-label"] || "Stacked chart"}
      class="lui-chart-svg__plot"
      role="img"
      viewBox="0 0 280 150"
    ><g class="stacks">{(props.series || []).flatMap((series, row) => (
        series.values.map((value, index) => <rect
          class={`series-${row}`}
          height={value}
          rx="4"
          width="28"
          x={28 + index * 48}
          y={138 - value - (props.series || []).slice(0, row)
            .reduce((sum, item) => sum + Number(item.values[index] || 0), 0)}
        />)
      ))}</g></svg> : <svg
      aria-label={props["aria-label"] || `${props.type} chart`}
      class="lui-chart-svg__plot"
      role="img"
      viewBox="0 0 280 150"
    ><ChartGrid />
      {props.type === "bar" || props.type === "mixed"
        ? <g class="bars">{bars}</g> : null}
      {props.type === "area" ? <path
        class="area"
        d={`M${points.replaceAll(" ", "L")}L268,138L12,138Z`}
      /> : null}
      {props.type === "line" || props.type === "area"
        ? <polyline class="line" points={points} /> : null}
      {props.type === "mixed" ? <polyline
        class="line alt"
        points={linePoints(props.lineValues || values)}
      /> : null}
    </svg>;
  return <section class={$(
    "lui-chart-svg grid gap-3 $radius border $line $bg p-4",
  )}>
    {props.label || props.value ? <header>
      <span>{props.label}</span><b>{props.value}</b>
    </header> : null}
    {chart}
  </section>;
}

export type DataColumn<Row = Record<string, unknown>> = {
  data?: keyof Row | string;
  key?: keyof Row | string;
  name?: string;
  title: string;
};

export type DataTableProps<Row = Record<string, unknown>> = UiProps & {
  columns: DataColumn<Row>[];
  options?: Record<string, unknown>;
  rows: Live<Row[]>;
};

type TableApi = {
  clear(): TableApi;
  destroy(remove?: boolean): void;
  draw(reset?: boolean): TableApi;
  rows: { add(rows: unknown[]): TableApi };
};
type TableClass = new (
  table: HTMLTableElement,
  options: Record<string, unknown>,
) => TableApi;

export function DataTable<Row = Record<string, unknown>>(
  props: DataTableProps<Row>,
) {
  const status = state({ value: "loading" as const }) as {
    value: "error" | "loading" | "ready";
  };
  const ref = connect<HTMLTableElement>(async (node) => {
    const [, module] = await Promise.all([
      loadStyle("/ui/v2/data-table.css"),
      loadModule<{ default: TableClass }>("/ui/v2/data-table.mjs"),
    ]);
    const table = new module.default(node, {
      columns: props.columns.map((column) => ({
        ...column,
        data: String(column.data ?? column.key ?? column.name ?? ""),
      })),
      data: read(props.rows),
      lengthMenu: [5, 10, 25, 50, 100],
      responsive: true,
      ...props.options,
    });
    let initial = true;
    const stop = effect(() => {
      const rows = [...read(props.rows)];
      if (initial) {
        initial = false;
        return;
      }
      table.clear();
      table.rows.add(rows).draw(false);
    });
    return () => {
      stop();
      table.destroy();
    };
  }, status);
  return <div class={"lui-data-table relative min-h-32"}>
    <table class="display" ref={ref} />
    {stateText(status, "Data table")}
  </div>;
}

export type EditorApi = {
  commands: {
    setContent(value: string, options?: Record<string, unknown>): void;
  };
  chain?: () => Record<string, any>;
  destroy(): void;
  getHTML(): string;
  isActive?: (...args: any[]) => boolean;
};

export type EditorHandle = { editor: EditorApi };
export type EditorProps = UiProps & {
  disabled?: boolean;
  extensions?: unknown[];
  onChange?: (value: string) => void;
  onReady?: (editor: EditorApi) => void;
  placeholder?: string;
  ref?: HandleRef;
  value?: Live<string>;
};
type EditorClass = new (options: Record<string, unknown>) => EditorApi;
type HandleRef = {
  current: EditorHandle | null;
} | ((value: EditorHandle | null) => void);

const editorTicks = new WeakMap<EditorApi, { version: number }>();

export function editorActive(editor: EditorApi | undefined, ...args: any[]) {
  return live(() => {
    if (editor) editorTicks.get(editor)?.version;
    return editor?.isActive?.(...args) || false;
  });
}

function setRef(ref: HandleRef | undefined, value: EditorHandle | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

const editorTools = [
  ["undo", "undo-2", "Undo"],
  ["redo", "redo-2", "Redo"],
  ["bold", "bold", "Bold"],
  ["italic", "italic", "Italic"],
  ["strike", "strikethrough", "Strike"],
  ["bulletList", "list", "Bullet list"],
  ["orderedList", "list-ordered", "Numbered list"],
  ["blockquote", "quote", "Quote"],
  ["codeBlock", "code-2", "Code block"],
] as const;

function EditorTools({ editor }: { editor?: EditorApi }) {
  const run = (name: string) => {
    const chain = editor?.chain?.();
    if (!chain) return;
    const action = name === "undo" || name === "redo"
      ? chain.focus?.()[name]?.()
      : chain.focus?.()[`toggle${name[0]!.toUpperCase()}${name.slice(1)}`]?.();
    action?.run?.();
  };
  return <>{editorTools.map(([name, icon, label], index) => <span
    class={$("inline-flex", (index === 2 || index === 5)
      && "ml-1 border-l $line pl-1")}
  >
    <button
      aria-label={label}
      aria-pressed={editorActive(editor, name)}
      class={$(
        "grid size-8 place-items-center rounded",
        "$hoverSoft disabled:opacity-30",
      )}
      disabled={!editor}
      title={label}
      type="button"
      onClick={() => run(name)}
      onMouseDown={(event: Event) => event.preventDefault()}
    ><Icon name={icon} /></button>
  </span>)}</>;
}

export function Editor(props: EditorProps) {
  const status = state({ value: "loading" as const }) as {
    value: "error" | "loading" | "ready";
  };
  const current = state({
    value: undefined as EditorApi | undefined,
    version: 0,
  });
  const reference = props.ref as HandleRef | undefined;
  const ref = connect<HTMLDivElement>(async (node) => {
    const module = await loadModule<{
      Editor: EditorClass;
      Placeholder?: { configure(options: unknown): unknown };
      StarterKit: unknown;
    }>("/ui/v2/rich-editor.mjs");
    const extensions = [module.StarterKit, ...(props.extensions || [])];
    if (props.placeholder && module.Placeholder) {
      extensions.push(module.Placeholder.configure({
        placeholder: props.placeholder,
      }));
    }
    const editor = new module.Editor({
      content: read(valueOf(props, "") as any),
      editable: !props.disabled,
      element: node,
      extensions,
      onUpdate: ({ editor }: { editor: EditorApi }) => {
        change(props, editor.getHTML());
        current.version++;
      },
      onSelectionUpdate: () => current.version++,
      ...props.options,
    });
    editorTicks.set(editor, current);
    current.value = editor;
    current.version++;
    const stop = effect(() => {
      const value = String(read(valueOf(props, "") as any) || "");
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    });
    setRef(reference, { editor });
    props.onReady?.(editor);
    if (props.autofocus) queueMicrotask(() => {
      editor.chain?.().focus?.().run?.();
    });
    return () => {
      stop();
      current.value = undefined;
      current.version++;
      editorTicks.delete(editor);
      setRef(reference, null);
      editor.destroy();
    };
  }, status);
  const tools = typeof props.children === "function" ? live(() => {
    return current.value ? props.children({ editor: current.value }) : null;
  }) : props.children || props.toolbar === false ? props.children : live(() => {
    return <EditorTools editor={current.value} />;
  });
  return <div class={$(
    "lui-editor relative min-h-48 overflow-hidden",
    "$radius border $line",
    "$bg",
    props.compact && "min-h-32",
  )}>
    {tools ? <div class={$(
      "lui-editor-tools flex flex-wrap gap-1 border-b",
      "$line $soft px-2 py-1",
      props.stickyToolbar && "sticky top-0 z-10",
    )}>{tools}</div>
      : null}
    <div
      class={$("lui-editor-body", props.compact ? "min-h-32" : "min-h-48")}
      ref={ref}
      style={props.minHeight ? { minHeight: props.minHeight } : undefined}
    />
    {stateText(status, "Editor")}
  </div>;
}

type CodeView = {
  dispatch(value: unknown): void;
  destroy(): void;
  focus(): void;
  state: {
    doc: {
      length: number;
      line(value: number): { from: number };
      lines: number;
      toString(): string;
    };
    sliceDoc(from: number, to: number): string;
  };
};

type CompleteContext = {
  aborted: boolean;
  explicit: boolean;
  pos: number;
  state: CodeView["state"];
  addEventListener(name: "abort", run: () => void): void;
  matchBefore(pattern: RegExp): { from: number; text: string } | null;
};

const codeFile = /\.(?:[cm]?[jt]sx?|vue)$/;
const completeTypes: Record<string, string> = {
  alias: "variable",
  class: "class",
  const: "constant",
  enum: "enum",
  function: "function",
  interface: "interface",
  keyword: "keyword",
  let: "variable",
  method: "method",
  module: "namespace",
  property: "property",
  type: "type",
  var: "variable",
};

export type CodeIssue = {
  from: number;
  message: string;
  rule?: string;
  severity: "error" | "hint" | "warning";
  to: number;
};

export type CodeSuggest = {
  apply?: string;
  label: string;
  type: string;
};

export type CodeEditorProps = UiProps & {
  copy?: boolean;
  file?: string;
  issues?: Live<CodeIssue[]>;
  jump?: Live<number>;
  language?: "css" | "html" | "javascript" | "json" | "prisma"
    | "typescript";
  line?: Live<number>;
  onChange?: (value: string) => void;
  onSave?: () => void;
  readOnly?: Live<boolean>;
  suggest?: (value: {
    content: string;
    file: string;
    pos: number;
    signal?: AbortSignal;
  }) => Promise<{ from: number; options: CodeSuggest[] }>;
  theme?: Live<"dark" | "light">;
  value?: Live<string>;
};

function codeTheme(module: Record<string, any>, dark: boolean) {
  const base = dark ? {
    bg: "#0d1822",
    border: "#263a49",
    cursor: "#5eead4",
    gutter: "#718397",
    line: "#132431",
    select: "#21464d",
    text: "#d8e2ec",
  } : {
    bg: "#fbfdff",
    border: "#d9e3e9",
    cursor: "#087f8c",
    gutter: "#7a8993",
    line: "#eef4f7",
    select: "#cce9e9",
    text: "#1d2c35",
  };
  const surface = module.EditorView.theme({
    "&": {
      backgroundColor: base.bg,
      color: base.text,
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: base.select,
    },
    ".cm-activeLine": {
      backgroundColor: base.line,
    },
    ".cm-activeLineGutter": {
      backgroundColor: base.line,
      color: base.text,
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: base.cursor,
    },
    ".cm-gutters": {
      backgroundColor: base.bg,
      borderRight: `1px solid ${base.border}`,
      color: base.gutter,
    },
    ".cm-matchingBracket": {
      backgroundColor: base.select,
      outline: `1px solid ${base.cursor}`,
    },
    ".cm-scroller": {
      fontFamily: "Lilex, ui-monospace, SFMono-Regular, Menlo, monospace",
      lineHeight: "1.6",
    },
  }, { dark });
  return dark ? [module.oneDark, surface] : surface;
}

function codeDark(node: HTMLElement, props: CodeEditorProps) {
  const value = read(props.theme as any);
  if (value) return value === "dark";
  return Boolean(node.closest('[data-theme="dark"], .lui-dark'));
}

export function CodeEditor(props: CodeEditorProps) {
  const status = state({ value: "loading" as const }) as {
    value: "error" | "loading" | "ready";
  };
  const current = state({
    copied: false,
    error: false,
    view: undefined as CodeView | undefined,
  });
  const copy = async () => {
    try {
      const value = current.view?.state.doc.toString()
        || String(read(valueOf(props, "") as any) || "");
      await navigator.clipboard.writeText(value);
      current.copied = true;
      setTimeout(() => current.copied = false, 1_200);
    } catch {
      current.error = true;
      setTimeout(() => current.error = false, 1_800);
    }
  };
  const ref = connect<HTMLDivElement>(async (node) => {
    const module = await loadModule<Record<string, any>>(
      "/ui/v2/code-editor.mjs",
    );
    const language = props.language || "javascript";
    const languageExt = language === "css" ? module.css()
      : language === "html" ? module.html()
        : language === "json" ? module.json()
          : language === "prisma" ? module.prisma()
            : module.javascript({
              jsx: /\.[jt]sx$/.test(props.file || ""),
              typescript: language === "typescript",
            });
    const update = module.EditorView.updateListener.of((value: any) => {
      if (value.docChanged) change(props, value.state.doc.toString());
    });
    const complete = async (context: CompleteContext) => {
      if (!props.suggest || !props.file || !codeFile.test(props.file)) {
        return null;
      }
      const word = context.matchBefore(/[\w$]*$/);
      if (!word) return null;
      const dot = context.state.sliceDoc(word.from - 1, word.from) === ".";
      if (!context.explicit && !dot && !word.text) return null;
      const abort = new AbortController();
      context.addEventListener("abort", () => abort.abort());
      try {
        const result = await props.suggest({
          content: context.state.doc.toString(),
          file: props.file,
          pos: context.pos,
          signal: abort.signal,
        });
        if (context.aborted || abort.signal.aborted) return null;
        return {
          from: Math.min(result.from, context.pos),
          options: result.options.map((item) => ({
            apply: item.apply || item.label,
            label: item.label,
            type: completeTypes[item.type] || "text",
          })),
          validFor: /^[\w$]*$/,
        };
      } catch {
        return null;
      }
    };
    const readonly = (value: boolean) => [
      module.EditorState.readOnly.of(value),
      module.EditorView.editable.of(!value),
    ];
    const access = new module.Compartment();
    const theme = new module.Compartment();
    const readOnly = Boolean(read(props.readOnly as any));
    const dark = codeDark(node, props);
    const extensions = [
      module.basicSetup,
      languageExt,
      update,
      module.lintGutter(),
      access.of(readonly(readOnly)),
      theme.of(codeTheme(module, dark)),
      module.keymap.of([{
        key: "Tab",
        run: module.insertTab,
        shift: module.indentLess,
      }, {
        key: "Mod-s",
        preventDefault: true,
        run: () => {
          if (!Boolean(read(props.readOnly as any))) props.onSave?.();
          return true;
        },
      }]),
      module.autocompletion({
        activateOnTyping: true,
        activateOnTypingDelay: 120,
      }),
      module.EditorState.languageData.of(() => [{
        autocomplete: complete,
      }, {
        autocomplete: module.completeAnyWord,
      }]),
      module.EditorView.lineWrapping,
    ];
    const editor = new module.EditorView({
      parent: node,
      state: module.EditorState.create({
        doc: read(valueOf(props, "") as any),
        extensions,
      }),
    }) as CodeView;
    current.view = editor;
    const stop = effect(() => {
      const value = String(read(valueOf(props, "") as any) || "");
      if (editor.state.doc.toString() === value) return;
      editor.dispatch({
        changes: { from: 0, insert: value, to: editor.state.doc.length },
      });
    });
    let firstAccess = true;
    const stopAccess = effect(() => {
      const value = Boolean(read(props.readOnly as any));
      if (firstAccess) {
        firstAccess = false;
        return;
      }
      editor.dispatch({
        effects: access.reconfigure(readonly(value)),
      });
    });
    let firstTheme = true;
    const stopTheme = effect(() => {
      const value = codeDark(node, props);
      if (firstTheme) {
        firstTheme = false;
        return;
      }
      editor.dispatch({
        effects: theme.reconfigure(codeTheme(module, value)),
      });
    });
    const stopIssues = effect(() => {
      const issues = read(props.issues as any) || [];
      const max = editor.state.doc.length;
      editor.dispatch(module.setDiagnostics(
        editor.state,
        issues.map((item: CodeIssue) => ({
          from: Math.min(item.from, max),
          markClass: item.severity === "hint" ? "cm-unused" : undefined,
          message: item.message,
          severity: item.severity,
          source: item.rule ? `Oxlint · ${item.rule}` : "Oxlint",
          to: Math.min(Math.max(item.from, item.to), max),
        })),
      ));
    });
    const stopLine = effect(() => {
      read(props.jump as any);
      const value = Number(read(props.line as any));
      if (!value) return;
      const line = editor.state.doc.line(Math.min(
        value,
        editor.state.doc.lines,
      ));
      editor.dispatch({
        effects: module.EditorView.scrollIntoView(line.from, {
          y: "center",
        }),
        selection: { anchor: line.from },
      });
      editor.focus();
    });
    props.onReady?.(editor);
    return () => {
      stop();
      stopAccess();
      stopTheme();
      stopIssues();
      stopLine();
      current.view = undefined;
      editor.destroy();
    };
  }, status);
  return <section class={$(
    "lui-code notranslate relative min-h-64 overflow-hidden",
    "$radius",
    "border $line $bg",
  )} data-luon-code="" translate="no">
    <header class={$(
      "flex min-h-10 items-center justify-between gap-3 border-b",
      "$line $soft px-3 text-xs",
    )}>
      <span class="inline-flex items-center gap-2 font-medium">
        <i class={$("size-2 rounded-full $primaryBg")} />
        {props.language || "javascript"}
      </span>
      {props.copy === false ? null : <button
        class="inline-flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/60"
        type="button"
        onClick={() => void copy()}
      >{live(() => <><Icon name={current.copied ? "check" : "copy"} />
        {current.copied ? "Copied" : "Copy"}</>)}</button>}
    </header>
    <div class="h-full min-h-64" ref={ref} />
    {stateText(status, "Code editor")}
    {live(() => current.error ? <span
      class={$(
        "absolute bottom-3 right-3 rounded bg-[var(--lui-danger)]",
        "px-3 py-2 text-xs text-[var(--lui-on-danger)] shadow",
      )}
      role="status"
    >Clipboard access failed.</span> : null)}
  </section>;
}
