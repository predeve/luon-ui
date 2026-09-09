/** @jsxImportSource @luon/view */
import { afterEach, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createEditor } from "../src/editor-core.ts";
import { editorOptions, toolbarItems } from "../src/editor-data.ts";
import { fromMarkdown, toMarkdown, cleanHTML } from "../src/editor-markdown.ts";
import { highlight } from "../src/editor-syntax.ts";
import { mount } from "@luon/act";
import { state, bindView, componentView } from "@luon/view";
import { Editor, editorActive } from "../src/engine.view.js";
const win = new Window();
Object.assign(globalThis, {
  window: win,
  document: win.document,
  Node: win.Node,
  Element: win.Element,
  HTMLElement: win.HTMLElement,
  Event: win.Event,
  InputEvent: win.InputEvent,
  KeyboardEvent: win.KeyboardEvent,
  MutationObserver: win.MutationObserver,
});
const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((fn) => fn());
});
function editor(options: Parameters<typeof createEditor>[1] = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const api = createEditor(host, options);
  cleanups.push(() => {
    api.destroy();
    host.remove();
  });
  return api;
}
function type(api: ReturnType<typeof editor>, text: string) {
  const input = api.input as HTMLTextAreaElement;
  input.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: text,
    }),
  );
  input.setRangeText(text, input.selectionStart, input.selectionEnd, "end");
  input.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text,
    }),
  );
}
function select(
  api: ReturnType<typeof editor>,
  selector: string,
  from: number,
  to: number,
) {
  const text = api.element.querySelector(selector)!.firstChild!;
  const range = document.createRange();
  range.setStart(text, from);
  range.setEnd(text, to);
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
}
test("first declared mode or format wins, defaults fill gaps", () => {
  const warnings: string[] = [];
  expect(
    editorOptions({
      mode: "markdown",
      format: "html",
      onConflict: (key) => warnings.push(key),
    }),
  ).toMatchObject({
    mode: "markdown",
    format: "markdown",
  });
  expect(editorOptions({ format: "html", mode: "markdown" })).toMatchObject({
    mode: "rich",
    format: "html",
  });
  expect(editorOptions({ format: "text", mode: "rich" })).toMatchObject({
    mode: "code",
    format: "text",
  });
  expect(warnings).toEqual(["format"]);
  expect(
    toolbarItems([
      ["bold", "italic"],
      ["bold", "undo"],
    ]),
  ).toEqual([["bold", "italic"], ["undo"]]);
});
test("code edits, indentation, history, save and external updates", () => {
  const changes: string[] = [];
  let saved = 0;
  const api = editor({
    mode: "code",
    value: "const a = 1;",
    onChange: (value) => changes.push(value),
    onSave: () => saved++,
  });
  api.select(12);
  type(api, "\n");
  type(api, "let b = 2;");
  expect(api.getValue()).toBe("const a = 1;\nlet b = 2;");
  api.command("undo");
  expect(api.getValue()).toBe("const a = 1;");
  api.command("redo");
  expect(api.getValue()).toContain("let b");
  api.input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(saved).toBe(1);
  api.setValue("safe");
  expect(api.command("undo")).toBe(false);
  expect((api.input as HTMLTextAreaElement).value).toBe("safe");
  expect(changes.length).toBeGreaterThan(2);
});
test("IME commits once and external updates wait for composition", () => {
  const changes: string[] = [];
  const api = editor({ mode: "code", onChange: (text) => changes.push(text) });
  const area = api.input as HTMLTextAreaElement;
  area.dispatchEvent(new Event("compositionstart"));
  area.value = "ㅎ";
  area.dispatchEvent(new InputEvent("input", { isComposing: true }));
  api.setValue("external");
  expect(area.value).toBe("ㅎ");
  area.value = "한";
  area.dispatchEvent(new Event("compositionend"));
  expect(changes).toEqual(["한"]);
  expect(api.getValue()).toBe("external");
});
test("rich marks affect only selection and undo preserves markup", () => {
  const api = editor({ value: "<p>hello world</p>" });
  select(api, "p", 0, 5);
  expect(api.command("bold")).toBe(true);
  expect(api.getHTML()).toBe("<p><strong>hello</strong> world</p>");
  api.command("undo");
  expect(api.getHTML()).toBe("<p>hello world</p>");
  api.command("redo");
  expect(api.getHTML()).toContain("<strong>hello</strong>");
  select(api, "strong", 1, 4);
  api.command("bold");
  expect(api.getHTML()).toBe(
    "<p><strong>h</strong>ell<strong>o</strong> world</p>",
  );
});
test("alignment, lists and headings work without extensions", () => {
  const api = editor({ value: "<p>one</p><p>two</p>" });
  select(api, "p", 0, 3);
  api.command("center");
  expect(api.getHTML()).toContain("text-align: center");
  api.command("heading", { level: 2 });
  expect(api.getHTML()).toContain("<h2");
  api.command("bulletList");
  expect(api.getHTML()).toContain("<ul><li>one</li></ul>");
  api.command("bulletList");
  expect(api.getHTML()).not.toContain("<ul>");
});
test("sanitizes rich input and blocks executable links", () => {
  const value =
    '<p onclick="bad()">Safe<img src=x onerror="bad()"></p>' +
    '<script>bad()</script><a href="javascript:bad()">link</a>';
  const api = editor({ value });
  expect(api.getHTML()).toBe("<p>Safe</p><a>link</a>");
  expect(cleanHTML("<svg><script>bad()</script></svg>", document)).toBe("");
  select(api, "p", 0, 4);
  expect(api.command("link", "javascript:bad()")).toBe(false);
  expect(api.command("link", "https://luon.dev")).toBe(true);
  expect(api.getHTML()).toContain('href="https://luon.dev"');
});
test("Markdown preview, rich editing and aligned HTML round trip", () => {
  const md =
    "# Notes\n\n**Strong** and *soft*\n\n- One\n- Two\n\n```ts\nconst x = 1;\n```";
  const api = editor({ mode: "markdown", value: md });
  api.command("preview");
  expect(api.element.querySelector(".lui-editor-preview h1")?.textContent).toBe(
    "Notes",
  );
  api.command("rich");
  select(api, ".lui-editor-rich h1", 0, 5);
  api.command("center");
  api.command("source");
  expect(api.getValue()).toContain("text-align: center");
  api.command("rich");
  expect(api.getHTML()).toContain("text-align: center");
  expect(
    fromMarkdown(toMarkdown("<p><u>underline</u></p>", document), document),
  ).toBe("<p><u>underline</u></p>");
});
test("unsupported rich conversion retains the original Markdown", () => {
  const api = editor({ mode: "markdown", value: "![logo](logo.png)" });
  expect(api.command("rich")).toBe(false);
  expect(api.getValue()).toBe("![logo](logo.png)");
  expect(() => api.update({ format: "text", mode: "code" })).toThrow();
});
test("syntax tokens preserve text and never execute HTML", () => {
  for (const language of [
    "javascript",
    "typescript",
    "json",
    "css",
    "html",
    "jsx",
    "tsx",
  ] as const) {
    const source = 'const value = "<img src=x onerror=bad()>"; // comment';
    const node = document.createElement("div");
    node.innerHTML = highlight(source, language);
    expect(node.textContent).toBe(source);
    expect(node.querySelector("img")).toBeNull();
    expect(node.querySelector("span")).not.toBeNull();
  }
});
test("language syntax distinguishes properties, tags and embedded code", () => {
  const node = document.createElement("div");
  const words = (kind: string) =>
    [...node.querySelectorAll(`.lui-syntax-${kind}`)]
      .map((item) => item.textContent);

  node.innerHTML = highlight(
    'type Key = { class?: string }; const data = { count: 20 };',
    "typescript",
  );
  expect(words("keyword")).toEqual(["type", "const"]);
  expect(words("type")).toEqual(["Key", "string"]);
  expect(words("variable")).toEqual(["data"]);
  expect(words("property")).toEqual(["class", "count"]);

  node.innerHTML = highlight(
    '<main class="p-8">number {count < 20 ? "yes" : "no"}</main>',
    "tsx",
  );
  expect(words("attribute")).toEqual(["class"]);
  expect(words("tag").join("")).toBe("<main></main>");
  expect(words("number")).toEqual(["20"]);
  expect(words("type")).toEqual([]);
  expect(words("string")).toEqual(['"p-8"', '"yes"', '"no"']);

  node.innerHTML = highlight(
    '.card { color: #fff; padding: 20px; content: "hello"; }',
    "css",
  );
  expect(words("property")).toEqual(["color", "padding", "content"]);
  expect(words("number")).toEqual(["#fff", "20px"]);
  expect(words("string")).toEqual(['"hello"']);

  node.innerHTML = highlight('{"name":"LUON","ready":true}', "json");
  expect(words("property")).toEqual(['"name"', '"ready"']);
  expect(words("string")).toEqual(['"LUON"']);
  expect(words("atom")).toEqual(["true"]);
});
test("read-only protects commands, replacement and history", () => {
  const api = editor({ mode: "code", value: "fixed", readOnly: true });
  expect((api.input as HTMLTextAreaElement).readOnly).toBe(true);
  expect(api.command("undo")).toBe(false);
  api.command("search");
  const fields = api.element.querySelectorAll<HTMLInputElement>(
    ".lui-editor-search input",
  );
  fields[0]!.value = "fixed";
  fields[1]!.value = "changed";
  (
    api.element.querySelector('[aria-label="Replace all"]') as HTMLElement
  ).click();
  expect(api.getValue()).toBe("fixed");
});
test("View bind echoes preserve DOM, selection and history", () => {
  const data = state({ value: "start" });
  let api: ReturnType<typeof createEditor> | undefined;
  const Bound = componentView("BoundEditor", () => ({
    render: () => (
      <Editor
        mode="code"
        {...bindView(
          () => data.value,
          (value) => (data.value = value),
          { tag: "component", name: "value" },
        )}
        onReady={(value) => (api = value)}
      />
    ),
  }));
  const close = mount(<Bound />, document.body);
  cleanups.push(close);
  expect(api).toBeDefined();
  const input = api!.input;
  api!.select(5);
  type(api!, "!");
  expect(data.value).toBe("start!");
  expect(api!.input).toBe(input);
  expect((input as HTMLTextAreaElement).selectionStart).toBe(6);
  api!.command("undo");
  expect(data.value).toBe("start");
});
test("aborts stale completion and releases pending work on close", async () => {
  let finish: ((value: any) => void) | undefined;
  let signal: AbortSignal | undefined;
  const api = editor({
    mode: "code",
    value: "con",
    suggest: (options) => {
      signal = options.signal;
      return new Promise((resolve) => (finish = resolve));
    },
  });
  api.select(3);
  api.input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(signal).toBeDefined();
  api.destroy();
  expect(signal!.aborted).toBe(true);
  finish!({ from: 0, options: [{ label: "const", type: "keyword" }] });
  await Promise.resolve();
  expect(api.element.isConnected).toBe(false);
});

