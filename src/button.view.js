// Generated from src/button.view.tsx.
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { Icon } from "./icon.view.js";
import { buttonProps } from "./props.ts";
import { buttonKinds, focus, font, sizes, squareSizes, tones } from "./skin.ts";
import { attrsView as __attrs, bindView as __bind, componentView as __component, computedView as __computed, liveView as __live, state as __state, styleState as __styleState, styleView as __style, watchView as __watch } from "@luon/view";
const __spec = buttonProps;
const __styleId = "fbad59bc39b0";
export default __component("Button", (props) => {
    const attrs = __attrs(props, __spec);
    const __styleSource = __styleState(() => ({
        $radius: "rounded-[var(--lui-radius)]",
        $button: [
            "lui-button inline-flex items-center justify-center gap-2",
            "$radius border font-semibold no-underline",
            "transition-colors disabled:pointer-events-none",
            "aria-disabled:pointer-events-none",
        ],
        root: [
            "$button", font, focus, tones[props.color],
            buttonKinds[props.variant],
            props.square || (props.icon && !props.label && !props.children)
                ? squareSizes[props.size] : props.variant === "link"
                ? props.size === "xs" ? "text-xs" : props.size === "xl"
                    ? "text-lg" : props.size === "lg" ? "text-base" : "text-sm"
                : sizes[props.size],
            props.block && "flex w-full",
            props.disabled && "opacity-50",
        ],
    }), __styleId, true);
    const __styleScope = __styleSource.id;
    const style = __styleSource.rules;
    const styles = style;
    let __styles = __style(__styleScope, __styleSource.value());
    const __refreshStyles = () => {
        __styles = __style(__styleScope, __styleSource.refresh());
    };
    const __view = (props) => {
        const marker = props.loading
            ? _jsx(Icon, { name: props.loadingIcon || "loader", class: "animate-spin" })
            : props.slotLeading ? props.slotLeading()
                : props.icon ? _jsx(Icon, { name: props.icon }) : null;
        const tail = props.trailingIcon ? _jsx(Icon, { class: /(?:arrow|caret|chevron)-down/.test(props.trailingIcon) ? "mr-1"
                : undefined, name: props.trailingIcon }) : null;
        const content = props.label ?? props.children;
        const end = props.slotTrailing ? props.slotTrailing() : tail;
        const body = props.trailing ? _jsxs(_Fragment, { children: [content, marker, end] })
            : _jsxs(_Fragment, { children: [marker, content, end] });
        if (props.to || props.href) {
            return _jsx("a", { ...attrs, "aria-busy": __live(() => props.loading || undefined), "aria-disabled": __live(() => props.disabled || props.loading || undefined), href: __live(() => props.disabled || props.loading
                    ? undefined : props.to || props.href), role: "link", tabindex: __live(() => props.disabled || props.loading ? -1
                    : attrs.tabindex ?? attrs.tabIndex), onClick: (event) => {
                    if (props.disabled || props.loading) {
                        event.preventDefault();
                        return;
                    }
                    props.onClick?.(event);
                }, class: __live(() => [__styles.root, props.className ?? props.class]), children: body });
        }
        return _jsx("button", { ...attrs, "aria-busy": __live(() => props.loading || undefined), class: __live(() => [__styles.root, props.className ?? props.class]), disabled: __live(() => props.disabled || props.loading), type: __live(() => props.type), children: body });
    };
    return {
        render: (__props) => {
            __refreshStyles();
            return __view(__props);
        }
    };
}, __spec, { "file": "/Users/predeve/Developer/luon.dev/luon-packages/ui/src/button.view.tsx" });
