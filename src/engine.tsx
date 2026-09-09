/** @jsxImportSource @luon/view */
import { effectView, liveView, state, untrackView } from "@luon/view";
import { createEditor } from "./editor-core.ts";
import type { EditorApi, EditorHandle, EditorOptions } from "./editor-data.ts";
import type { Live, UiProps } from "./types.ts";
import { change, read, valueOf } from "./util.ts";
export type { ChartProps } from "./chart-data.ts";
export type { ChartProps as ChartSvgProps } from "./chart-data.ts";
export { default as DataTable } from "./table.view.js";
export type {
  TableColumn as DataColumn,
  TableProps as DataTableProps,
} from "./table-data.ts";
export type {
  EditorApi,
  EditorHandle,
  CodeIssue,
  CodeSuggest,
} from "./editor-data.ts";
export { createEditor } from "./editor-core.ts";
export type EditorProps = UiProps &
  Omit<
    EditorOptions,
    "value" | "readOnly" | "theme" | "issues" | "line" | "jump"
  > & {
    value?: Live<string>;
    readOnly?: Live<boolean>;
    theme?: Live<"dark" | "light">;
    issues?: Live<EditorOptions["issues"]>;
    line?: Live<number>;
    jump?: Live<number>;
    ref?:
      { current: EditorHandle | null } | ((value: EditorHandle | null) => void);
    onReady?: (editor: EditorApi) => void;
  };
/** @deprecated Use Editor with mode="code". */
export type CodeEditorProps = EditorProps;
const ticks = new WeakMap<EditorApi, { version: number }>();
export function editorActive(editor: EditorApi | undefined, ...args: any[]) {
  return liveView(() => {
    if (editor) ticks.get(editor)?.version;
    return editor?.isActive(args[0], args[1]) || false;
  });
}
export function Editor(props: EditorProps) {
  const current = state({
    api: undefined as EditorApi | undefined,
    version: 0,
  });
  let api: EditorApi | undefined;
  const options = (): EditorOptions => {
    const next: Record<string, any> = {};
    // Preserve the caller's property order for first-declared conflict rules.
    for (const key of Object.keys(props)) {
      if (
        ["value", "readOnly", "theme", "issues", "line", "jump"].includes(key)
      ) {
        next[key] = read(props[key]);
      } else next[key] = props[key];
    }
    next.value = String(read(valueOf(props, "") as any) ?? "");
    next.minHeight = props.minHeight ?? (props.compact ? "8rem" : undefined);
    next.toolbar = typeof props.children === "function" ? false : props.toolbar;
    next.onChange = (value: string) => change(props, value);
    next.onSelection = () => {
      current.version++;
      props.onSelection?.();
    };
    return next;
  };
  const setRef = (value: EditorHandle | null) => {
    if (typeof props.ref === "function") props.ref(value);
    else if (props.ref) props.ref.current = value;
  };
  const connect = (host: Element | null) => {
    if (api) {
      ticks.delete(api);
      api.destroy();
      api = undefined;
    }
    current.api = undefined;
    setRef(null);
    if (!host) return;
    api = untrackView(() => createEditor(host as HTMLElement, options()));
    ticks.set(api, current);
    current.api = api;
    setRef({ editor: api });
    untrackView(() => props.onReady?.(api!));
  };
  effectView(() => {
    const next = options();
    // api is intentionally nonreactive: settings must not rebuild the editor.
    untrackView(() => api?.update(next));
  });
  const tools =
    typeof props.children === "function"
      ? liveView(() => (current.api ? props.children({ editor: api }) : null))
      : props.children;
  return (
    <div class="lui-editor-host">
      {tools ? (
        <div class="lui-editor-tools lui-editor-custom">{tools}</div>
      ) : null}
      <div ref={connect} />
    </div>
  );
}
/** @deprecated Use Editor with mode="code". */
export function CodeEditor(props: EditorProps) {
  return Editor({ mode: "code", ...props });
}