test("Markdown keeps literal punctuation and code language on rich edits", () => {
  const html = fromMarkdown("\\*literal\\* and ``a`b``", document);
  expect(html).toBe("<p>*literal* and <code>a`b</code></p>");
  const md = "```typescript\nconst x = 1;\n```";
  expect(toMarkdown(fromMarkdown(md, document), document)).toBe(md);
  expect(
    fromMarkdown(toMarkdown("<p># Plain title</p>", document), document),
  ).toBe("<p># Plain title</p>");
});
test("removing a selected bold mark retains nested italic", () => {
  const api = editor({ value: "<p><strong><em>hello</em></strong></p>" });
  select(api, "em", 1, 4);
  api.command("bold");
  expect(api.getHTML()).toBe(
    "<p><strong><em>h</em></strong><em>ell</em>" +
      "<strong><em>o</em></strong></p>",
  );
});
test("a persistent source line does not move the caret after typing", () => {
  const api = editor({ mode: "code", value: "one\ntwo", line: 2, jump: 1 });
  api.select(7);
  type(api, "!");
  api.update({ value: api.getValue(), line: 2, jump: 1 });
  expect((api.input as HTMLTextAreaElement).selectionStart).toBe(8);
});
test("rich block paste splits the paragraph and strips unsafe markup", () => {
  const api = editor({ value: "<p>beforeafter</p>" });
  select(api, "p", 6, 6);
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: {
      getData: (type: string) =>
        type === "text/html"
          ? '<h2 onclick="bad()">Pasted</h2><script>bad()</script>'
          : "Pasted",
    },
  });
  api.input.dispatchEvent(event);
  expect(api.getHTML()).toBe("<p>before</p><h2>Pasted</h2><p>after</p>");
  api.command("undo");
  expect(api.getHTML()).toBe("<p>beforeafter</p>");
});
test("turning bold off at a caret keeps text on both sides", () => {
  const api = editor({ value: "<p><strong>hello</strong></p>" });
  select(api, "strong", 2, 2);
  api.command("bold");
  const range = document.getSelection()!.getRangeAt(0);
  const text = document.createTextNode("X");
  range.insertNode(text);
  api.input.dispatchEvent(new InputEvent("input", { inputType: "insertText" }));
  expect(api.getHTML()).toBe("<p><strong>he</strong>X<strong>llo</strong></p>");
});
test("custom toolbars receive the native handle and update active marks", () => {
  let api: ReturnType<typeof createEditor> | undefined;
  const close = mount(
    <Editor value="<p>hello</p>" onReady={(value) => (api = value)}>
      {({ editor }: { editor: ReturnType<typeof createEditor> }) => (
        <button
          aria-label="Custom bold"
          aria-pressed={editorActive(editor, "bold")}
          onClick={() => editor.command("bold")}
        >
          Bold
        </button>
      )}
    </Editor>,
    document.body,
  );
  cleanups.push(close);
  select(api!, "p", 0, 5);
  api!.command("bold");
  expect(
    document
      .querySelector('[aria-label="Custom bold"]')
      ?.getAttribute("aria-pressed"),
  ).toBe("true");
});

