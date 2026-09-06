// Generated from src/input.view.tsx.
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { r } from "@luon/rule";
import { Icon } from "./icon.view.js";
import { inputProps } from "./props.ts";
import { controlSkin, font, sizes } from "./skin.ts";
import { $, model, read, target } from "./util.ts";
import { attrsView as __attrs, bindView as __bind, componentView as __component, computedView as __computed, liveView as __live, state as __state, styleState as __styleState, styleView as __style, watchView as __watch } from "@luon/view";
const __spec = inputProps;
const __styleId = "3bfc14cc1b01";
export default __component("Input", (props) => {
    const attrs = __attrs(props, __spec);
    const data = __state(r.initial({ shown: r.boolean() }));
    const __styleSource = __styleState(() => ({
        root: [
            "lui-input relative flex w-full items-center",
            "border rounded-[var(--lui-radius)] transition-colors",
            "focus-within:outline-2 focus-within:outline-offset-2",
            "focus-within:outline-[var(--lui-focus)]",
            "has-[[aria-invalid=true]]:border-[var(--lui-danger)]",
            "has-[[aria-invalid=true]]:[--lui-focus:var(--lui-danger)]",
            font, controlSkin(props), props.disabled && "opacity-50",
        ],
        leading: $("flex shrink-0 items-center gap-2 pl-3 text-sm $muted"),
        trailing: $("flex shrink-0 items-center gap-1.5 pr-3 text-sm $muted"),
        $input: [
            font, sizes[props.size],
            "w-full min-w-0 flex-1 border-0 bg-transparent",
            "rounded-[var(--lui-radius)] placeholder:text-[var(--lui-muted)]",
            "focus-visible:outline-none disabled:pointer-events-none",
        ],
        action: $("rounded p-1 $muted $hoverSoft", "disabled:pointer-events-none disabled:opacity-50", "focus-visible:outline-2 focus-visible:outline-[var(--lui-primary)]"),
        error: $("absolute left-0 top-full mt-1 text-xs $dangerText"),
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
        const errorId = props.id ? `${props.id}-error` : undefined;
        return _jsxs("span", { class: __styles.root, children: [__live(() => props.slotLeading || props.icon || props.prefix ? _jsx("span", { class: __styles.leading, children: __live(() => props.slotLeading ? props.slotLeading() : _jsxs(_Fragment, { children: [__live(() => props.icon ? _jsx(Icon, { name: props.icon }) : null), __live(() => props.prefix ? _jsx("span", { children: __live(() => props.prefix) }) : null)] })) }) : null), _jsx("input", { ...attrs, "aria-describedby": __live(() => [
                        attrs["aria-describedby"],
                        typeof props.error === "string" ? errorId : undefined,
                    ].filter(Boolean).join(" ") || undefined), "aria-invalid": __live(() => Boolean(props.error) || undefined), class: __live(() => [__styles.$input, props.className ?? props.class]), disabled: __live(() => props.disabled), type: __live(() => password ? data.shown ? "text" : "password" : props.type), value: current.value, onInput: (event) => {
                        if (!props.disabled && !props.readOnly) {
                            current.set(target(event).value);
                        }
                    } }), __live(() => props.loading || props.trailingIcon || password || props.clearable
                    || props.suffix || props.slotTrailing ? _jsxs("span", { class: __styles.trailing, children: [__live(() => props.loading ? _jsx(Icon, { class: "animate-spin", name: "loader" }) : null), __live(() => props.clearable ? _jsx("button", { "aria-label": "Clear input", class: __styles.action, disabled: __live(() => props.disabled || props.readOnly || !read(current.value)), onClick: (event) => {
                                if (props.disabled || props.readOnly)
                                    return;
                                current.set("");
                                target(event).closest(".lui-input")
                                    ?.querySelector("input")?.focus();
                            }, type: "button", children: _jsx(Icon, { name: "x" }) }) : null), __live(() => password ? _jsxs("button", { "aria-label": __live(() => data.shown ? "Hide password" : "Show password"), "aria-pressed": __live(() => data.shown), class: __styles.action, disabled: __live(() => props.disabled), onClick: () => {
                                if (!props.disabled)
                                    data.shown = !data.shown;
                            }, type: "button", children: [_jsx("span", { class: __live(() => data.shown ? "hidden" : undefined), children: _jsx(Icon, { name: "eye" }) }), _jsx("span", { class: __live(() => data.shown ? undefined : "hidden"), children: _jsx(Icon, { name: "eye-off" }) })] }) : null), __live(() => props.slotTrailing ? props.slotTrailing() : _jsxs(_Fragment, { children: [__live(() => props.suffix ? _jsx("span", { children: __live(() => props.suffix) }) : null), __live(() => props.trailingIcon ? _jsx(Icon, { name: props.trailingIcon }) : null)] }))] }) : null), __live(() => typeof props.error === "string" ? _jsx("small", { class: __styles.error, id: errorId, children: __live(() => props.error) }) : null)] });
    };
    return {
        render: (__props) => {
            __refreshStyles();
            return __view(__props);
        }
    };
}, __spec);
