import {
  editorOptions,
  toolbarItems,
  type EditorApi,
  type EditorOptions,
  type CodeSuggest,
} from "./editor-data.ts";
import { cleanHTML, fromMarkdown, toMarkdown } from "./editor-markdown.ts";
import { escapeText, highlight } from "./editor-syntax.ts";
import {
  restoreMark,
  richActive,
  richCommand,
  selectionMark,
  type SelectionMark,
} from "./editor-rich.ts";
export * from "./editor-data.ts";

type Snapshot = {
  value: string;
  html: string;
  from: number;
  to: number;
  mark: SelectionMark;
};
const labels: Record<string, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  heading: "Heading",
  paragraph: "Paragraph",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  blockquote: "Quote",
  codeBlock: "Code block",
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Justify",
  undo: "Undo",
  redo: "Redo",
  link: "Link",
  copy: "Copy",
  search: "Find",
  preview: "Preview",
  source: "Source",
  rich: "Rich",
};
const glyphs: Record<string, string> = {
  close: "×",
  bold: "B",
  italic: "I",
  underline: "U",
  strike: "S",
  heading: "H2",
  paragraph: "¶",
  bulletList: "• List",
  orderedList: "1. List",
  blockquote: "❞",
  codeBlock: "</>",
  undo: "↶",
  redo: "↷",
};
const defaults = [
  ["undo", "redo"],
  ["heading", "paragraph"],
  ["bold", "italic", "underline", "strike", "link"],
  ["bulletList", "orderedList", "blockquote", "codeBlock"],
  ["left", "center", "right"],
  ["source"],
];

