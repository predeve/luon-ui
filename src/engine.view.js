// Generated from src/engine.tsx.
import { jsx as _jsx, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { effectView, liveView, state, untrackView } from "@luon/view";
import { createEditor } from "./editor-core.ts";
import { change, read, valueOf } from "./util.ts";
export { default as DataTable } from "./table.view.js";
export { createEditor } from "./editor-core.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
const ticks = new WeakMap();
export function editorActive(editor, ...args) {
    return liveView(() => {
        if (editor)
            ticks.get(editor)?.version;
        return editor?.isActive(args[0], args[1]) || false;
    });
}
const __specs = {
    Editor: uiProps("Editor"),
    CodeEditor: uiProps("CodeEditor"),
};
export const { Editor, CodeEditor, } = __namedViews({
    Editor: function Editor(props) {
        const current = state({
            api: undefined,
            version: 0,
        });
        let api;
        const options = () => {
            const next = {};
            // Preserve the caller's property order for first-declared conflict rules.
            for (const key of Object.keys(props)) {
                if (["value", "readOnly", "theme", "issues", "line", "jump"].includes(key)) {
                    next[key] = read(props[key]);
                }
                else
                    next[key] = props[key];
            }
            next.value = String(read(valueOf(props, "")) ?? "");
            next.minHeight = props.minHeight ?? (props.compact ? "8rem" : undefined);
            next.toolbar = typeof props.children === "function" ? false : props.toolbar;
            next.onChange = (value) => change(props, value);
            next.onSelection = () => {
                current.version++;
                props.onSelection?.();
            };
            return next;
        };
        const setRef = (value) => {
            if (typeof props.ref === "function")
                props.ref(value);
            else if (props.ref)
                props.ref.current = value;
        };
        const connect = (host) => {
            if (api) {
                ticks.delete(api);
                api.destroy();
                api = undefined;
            }
            current.api = undefined;
            setRef(null);
            if (!host)
                return;
            api = untrackView(() => createEditor(host, options()));
            ticks.set(api, current);
            current.api = api;
            setRef({ editor: api });
            untrackView(() => props.onReady?.(api));
        };
        effectView(() => {
            const next = options();
            // api is intentionally nonreactive: settings must not rebuild the editor.
            untrackView(() => api?.update(next));
        });
        const tools = typeof props.children === "function"
            ? liveView(() => (current.api ? props.children({ editor: api }) : null))
            : props.children;
        return (_jsxs("div", { class: "lui-editor-host", children: [tools ? (_jsx("div", { class: "lui-editor-tools lui-editor-custom", children: tools })) : null, _jsx("div", { ref: connect })] }));
    },
    CodeEditor: function CodeEditor(props) {
        return Editor({ mode: "code", ...props });
    },
}, (name) => __specs[name], { "file": "/Users/predeve/Developer/luon.dev/luon-packages/ui/src/engine.tsx" });
