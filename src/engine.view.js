// Generated from src/engine.tsx.
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { effectView as effect, liveView as live, state, } from "@luon/view";
import { Icon } from "./icon.view.js";
import { loadModule, loadStyle } from "./loader.ts";
import { change, $, read, valueOf } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
function connect(run, status) {
    let version = 0;
    let clean;
    return (node) => {
        version++;
        clean?.();
        clean = undefined;
        if (!node)
            return;
        const current = version;
        status.value = "loading";
        queueMicrotask(() => {
            if (current !== version || !node.isConnected)
                return;
            void run(node).then((dispose) => {
                if (current !== version || !node.isConnected) {
                    dispose?.();
                    return;
                }
                clean = dispose;
                status.value = "ready";
            }).catch(() => {
                if (current === version)
                    status.value = "error";
            });
        });
    };
}
function stateText(status, name) {
    return live(() => status.value === "ready" ? null : _jsx("span", { class: $("absolute inset-0 grid place-items-center text-sm", status.value === "error" && "$dangerText"), children: status.value === "error" ? `${name} could not be loaded.`
            : `Loading ${name.toLowerCase()}…` }));
}
const editorTicks = new WeakMap();
export function editorActive(editor, ...args) {
    return live(() => {
        if (editor)
            editorTicks.get(editor)?.version;
        return editor?.isActive?.(...args) || false;
    });
}
function setRef(ref, value) {
    if (typeof ref === "function")
        ref(value);
    else if (ref)
        ref.current = value;
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
];
function EditorTools({ editor }) {
    const run = (name) => {
        const chain = editor?.chain?.();
        if (!chain)
            return;
        const action = name === "undo" || name === "redo"
            ? chain.focus?.()[name]?.()
            : chain.focus?.()[`toggle${name[0].toUpperCase()}${name.slice(1)}`]?.();
        action?.run?.();
    };
    return _jsx(_Fragment, { children: editorTools.map(([name, icon, label], index) => _jsx("span", { class: $("inline-flex", (index === 2 || index === 5)
                && "ml-1 border-l $line pl-1"), children: _jsx("button", { "aria-label": label, "aria-pressed": editorActive(editor, name), class: $("grid size-8 place-items-center rounded", "$hoverSoft disabled:opacity-30"), disabled: !editor, title: label, type: "button", onClick: () => run(name), onMouseDown: (event) => event.preventDefault(), children: _jsx(Icon, { name: icon }) }) })) });
}
const codeFile = /\.(?:[cm]?[jt]sx?|vue)$/;
const completeTypes = {
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
function codeTheme(module, dark) {
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
function codeDark(node, props) {
    const value = read(props.theme);
    if (value)
        return value === "dark";
    return Boolean(node.closest('[data-theme="dark"], .lui-dark'));
}
const __specs = {
    DataTable: uiProps("DataTable"),
    Editor: uiProps("Editor"),
    CodeEditor: uiProps("CodeEditor"),
};
export const { DataTable, Editor, CodeEditor, } = __namedViews({
    DataTable: function DataTable(props) {
        const status = state({ value: "loading" });
        const ref = connect(async (node) => {
            const [, module] = await Promise.all([
                loadStyle("/ui/v2/data-table.css"),
                loadModule("/ui/v2/data-table.mjs"),
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
        return _jsxs("div", { class: "lui-data-table relative min-h-32", children: [_jsx("table", { class: "display", ref: ref }), stateText(status, "Data table")] });
    },
    Editor: function Editor(props) {
        const status = state({ value: "loading" });
        const current = state({
            value: undefined,
            version: 0,
        });
        const reference = props.ref;
        const ref = connect(async (node) => {
            const module = await loadModule("/ui/v2/rich-editor.mjs");
            const extensions = [module.StarterKit, ...(props.extensions || [])];
            if (props.placeholder && module.Placeholder) {
                extensions.push(module.Placeholder.configure({
                    placeholder: props.placeholder,
                }));
            }
            const editor = new module.Editor({
                content: read(valueOf(props, "")),
                editable: !props.disabled,
                element: node,
                extensions,
                onUpdate: ({ editor }) => {
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
                const value = String(read(valueOf(props, "")) || "");
                if (editor.getHTML() !== value) {
                    editor.commands.setContent(value, { emitUpdate: false });
                }
            });
            setRef(reference, { editor });
            props.onReady?.(editor);
            if (props.autofocus)
                queueMicrotask(() => {
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
            return _jsx(EditorTools, { editor: current.value });
        });
        return _jsxs("div", { class: $("lui-editor relative min-h-48 overflow-hidden", "$radius border $line", "$bg", props.compact && "min-h-32"), children: [tools ? _jsx("div", { class: $("lui-editor-tools flex flex-wrap gap-1 border-b", "$line $soft px-2 py-1", props.stickyToolbar && "sticky top-0 z-10"), children: tools })
                    : null, _jsx("div", { class: $("lui-editor-body", props.compact ? "min-h-32" : "min-h-48"), ref: ref, style: props.minHeight ? { minHeight: props.minHeight } : undefined }), stateText(status, "Editor")] });
    },
    CodeEditor: function CodeEditor(props) {
        const status = state({ value: "loading" });
        const current = state({
            copied: false,
            error: false,
            view: undefined,
        });
        const copy = async () => {
            try {
                const value = current.view?.state.doc.toString()
                    || String(read(valueOf(props, "")) || "");
                await navigator.clipboard.writeText(value);
                current.copied = true;
                setTimeout(() => current.copied = false, 1_200);
            }
            catch {
                current.error = true;
                setTimeout(() => current.error = false, 1_800);
            }
        };
        const ref = connect(async (node) => {
            const module = await loadModule("/ui/v2/code-editor.mjs");
            const language = props.language || "javascript";
            const languageExt = language === "css" ? module.css()
                : language === "html" ? module.html()
                    : language === "json" ? module.json()
                        : language === "prisma" ? module.prisma()
                            : module.javascript({
                                jsx: /\.[jt]sx$/.test(props.file || ""),
                                typescript: language === "typescript",
                            });
            const update = module.EditorView.updateListener.of((value) => {
                if (value.docChanged)
                    change(props, value.state.doc.toString());
            });
            const complete = async (context) => {
                if (!props.suggest || !props.file || !codeFile.test(props.file)) {
                    return null;
                }
                const word = context.matchBefore(/[\w$]*$/);
                if (!word)
                    return null;
                const dot = context.state.sliceDoc(word.from - 1, word.from) === ".";
                if (!context.explicit && !dot && !word.text)
                    return null;
                const abort = new AbortController();
                context.addEventListener("abort", () => abort.abort());
                try {
                    const result = await props.suggest({
                        content: context.state.doc.toString(),
                        file: props.file,
                        pos: context.pos,
                        signal: abort.signal,
                    });
                    if (context.aborted || abort.signal.aborted)
                        return null;
                    return {
                        from: Math.min(result.from, context.pos),
                        options: result.options.map((item) => ({
                            apply: item.apply || item.label,
                            label: item.label,
                            type: completeTypes[item.type] || "text",
                        })),
                        validFor: /^[\w$]*$/,
                    };
                }
                catch {
                    return null;
                }
            };
            const readonly = (value) => [
                module.EditorState.readOnly.of(value),
                module.EditorView.editable.of(!value),
            ];
            const access = new module.Compartment();
            const theme = new module.Compartment();
            const readOnly = Boolean(read(props.readOnly));
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
                            if (!Boolean(read(props.readOnly)))
                                props.onSave?.();
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
                    doc: read(valueOf(props, "")),
                    extensions,
                }),
            });
            current.view = editor;
            const stop = effect(() => {
                const value = String(read(valueOf(props, "")) || "");
                if (editor.state.doc.toString() === value)
                    return;
                editor.dispatch({
                    changes: { from: 0, insert: value, to: editor.state.doc.length },
                });
            });
            let firstAccess = true;
            const stopAccess = effect(() => {
                const value = Boolean(read(props.readOnly));
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
                const issues = read(props.issues) || [];
                const max = editor.state.doc.length;
                editor.dispatch(module.setDiagnostics(editor.state, issues.map((item) => ({
                    from: Math.min(item.from, max),
                    markClass: item.severity === "hint" ? "cm-unused" : undefined,
                    message: item.message,
                    severity: item.severity,
                    source: item.rule ? `Oxlint · ${item.rule}` : "Oxlint",
                    to: Math.min(Math.max(item.from, item.to), max),
                }))));
            });
            const stopLine = effect(() => {
                read(props.jump);
                const value = Number(read(props.line));
                if (!value)
                    return;
                const line = editor.state.doc.line(Math.min(value, editor.state.doc.lines));
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
        return _jsxs("section", { class: $("lui-code notranslate relative min-h-64 overflow-hidden", "$radius", "border $line $bg"), "data-luon-code": "", translate: "no", children: [_jsxs("header", { class: $("flex min-h-10 items-center justify-between gap-3 border-b", "$line $soft px-3 text-xs"), children: [_jsxs("span", { class: "inline-flex items-center gap-2 font-medium", children: [_jsx("i", { class: $("size-2 rounded-full $primaryBg") }), props.language || "javascript"] }), props.copy === false ? null : _jsx("button", { class: "inline-flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/60", type: "button", onClick: () => void copy(), children: live(() => _jsxs(_Fragment, { children: [_jsx(Icon, { name: current.copied ? "check" : "copy" }), current.copied ? "Copied" : "Copy"] })) })] }), _jsx("div", { class: "h-full min-h-64", ref: ref }), stateText(status, "Code editor"), live(() => current.error ? _jsx("span", { class: $("absolute bottom-3 right-3 rounded bg-[var(--lui-danger)]", "px-3 py-2 text-xs text-[var(--lui-on-danger)] shadow"), role: "status", children: "Clipboard access failed." }) : null)] });
    },
}, (name) => __specs[name]);