/** Framework-independent DOM core shared by View and React hosts. */
export function createEditor(
  host: HTMLElement,
  input: EditorOptions = {},
): EditorApi {
  let options = editorOptions(input);
  const doc = host.ownerDocument;
  let disposed = false;
  let composing = false;
  let queued: string | undefined;
  let view = options.mode === "rich" ? "rich" : "source";
  let value = options.value || "";
  const unsupported = (text: string) =>
    /!\[|^\s*\|.*\||^\s*[-*] \[[ x]\]|^\[\^/m.test(text);
  if (view === "rich" && options.format === "markdown" && unsupported(value)) {
    throw new Error(
      "This Markdown requires source mode to preserve its blocks.",
    );
  }
  let mark: SelectionMark;
  let lastKind = "";
  let lastTime = 0;
  const undo: Snapshot[] = [];
  const redo: Snapshot[] = [];
  let before: Snapshot | undefined;
  let abort: AbortController | undefined;
  let suggestTimer: ReturnType<typeof setTimeout> | undefined;
  let suggestions:
    | {
        from: number;
        pos: number;
        content: string;
        options: CodeSuggest[];
        index: number;
      }
    | undefined;
  const cleanups: (() => void)[] = [];
  const node = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = "") => {
    const el = doc.createElement(tag);
    el.className = cls;
    return el;
  };
  const root = node("section", "lui-editor");
  const tools = node("div", "lui-editor-tools");
  tools.setAttribute("role", "toolbar");
  tools.setAttribute("aria-label", "Editor tools");
  const search = node("div", "lui-editor-search");
  search.hidden = true;
  const query = node("input");
  query.placeholder = "Find";
  query.setAttribute("aria-label", "Find text");
  const replacement = node("input");
  replacement.placeholder = "Replace with";
  replacement.setAttribute("aria-label", "Replacement text");
  const searchResult = node("span");
  searchResult.setAttribute("role", "status");
  const body = node("div", "lui-editor-body");
  const rich = node("div", "lui-editor-rich");
  rich.setAttribute("role", "textbox");
  rich.setAttribute("aria-multiline", "true");
  const source = node("div", "lui-editor-source");
  const gutter = node("pre", "lui-editor-gutter");
  gutter.setAttribute("aria-hidden", "true");
  const code = node("div", "lui-editor-code");
  const paint = node("pre", "lui-editor-paint");
  paint.setAttribute("aria-hidden", "true");
  const area = node("textarea", "lui-editor-input");
  area.spellcheck = false;
  area.wrap = "off";
  area.autocomplete = "off";
  area.autocapitalize = "off";
  area.setAttribute("translate", "no");
  area.classList.add("notranslate");
  area.setAttribute(
    "aria-description",
    "Press Escape then Tab to leave the editor.",
  );
  const preview = node("div", "lui-editor-preview");
  const issues = node("div", "lui-editor-issues");
  const suggest = node("div", "lui-editor-suggest");
  suggest.hidden = true;
  suggest.setAttribute("role", "listbox");
  suggest.id = `lui-suggest-${Math.random().toString(36).slice(2)}`;
  const notice = node("div", "lui-editor-notice");
  notice.setAttribute("role", "status");
  const linkBox = node("div", "lui-editor-search");
  linkBox.hidden = true;
  const linkInput = node("input");
  linkInput.placeholder = "https://example.com";
  linkInput.setAttribute("aria-label", "Link URL");
  code.append(paint, area);
  source.append(gutter, code);
  body.append(rich, source, preview, suggest);
  root.append(tools, search, linkBox, body, issues, notice);
  host.append(root);
  const listen = (el: EventTarget, name: string, run: (event: any) => void) => {
    el.addEventListener(name, run);
    cleanups.push(() => el.removeEventListener(name, run));
  };
  const fail = (error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    notice.textContent = err.message;
    options.onError?.(err);
  };
  const writable = () => !disposed && !options.readOnly && !options.disabled;
  const html = () => cleanHTML(rich.innerHTML.replaceAll("\u200b", ""), doc);
  const asHTML = () =>
    options.format === "markdown"
      ? fromMarkdown(value, doc)
      : options.format === "html"
        ? cleanHTML(value, doc)
        : `<pre><code>${escapeText(value)}</code></pre>`;
  const snapshot = (): Snapshot => ({
    value,
    html: rich.innerHTML,
    from: area.selectionStart,
    to: area.selectionEnd,
    mark: selectionMark(rich) || mark,
  });
  const remember = (saved: Snapshot, kind: string) => {
    const now = Date.now();
    if (kind !== "typing" || lastKind !== kind || now - lastTime > 700) {
      undo.push(saved);
      while (
        undo.length > 80 ||
        (undo.length > 1 &&
          undo.reduce(
            (n, item) => n + item.value.length + item.html.length,
            0,
          ) > 4_000_000)
      )
        undo.shift();
    }
    redo.length = 0;
    lastKind = kind;
    lastTime = now;
  };
  const syncPaint = () => {
    const language =
      options.mode === "code"
        ? options.language || "javascript"
        : options.format === "html"
          ? "html"
          : "markdown";
    paint.innerHTML = highlight(area.value, language) + "\n";
    gutter.textContent = Array.from(
      { length: area.value.split("\n").length },
      (_, i) => String(i + 1),
    ).join("\n");
    paint.scrollTop = area.scrollTop;
    paint.scrollLeft = area.scrollLeft;
    gutter.scrollTop = area.scrollTop;
  };
  const active = (name: string, arg?: unknown) => {
    if (name === "undo") return !!undo.length;
    if (name === "redo") return !!redo.length;
    if (view !== "rich") return false;
    return richActive(rich, name, arg);
  };
  const syncTools = () => {
    for (const button of Array.from(tools.querySelectorAll("button"))) {
      const name = button.dataset.command!;
      const navigation = [
        "source",
        "rich",
        "preview",
        "search",
        "copy",
      ].includes(name);
      button.disabled =
        options.disabled ||
        (!navigation && !writable()) ||
        (name === "undo" && !undo.length) ||
        (name === "redo" && !redo.length);
      const align = ["left", "center", "right", "justify"].includes(name);
      button.setAttribute(
        "aria-pressed",
        String(
          align
            ? active("align", name)
            : ["rich", "source", "preview"].includes(name)
              ? view === name
              : active(name, name === "heading" ? { level: 2 } : undefined),
        ),
      );
    }
  };
  const changed = (saved: Snapshot, kind = "command") => {
    const next =
      view === "rich"
        ? options.format === "markdown"
          ? toMarkdown(html(), doc)
          : html()
        : area.value;
    if (next === value) {
      syncTools();
      return;
    }
    remember(saved, kind);
    value = next;
    mark = selectionMark(rich) || mark;
    syncTools();
    options.onChange?.(value);
  };
  const restore = (saved: Snapshot) => {
    value = saved.value;
    area.value = value;
    rich.innerHTML = saved.html;
    mark = saved.mark;
    syncPaint();
    focus();
    area.setSelectionRange(saved.from, saved.to);
    if (view === "rich") restoreMark(rich, mark);
    syncTools();
    options.onChange?.(value);
  };
  const closeSuggest = () => {
    abort?.abort();
    clearTimeout(suggestTimer);
    suggestions = undefined;
    suggest.hidden = true;
    suggest.replaceChildren();
    area.removeAttribute("aria-activedescendant");
    area.removeAttribute("aria-controls");
    area.removeAttribute("aria-expanded");
  };
  const focus = () => {
    if (options.disabled || disposed) return;
    if (view === "rich") {
      rich.focus();
      restoreMark(rich, mark);
    } else area.focus();
  };
  const select = (from: number, to = from) => {
    if (view === "rich") return;
    focus();
    area.setSelectionRange(Math.max(0, from), Math.max(0, to));
    const row = area.value.slice(0, from).split("\n").length - 1;
    area.scrollTop = Math.max(0, row * 24 - area.clientHeight / 2);
    syncPaint();
  };
  const replace = (
    text: string,
    from = area.selectionStart,
    to = area.selectionEnd,
  ) => {
    if (!writable() || composing) return;
    const saved = snapshot();
    closeSuggest();
    area.setRangeText(text, from, to, "end");
    syncPaint();
    changed(saved);
  };
  const find = (reverse = false) => {
    const needle = query.value;
    if (!needle) {
      searchResult.textContent = "Enter search text";
      return false;
    }
    const start = reverse ? area.selectionStart - 1 : area.selectionEnd;
    let at = reverse
      ? value.lastIndexOf(needle, start)
      : value.indexOf(needle, start);
    if (at < 0)
      at = reverse ? value.lastIndexOf(needle) : value.indexOf(needle);
    const count = value.split(needle).length - 1;
    searchResult.textContent = `${count} match${count === 1 ? "" : "es"}`;
    if (at < 0) return false;
    select(at, at + needle.length);
    return true;
  };
  const button = (
    name: string,
    run: () => void,
    label = labels[name] || name,
  ) => {
    const el = node("button");
    el.type = "button";
    el.textContent = glyphs[name] || label;
    el.title = label;
    el.setAttribute("aria-label", label);
    el.dataset.command = name;
    el.addEventListener("mousedown", (event) => event.preventDefault());
    el.addEventListener("click", run);
    return el;
  };
  search.append(
    query,
    replacement,
    button("previous", () => find(true), "Previous match"),
    button("next", () => find(), "Next match"),
    button(
      "replace",
      () => {
        if (
          value.slice(area.selectionStart, area.selectionEnd) === query.value &&
          query.value
        )
          replace(replacement.value);
        find();
      },
      "Replace",
    ),
    button(
      "replaceAll",
      () => {
        if (!query.value) return;
        replace(
          value.split(query.value).join(replacement.value),
          0,
          value.length,
        );
      },
      "Replace all",
    ),
    searchResult,
    button(
      "close",
      () => {
        search.hidden = true;
        focus();
      },
      "Close search",
    ),
  );
  linkBox.append(
    linkInput,
    button(
      "apply",
      () => {
        focus();
        if (command("link", linkInput.value)) linkBox.hidden = true;
      },
      "Apply link",
    ),
    button(
      "cancel",
      () => {
        linkBox.hidden = true;
        focus();
      },
      "Cancel",
    ),
  );
  const switchView = (next: string) => {
    if (composing || options.mode === "code") return false;
    closeSuggest();
    if (
      next === "rich" &&
      options.format === "markdown" &&
      unsupported(value)
    ) {
      fail(
        new Error(
          "This Markdown uses unsupported rich blocks. Continue in Source.",
        ),
      );
      return false;
    }
    if (next === "rich" || next === "preview") {
      const content = asHTML();
      if (next === "rich") rich.innerHTML = content;
      else preview.innerHTML = content;
    } else {
      area.value = value;
      syncPaint();
    }
    view = next;
    lastKind = "";
    mark = undefined;
    rich.hidden = next !== "rich";
    source.hidden = next !== "source";
    preview.hidden = next !== "preview";
    search.hidden = true;
    buildTools();
    focus();
    return true;
  };
  function command(name: string, arg?: any): boolean {
    if (disposed || composing) return false;
    if (["source", "rich", "preview"].includes(name)) return switchView(name);
    if (name === "copy") {
      const clip = doc.defaultView?.navigator.clipboard;
      if (!clip?.writeText) {
        fail(new Error("Clipboard access is unavailable."));
        return false;
      }
      void clip
        .writeText(value)
        .then(() => {
          if (!disposed) notice.textContent = "Copied";
        })
        .catch(fail);
      return true;
    }
    if (name === "search") {
      if (view !== "source") switchView("source");
      search.hidden = false;
      query.focus();
      return true;
    }
    if (!writable() || view === "preview") return false;
    if (name === "undo" || name === "redo") {
      const source = name === "undo" ? undo : redo;
      const target = name === "undo" ? redo : undo;
      const saved = source.pop();
      if (!saved) return false;
      target.push(snapshot());
      lastKind = "";
      closeSuggest();
      restore(saved);
      return true;
    }
    if (name === "link" && arg == null) {
      mark = selectionMark(rich) || mark;
      linkBox.hidden = false;
      linkInput.focus();
      return true;
    }
    focus();
    const saved = snapshot();
    if (view === "source") {
      if (options.format !== "markdown") return false;
      const from = area.selectionStart;
      const to = area.selectionEnd;
      const text = value.slice(from, to) || "text";
      const wraps: Record<string, string> = {
        bold: "**",
        italic: "*",
        strike: "~~",
        code: "`",
      };
      if (wraps[name]) replace(wraps[name] + text + wraps[name]);
      else if (name === "heading")
        replace(`${"#".repeat(arg?.level || 2)} ${text}`);
      else if (name === "link") replace(`[${text}](${String(arg)})`);
      else if (name === "codeBlock") replace("```\n" + text + "\n```");
      else if (["bulletList", "orderedList", "blockquote"].includes(name)) {
        replace(
          text
            .split("\n")
            .map(
              (line, i) =>
                (name === "bulletList"
                  ? "- "
                  : name === "orderedList"
                    ? `${i + 1}. `
                    : "> ") + line,
            )
            .join("\n"),
        );
      } else return false;
      return true;
    }
    const align = ["left", "center", "right", "justify"].includes(name);
    const done = richCommand(
      rich,
      align ? "align" : name,
      align ? name : name === "heading" ? arg || { level: 2 } : arg,
    );
    if (done) changed(saved);
    syncTools();
    options.onSelection?.();
    return done;
  }
  function buildTools() {
    tools.replaceChildren();
    tools.hidden = options.toolbar === false
      || (options.mode === "code" && options.toolbar === undefined);
    if (tools.hidden) return;
    const standard =
      options.mode === "code"
        ? [["undo", "redo", "search", "copy"]]
        : view === "rich"
          ? defaults
          : [
              ["undo", "redo"],
              ...(options.format === "markdown"
                ? [["heading", "bold", "italic", "link", "codeBlock"]]
                : []),
              ["rich", "source", "preview", "search", "copy"],
            ];
    const groups = toolbarItems(
      Array.isArray(options.toolbar) ? options.toolbar : standard,
    );
    for (const group of groups) {
      const span = node("span", "lui-editor-tool-group");
      for (const name of group) {
        if (name === "copy" && options.copy === false) continue;
        span.append(
          button(name, () => {
            command(name);
          }),
        );
      }
      tools.append(span);
    }
    syncTools();
  }
  const applySuggest = (index: number) => {
    if (
      !suggestions ||
      suggestions.content !== value ||
      suggestions.pos !== area.selectionStart
    )
      return closeSuggest();
    const item = suggestions.options[index];
    if (item)
      replace(item.apply ?? item.label, suggestions.from, suggestions.pos);
    closeSuggest();
    focus();
  };
  const paintSuggest = () => {
    suggest.replaceChildren();
    if (!suggestions) return;
    suggestions.options.forEach((item, i) => {
      const el = button(item.label, () => applySuggest(i), item.label);
      el.id = `${suggest.id}-${i}`;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", String(i === suggestions!.index));
      suggest.append(el);
    });
    suggest.hidden = !suggestions.options.length;
    area.setAttribute("aria-controls", suggest.id);
    area.setAttribute("aria-expanded", String(!suggest.hidden));
    area.setAttribute(
      "aria-activedescendant",
      `${suggest.id}-${suggestions.index}`,
    );
  };
  const requestSuggest = async () => {
    closeSuggest();
    if (!options.suggest || !writable() || composing) return;
    abort = new AbortController();
    const signal = abort.signal;
    const content = value;
    const pos = area.selectionStart;
    try {
      const result = await options.suggest({
        content,
        file: options.file || "",
        pos,
        signal,
      });
      if (
        signal.aborted ||
        disposed ||
        value !== content ||
        area.selectionStart !== pos
      )
        return;
      suggestions = {
        from: Math.max(0, Math.min(pos, result.from)),
        content,
        pos,
        options: result.options.slice(0, 30),
        index: 0,
      };
      paintSuggest();
    } catch (error) {
      if (!signal.aborted) fail(error);
    }
  };
  const updateIssues = () => {
    issues.replaceChildren();
    for (const issue of options.issues || []) {
      const row = button(
        issue.message,
        () => select(issue.from, issue.to),
        issue.message,
      );
      row.className = `lui-editor-issue lui-editor-issue--${issue.severity}`;
      row.textContent = `${issue.severity}: ${issue.message}`;
      issues.append(row);
    }
    issues.hidden = !issues.childNodes.length;
  };
  const applyOptions = (jump = false) => {
    const locked = !writable();
    area.readOnly = locked;
    area.disabled = !!options.disabled;
    rich.contentEditable = String(!locked);
    rich.tabIndex = options.disabled ? -1 : 0;
    rich.setAttribute("aria-readonly", String(locked));
    rich.setAttribute("aria-disabled", String(!!options.disabled));
    const label = options.ariaLabel || options.file || "Editor content";
    area.setAttribute("aria-label", label);
    rich.setAttribute("aria-label", label);
    area.placeholder = options.placeholder || "";
    rich.dataset.placeholder = options.placeholder || "";
    root.dataset.mode = options.mode;
    if (options.mode === "code") {
      root.setAttribute("data-luon-code", "");
      root.setAttribute("translate", "no");
    } else {
      root.removeAttribute("data-luon-code");
      root.removeAttribute("translate");
    }
    root.classList.toggle("lui-editor--sticky", !!options.stickyToolbar);
    if (options.theme) root.dataset.theme = options.theme;
    else delete root.dataset.theme;
    if (options.minHeight != null && options.minHeight !== "") {
      root.style.setProperty(
        "--lui-editor-min-height",
        typeof options.minHeight === "number"
          ? `${options.minHeight}px`
          : options.minHeight,
      );
    } else root.style.removeProperty("--lui-editor-min-height");
    root.style.setProperty("--lui-tab-size", String(options.tabSize));
    gutter.hidden = options.lineNumbers === false;
    replacement.disabled = locked;
    rich.hidden = view !== "rich";
    source.hidden = view !== "source";
    preview.hidden = view !== "preview";
    buildTools();
    updateIssues();
    if (jump && options.line && view === "source") {
      const lines = value.split("\n");
      select(
        lines.slice(0, Math.max(0, options.line - 1)).join("\n").length +
          (options.line > 1 && lines.length > 1 ? 1 : 0),
      );
    }
  };
  const setValue = (next: string) => {
    if (disposed || next === value) return;
    if (composing) {
      queued = next;
      return;
    }
    if (view === "rich" && options.format === "markdown" && unsupported(next)) {
      throw new Error(
        "This Markdown requires source mode to preserve its blocks.",
      );
    }
    const from = area.selectionStart;
    const to = area.selectionEnd;
    const saved = selectionMark(rich);
    value = next;
    area.value = next;
    if (options.mode !== "code") {
      rich.innerHTML = asHTML();
      preview.innerHTML = asHTML();
    }
    undo.length = 0;
    redo.length = 0;
    closeSuggest();
    area.setSelectionRange(
      Math.min(from, next.length),
      Math.min(to, next.length),
    );
    if (saved) restoreMark(rich, saved);
    syncPaint();
    syncTools();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.isComposing || composing || event.keyCode === 229) return;
    const mod = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (/^(Arrow|Home|End|Page)/.test(event.key)) lastKind = "";
    if (mod && key === "s") {
      event.preventDefault();
      options.onSave?.();
      return;
    }
    if (mod && key === "f" && !event.shiftKey) {
      event.preventDefault();
      command("search");
      return;
    }
    if (event.key === "Escape") {
      closeSuggest();
      search.hidden = true;
      linkBox.hidden = true;
      return;
    }
    if (!writable()) return;
    if (event.target instanceof doc.defaultView!.HTMLInputElement) return;
    if (mod && (key === "z" || key === "y")) {
      event.preventDefault();
      command(key === "y" || event.shiftKey ? "redo" : "undo");
      return;
    }
    if (mod && view === "rich" && ["b", "i", "u"].includes(key)) {
      event.preventDefault();
      command({ b: "bold", i: "italic", u: "underline" }[key]!);
      return;
    }
    if (view !== "source" || event.target !== area) return;
    if (suggestions && !suggest.hidden) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        suggestions.index =
          (suggestions.index +
            suggestions.options.length +
            (event.key === "ArrowDown" ? 1 : -1)) %
          suggestions.options.length;
        paintSuggest();
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        applySuggest(suggestions.index);
        return;
      }
    }
    if (event.ctrlKey && event.code === "Space") {
      event.preventDefault();
      void requestSuggest();
      return;
    }
    if (event.key === "Tab") {
      // Escape then Tab leaves the editor; browser tab shortcuts stay native.
      if (area.dataset.tabFree === "true" || mod || event.altKey) return;
      event.preventDefault();
      const width = options.tabSize;
      const from = area.selectionStart;
      const to = area.selectionEnd;
      if (from === to && !event.shiftKey) replace(" ".repeat(width));
      else {
        const start = value.lastIndexOf("\n", from - 1) + 1;
        const end = to > from && value[to - 1] === "\n" ? to - 1 : to;
        const lines = value.slice(start, end).split("\n");
        const text = lines
          .map((line) =>
            event.shiftKey
              ? line.replace(new RegExp(`^( {1,${width}}|\\t)`), "")
              : " ".repeat(width) + line,
          )
          .join("\n");
        replace(text, start, end);
        area.setSelectionRange(start, start + text.length);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const line = value.slice(0, area.selectionStart).split("\n").at(-1)!;
      replace(
        "\n" +
          (/^\s*/.exec(line)?.[0] || "") +
          (/[{[(]\s*$/.test(line) ? " ".repeat(options.tabSize) : ""),
      );
    }
  };
  listen(root, "keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape" && event.target === area)
      area.dataset.tabFree = "true";
    else if (event.key !== "Tab") delete area.dataset.tabFree;
    keydown(event);
  });
  for (const el of [area, rich]) {
    listen(el, "beforeinput", (event: InputEvent) => {
      if (!writable()) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      if (
        event.inputType === "historyUndo" ||
        event.inputType === "historyRedo"
      ) {
        if (event.cancelable) {
          event.preventDefault();
          command(event.inputType === "historyUndo" ? "undo" : "redo");
        }
        return;
      }
      if (!composing) before = snapshot();
    });
    listen(el, "compositionstart", () => {
      before = snapshot();
      composing = true;
    });
    listen(el, "compositionend", () => {
      composing = false;
      if (el === area) syncPaint();
      changed(before || snapshot(), "composition");
      before = undefined;
      if (queued !== undefined) {
        const next = queued;
        queued = undefined;
        setValue(next);
      }
    });
    listen(el, "input", (event: InputEvent) => {
      if (composing || event.isComposing) return;
      if (!writable()) {
        area.value = value;
        rich.innerHTML = asHTML();
        return;
      }
      closeSuggest();
      if (el === area) syncPaint();
      changed(
        before || { ...snapshot(), value },
        event.inputType === "insertText" ||
          event.inputType === "deleteContentBackward"
          ? "typing"
          : "input",
      );
      before = undefined;
      if (el === area && options.suggest) {
        suggestTimer = setTimeout(() => void requestSuggest(), 160);
      }
    });
  }
  listen(rich, "paste", (event: ClipboardEvent) => {
    event.preventDefault();
    if (!writable() || composing) return;
    focus();
    const saved = snapshot();
    const selection = doc.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!rich.contains(range.commonAncestorContainer)) return;
    const raw = event.clipboardData?.getData("text/html");
    const text = event.clipboardData?.getData("text/plain") || "";
    const template = doc.createElement("template");
    template.innerHTML = raw
      ? cleanHTML(raw, doc)
      : escapeText(text).replaceAll("\n", "<br>");
    const last = template.content.lastChild;
    range.deleteContents();
    const anchor =
      range.startContainer.nodeType === 1
        ? (range.startContainer as Element)
        : range.startContainer.parentElement;
    const block = anchor?.closest("p,h1,h2,h3,h4,h5,h6");
    const blockPaste = Array.from(template.content.children).some((el) =>
      /^(p|div|h[1-6]|ul|ol|blockquote|pre|hr)$/.test(el.localName),
    );
    if (block && rich.contains(block) && blockPaste) {
      const tailRange = doc.createRange();
      tailRange.selectNodeContents(block);
      tailRange.setStart(range.startContainer, range.startOffset);
      const tail = block.cloneNode(false) as Element;
      tail.append(tailRange.extractContents());
      block.after(template.content, tail);
      if (!block.textContent) block.remove();
      if (!tail.textContent) tail.remove();
    } else range.insertNode(template.content);
    if (last) {
      range.setStartAfter(last);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    changed(saved, "paste");
  });
  // External rich drops require the same sanitization as paste. Text drops
  // are handled as plain text; dropping files is outside this component.
  listen(rich, "drop", (event: DragEvent) => {
    event.preventDefault();
    if (!writable() || composing) return;
    const text = event.dataTransfer?.getData("text/plain");
    if (!text) return;
    focus();
    const saved = snapshot();
    const selection = doc.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!rich.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const node = doc.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    changed(saved, "drop");
  });
  listen(area, "scroll", () => {
    paint.scrollTop = area.scrollTop;
    paint.scrollLeft = area.scrollLeft;
    gutter.scrollTop = area.scrollTop;
  });
  listen(area, "select", () => {
    options.onSelection?.();
  });
  listen(area, "pointerdown", () => {
    lastKind = "";
  });
  listen(doc, "selectionchange", () => {
    const next = selectionMark(rich);
    if (next) {
      mark = next;
      syncTools();
      options.onSelection?.();
    }
  });
  listen(query, "keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      find(event.shiftKey);
    }
  });
  const api: EditorApi = {
    element: root,
    get input() {
      return view === "rich" ? rich : area;
    },
    getValue: () => value,
    getHTML: () => (view === "rich" ? html() : asHTML()),
    getText: () => (view === "rich" ? rich.textContent || "" : value),
    setValue,
    focus,
    select,
    command,
    isActive: (name, arg) =>
      typeof name === "object"
        ? active("align", name.textAlign)
        : active(name, arg),
    commands: { setContent: setValue },
    update(next) {
      if (disposed) return;
      const resolved = editorOptions({ ...options, ...next });
      if (resolved.format !== options.format && value) {
        throw new Error(
          "Editor format cannot change with existing content. Convert explicitly.",
        );
      }
      if (
        resolved.mode === "rich" &&
        resolved.format === "markdown" &&
        unsupported(next.value ?? value)
      ) {
        throw new Error(
          "This Markdown requires source mode to preserve its blocks.",
        );
      }
      const previous = options;
      options = resolved;
      if (next.value !== undefined) setValue(next.value);
      if (previous.mode !== options.mode) {
        view = options.mode === "rich" ? "rich" : "source";
        rich.innerHTML = asHTML();
        area.value = value;
      }
      if (options.readOnly || options.disabled) closeSuggest();
      applyOptions(
        previous.line !== options.line || previous.jump !== options.jump,
      );
      syncPaint();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      closeSuggest();
      cleanups
        .splice(0)
        .reverse()
        .forEach((run) => run());
      undo.length = 0;
      redo.length = 0;
      root.remove();
    },
    chain() {
      const queue: (() => void)[] = [];
      const names: Record<string, string> = {
        toggleBold: "bold",
        toggleItalic: "italic",
        toggleUnderline: "underline",
        toggleStrike: "strike",
        toggleCode: "code",
        toggleBulletList: "bulletList",
        toggleOrderedList: "orderedList",
        toggleBlockquote: "blockquote",
        toggleCodeBlock: "codeBlock",
        setParagraph: "paragraph",
        setHeading: "heading",
        toggleHeading: "heading",
        undo: "undo",
        redo: "redo",
      };
      const chain: Record<string, any> = {
        focus() {
          queue.push(focus);
          return chain;
        },
        run() {
          queue.forEach((run) => run());
          return true;
        },
        setTextAlign(align: string) {
          queue.push(() => command(align));
          return chain;
        },
      };
      for (const [key, name] of Object.entries(names)) {
        chain[key] = (arg?: unknown) => {
          queue.push(() => command(name, arg));
          return chain;
        };
      }
      return chain;
    },
  };
  area.value = value;
  if (options.mode !== "code") rich.innerHTML = asHTML();
  if (view === "rich") value = options.format === "html" ? html() : value;
  syncPaint();
  applyOptions(true);
  if (options.autofocus)
    queueMicrotask(() => {
      if (!disposed) focus();
    });
  return api;
}
