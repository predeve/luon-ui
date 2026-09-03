// Generated from src/input.view.tsx.
import { jsx as _jsx, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { r } from "@luon/rule";
import { Icon } from "./icon.view.js";
import { inputProps } from "./props.ts";
import { control, font, sizes } from "./skin.ts";
import { $, model, pick, target } from "./util.ts";
import { attrsView as __attrs, bindView as __bind, componentView as __component, computedView as __computed, liveView as __live, state as __state, styleState as __styleState, styleView as __style, watchView as __watch } from "@luon/view";
const __spec = inputProps;
const __styleId = "3bfc14cc1b01";
export default __component("Input", (props) => {
    const attrs = __attrs(props, __spec);
    const data = __state(r.initial({ shown: r.boolean() }));
    const __styleSource = __styleState(() => ({
        root: ["lui-input relative flex w-full items-center", font],
        leading: $("pointer-events-none absolute left-3 $muted"),
        $input: [
            control, sizes[props.size],
            props.icon && "pl-9",
            (props.type === "password" || props.clearable || props.loading
                || props.trailingIcon) && "pr-9",
            props.error && "border-[var(--lui-danger)]",
        ],
        loading: "pointer-events-none absolute right-3 animate-spin",
        trailing: $("pointer-events-none absolute right-3 $muted"),
        action: $("absolute right-2 rounded p-1 $muted"),
        error: $("absolute top-full mt-1 text-xs $dangerText"),
    }), __styleId, true);
    const __styleScope = __styleSource.id;
    const style = __styleSource.rules;
    const styles = style;
    let __styles = __style(__styleScope, __styleSource.value());
    const __refreshStyles = () => {
        __styles = __style(__styleScope, __styleSource.refresh());
    };
    const __view = (props) => {
        const current = model(props, props.defaultValue ?? "");
        const password = props.type === "password";
        return _jsxs("span", { class: __styles.root, children: [__live(() => props.icon ? _jsx(Icon, { class: __styles.leading, name: props.icon }) : null), _jsx("input", { ...attrs, "aria-invalid": __live(() => Boolean(props.error) || undefined), class: __live(() => [__styles.$input, props.className ?? props.class]), type: __live(() => password ? data.shown ? "text" : "password" : props.type), value: current.value, onInput: (event) => current.set(target(event).value) }), __live(() => props.loading ? _jsx(Icon, { class: __styles.loading, name: "loader" })
                    : props.trailingIcon ? _jsx(Icon, { class: __styles.trailing, name: props.trailingIcon }) : password ? _jsxs("button", { "aria-label": __live(() => data.shown ? "Hide password" : "Show password"), class: __styles.action, onClick: () => data.shown = !data.shown, type: "button", children: [_jsx("span", { class: __live(() => data.shown ? "hidden" : undefined), children: _jsx(Icon, { name: "eye" }) }), _jsx("span", { class: __live(() => data.shown ? undefined : "hidden"), children: _jsx(Icon, { name: "eye-off" }) })] }) : props.clearable ? _jsx("button", { "aria-label": "Clear input", class: __styles.action, disabled: pick(current.value, (value) => !value), onClick: () => current.set(""), type: "button", children: _jsx(Icon, { name: "x" }) }) : null), __live(() => typeof props.error === "string"
                    ? _jsx("small", { class: __styles.error, children: __live(() => props.error) }) : null)] });
    };
    return {
        render: (__props) => {
            __refreshStyles();
            return __view(__props);
        }
    };
}, __spec);