test("body sizing accepts overrides and returns to inherited sizing", () => {
  const api = editor({ minHeight: 480 });
  const size = () => api.element.style.getPropertyValue(
    "--lui-editor-min-height",
  );
  expect(size()).toBe("480px");
  api.update({ minHeight: "24rem" });
  expect(size()).toBe("24rem");
  api.command("source");
  expect(size()).toBe("24rem");
  api.update({ minHeight: 0 });
  expect(size()).toBe("0px");
  api.update({ minHeight: undefined });
  expect(size()).toBe("");
});

test("custom toolbar buttons receive shared editor spacing", async () => {
  const css = document.createElement("style");
  css.textContent = await Bun.file(
    new URL("../src/editor.css", import.meta.url),
  ).text();
  document.head.append(css);
  cleanups.push(() => css.remove());
  const close = mount(
    <Editor class="note-editor" value="<p>Notes</p>">
      {() => <button aria-label="Format note">Bold</button>}
    </Editor>,
    document.body,
  );
  cleanups.push(close);
  const button = document.querySelector('[aria-label="Format note"]')!;
  expect(button.closest(".note-editor")).not.toBeNull();
  expect(button.closest(".lui-editor")).toBeNull();
  const style = window.getComputedStyle(button);
  expect(style.minHeight).toBe("34px");
  expect(style.paddingTop).toBe("8px");
});
