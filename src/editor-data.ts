export type EditorMode = "rich" | "markdown" | "code";
export type EditorFormat = "html" | "markdown" | "text";
export type EditorLanguage =
  | "javascript"
  | "typescript"
  | "json"
  | "css"
  | "html"
  | "jsx"
  | "tsx"
  | "markdown"
  | "prisma"
  | "text";
export type CodeIssue = {
  from: number;
  to: number;
  message: string;
  severity: "error" | "hint" | "warning";
  rule?: string;
};
export type CodeSuggest = { apply?: string; label: string; type: string };
export type EditorOptions = {
  mode?: EditorMode;
  format?: EditorFormat;
  language?: EditorLanguage;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
  toolbar?: boolean | string[] | string[][];
  lineNumbers?: boolean;
  tabSize?: number;
  minHeight?: string | number;
  stickyToolbar?: boolean;
  theme?: "dark" | "light";
  file?: string;
  copy?: boolean;
  issues?: CodeIssue[];
  line?: number;
  jump?: number;
  onChange?: (value: string) => void;
  onSave?: () => void;
  onError?: (error: Error) => void;
  onSelection?: () => void;
  onConflict?: (option: string, reason: string) => void;
  suggest?: (value: {
    content: string;
    file: string;
    pos: number;
    signal: AbortSignal;
  }) => Promise<{ from: number; options: CodeSuggest[] }>;
};
export type EditorApi = {
  element: HTMLElement;
  input: HTMLTextAreaElement | HTMLDivElement;
  getValue(): string;
  getHTML(): string;
  getText(): string;
  setValue(value: string): void;
  update(options: Partial<EditorOptions>): void;
  focus(): void;
  destroy(): void;
  command(name: string, value?: unknown): boolean;
  isActive(name: string | { textAlign: string }, value?: any): boolean;
  select(from: number, to?: number): void;
  commands: { setContent(value: string, options?: unknown): void };
  chain(): Record<string, any>;
};
export type EditorHandle = { editor: EditorApi };

export function editorOptions(input: EditorOptions) {
  const conflict = (key: string, reason: string) => {
    if (input.onConflict) input.onConflict(key, reason);
    else if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(`[Luon Editor] Ignored ${key}: ${reason}`);
    }
  };
  let mode: EditorMode | undefined;
  let format: EditorFormat | undefined;
  const compatible = (m: EditorMode, f: EditorFormat) =>
    m === "code" || (m === "markdown" ? f === "markdown" : f !== "text");
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (key === "mode") {
      if (!["rich", "markdown", "code"].includes(value as string)) {
        throw new Error(`Unknown Editor mode: ${value}`);
      }
      if (!format || compatible(value as EditorMode, format)) {
        mode = value as EditorMode;
      } else conflict(key, `Earlier format '${format}' takes priority.`);
    }
    if (key === "format") {
      if (!["html", "markdown", "text"].includes(value as string)) {
        throw new Error(`Unknown Editor format: ${value}`);
      }
      if (!mode || compatible(mode, value as EditorFormat)) {
        format = value as EditorFormat;
      } else conflict(key, `Earlier mode '${mode}' takes priority.`);
    }
  }
  mode ??=
    format === "text" ? "code" : format === "markdown" ? "markdown" : "rich";
  format ??=
    mode === "rich" ? "html" : mode === "markdown" ? "markdown" : "text";
  return {
    ...input,
    mode,
    format,
    tabSize: Math.max(1, Math.min(8, Math.floor(input.tabSize || 2))),
  };
}

export function toolbarItems(input: string[] | string[][]) {
  const seen = new Set<string>();
  const groups = input.some(Array.isArray)
    ? (input as string[][])
    : [input as string[]];
  return groups
    .map((group) =>
      group.filter((name) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      }),
    )
    .filter((group) => group.length);
}
