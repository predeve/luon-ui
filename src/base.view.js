// Generated from src/base.tsx.
import { jsx as _jsx, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { liveView as live, state } from "@luon/view";
import { SelectMenu } from "./form.view.js";
import { Icon } from "./icon.view.js";
import Button from "./button.view.js";
import Input from "./input.view.js";
import { control, focus, font, sizes, tones } from "./skin.ts";
import { $, itemsOf, model, pick, read, target, valueOf, } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
const badgeKinds = {
    outline: "border-[var(--lui-action)] bg-transparent $actionText",
    soft: "border-transparent "
        + "$actionSoft "
        + "$actionText",
    solid: "border-transparent $actionBg text-white",
    subtle: "border-[color-mix(in_srgb,var(--lui-action)_24%,transparent)] "
        + "bg-[color-mix(in_srgb,var(--lui-action)_7%,var(--lui-bg))] "
        + "$actionText",
};
const textSizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
};
const weights = {
    bold: "font-bold",
    medium: "font-medium",
    normal: "font-normal",
    semibold: "font-semibold",
};
const colors = {
    danger: "$dangerText",
    default: "$text",
    muted: "$muted",
    primary: "$primaryText",
};
let accordionId = 0;
let sliderId = 0;
const toneBox = {
    danger: "[--lui-tone:var(--lui-danger)]",
    error: "[--lui-tone:var(--lui-danger)]",
    info: "[--lui-tone:var(--lui-primary)]",
    neutral: "[--lui-tone:var(--lui-text)]",
    primary: "[--lui-tone:var(--lui-primary)]",
    secondary: "[--lui-tone:var(--lui-secondary)]",
    success: "[--lui-tone:var(--lui-success)]",
    warning: "[--lui-tone:var(--lui-warning)]",
};
function tableLabel(key) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
const __specs = {
    Text: uiProps("Text"),
    Badge: uiProps("Badge"),
    Chip: uiProps("Chip"),
    Kbd: uiProps("Kbd"),
    Separator: uiProps("Separator"),
    Textarea: uiProps("Textarea"),
    Select: uiProps("Select"),
    Checkbox: uiProps("Checkbox"),
    Switch: uiProps("Switch"),
    RadioGroup: uiProps("RadioGroup"),
    Slider: uiProps("Slider"),
    FormField: uiProps("FormField"),
    FieldGroup: uiProps("FieldGroup"),
    ColorPicker: uiProps("ColorPicker"),
    InputTime: uiProps("InputTime"),
    InputDate: uiProps("InputDate"),
    Alert: uiProps("Alert"),
    Banner: uiProps("Banner"),
    Avatar: uiProps("Avatar"),
    AvatarGroup: uiProps("AvatarGroup"),
    Card: uiProps("Card"),
    Progress: uiProps("Progress"),
    ProgressGroup: uiProps("ProgressGroup"),
    Skeleton: uiProps("Skeleton"),
    Empty: uiProps("Empty"),
    ScrollArea: uiProps("ScrollArea"),
    User: uiProps("User"),
    Link: uiProps("Link"),
    Breadcrumb: uiProps("Breadcrumb"),
    Accordion: uiProps("Accordion"),
    Table: uiProps("Table"),
};
export const { Text, Badge, Chip, Kbd, Separator, Textarea, Select, Checkbox, Switch, RadioGroup, Slider, FormField, FieldGroup, ColorPicker, InputTime, InputDate, Alert, Banner, Avatar, AvatarGroup, Card, Progress, ProgressGroup, Skeleton, Empty, ScrollArea, User, Link, Breadcrumb, Accordion, Table, } = __namedViews({
    Text: function Text(props) {
        const Tag = props.as || "span";
        const base = $("lui-text leading-relaxed", font, colors[props.color || "default"], textSizes[props.size || "md"], weights[props.weight || "normal"]);
        return _jsx(Tag, { ...props.$attrs, class: base, children: props.children });
    },
    Badge: function Badge(props) {
        const color = props.color || "neutral";
        const variant = props.variant || "soft";
        const base = $("lui-badge inline-flex items-center gap-1.5 rounded-full border font-medium", font, tones[color] || tones.neutral, badgeKinds[variant] || badgeKinds.soft, props.size === "xs" ? "px-1.5 py-0.5 text-[.65rem]" : undefined, props.size === "sm" ? "px-2 py-0.5 text-xs" : undefined, !props.size || props.size === "md" ? "px-2.5 py-1 text-xs" : undefined, props.size === "lg" ? "px-3 py-1.5 text-sm" : undefined, props.size === "xl" ? "px-3.5 py-2 text-base" : undefined);
        return _jsxs("span", { ...props.$attrs, class: base, children: [props.dot ? _jsx("i", { class: "size-1.5 rounded-full bg-current" }) : null, props.label ?? props.children, props.count !== undefined ? _jsx("strong", { children: props.count }) : null] });
    },
    Chip: function Chip(props) {
        const color = props.color || "primary";
        const tone = tones[color] || tones.primary;
        const position = props.position || "top-right";
        const place = position === "top-left" ? "-left-1 -top-1"
            : position === "bottom-left" ? "-bottom-1 -left-1"
                : position === "bottom-right" ? "-bottom-1 -right-1"
                    : "-right-1 -top-1";
        return _jsxs("span", { class: $("lui-chip relative inline-flex", font, tone), children: [props.children, props.show === false ? null : _jsx("span", { class: $("absolute z-10 grid min-h-4 min-w-4 place-items-center rounded-full", "ring-2 ring-[var(--lui-bg)] $actionBg px-1 text-[.6rem]", "font-semibold text-white", place), children: props.text ?? props.label ?? props.value })] });
    },
    Kbd: function Kbd(props) {
        return _jsx("kbd", { class: $("lui-kbd inline-flex items-center justify-center rounded-md border", "$line $soft px-1.5 py-0.5 text-xs font-semibold $muted shadow-sm", props.size === "sm" && "px-1 py-0.5 text-[.65rem]", props.size === "lg" && "px-2 py-1 text-sm", font), children: props.value ?? props.children });
    },
    Separator: function Separator(props) {
        const vertical = props.orientation === "vertical";
        return _jsxs("div", { "aria-orientation": vertical ? "vertical" : "horizontal", class: $("lui-separator flex items-center $muted", vertical ? "h-full flex-col" : "w-full", font), role: "separator", children: [_jsx("i", { class: $("$line", vertical ? "w-px flex-1 border-l" : "h-px flex-1 border-t") }), props.label || props.children ? _jsx("span", { class: $(vertical ? "py-2 text-xs" : "px-3 text-xs"), children: props.label || props.children }) : null, props.label || props.children ? _jsx("i", { class: $("$line", vertical ? "w-px flex-1 border-l" : "h-px flex-1 border-t") }) : null] });
    },
    Textarea: function Textarea(props) {
        const current = model(props, props.defaultValue ?? "");
        return _jsx("textarea", { ...props.$attrs, class: $(control, "lui-textarea min-h-24", sizes[props.size || "md"]), value: current.value, onInput: (event) => {
                const node = target(event);
                if (props.autoresize) {
                    node.style.height = "auto";
                    node.style.height = `${node.scrollHeight}px`;
                }
                current.set(node.value);
            } });
    },
    Select: function Select(props) {
        if (!props.multiple) {
            return _jsx(SelectMenu, { ...props, searchInput: false });
        }
        const current = model(props, props.defaultValue ?? "");
        const select = _jsx("select", { ...props.$attrs, class: $(control, "lui-select", sizes[props.size || "md"]), value: undefined, onChange: (event) => {
                const node = target(event);
                const value = [...node.selectedOptions].map((item) => item.value);
                current.set(value);
            }, children: itemsOf(props.items).map((item) => _jsx("option", { disabled: item.disabled, selected: pick(current.value, (value) => (Array.isArray(value)
                    && value.some((entry) => String(entry) === String(item.value)))), value: String(item.value), children: item.label })) });
        return select;
    },
    Checkbox: function Checkbox(props) {
        const current = model(props, props.defaultChecked ?? props.checked ?? false, props.checked ?? valueOf(props));
        return _jsxs("label", { class: $("lui-check inline-flex cursor-pointer items-start gap-2.5", font, tones[props.color || "primary"] || tones.primary), children: [_jsx("input", { ...props.$attrs, checked: pick(current.value, Boolean), class: "peer sr-only", type: "checkbox", onChange: (event) => {
                        current.set(target(event).checked);
                    } }), _jsx("i", { class: $("mt-0.5 grid size-5 place-items-center rounded border", "$line $bg text-transparent", "peer-checked:border-[var(--lui-action)]", "peer-checked:bg-[var(--lui-action)] peer-checked:text-white", "peer-focus-visible:outline-3"), children: _jsx(Icon, { name: "check" }) }), _jsxs("span", { class: "grid gap-0.5 text-sm", children: [_jsx("b", { children: props.label ?? props.children }), props.description
                            ? _jsx("small", { class: $("$muted"), children: props.description })
                            : null] })] });
    },
    Switch: function Switch(props) {
        const current = model(props, props.defaultChecked ?? props.checked ?? false, props.checked ?? valueOf(props));
        return _jsxs("button", { ...props.$attrs, "aria-checked": pick(current.value, Boolean), class: $("lui-switch group inline-flex items-center gap-2.5 text-left", font, focus, tones[props.color || "primary"] || tones.primary), role: "switch", type: "button", onClick: () => current.set(!Boolean(read(current.value))), children: [_jsx("span", { class: $("relative h-6 w-11 shrink-0 rounded-full bg-[var(--lui-line)] transition", "group-aria-checked:bg-[var(--lui-action)]"), children: _jsx("i", { class: $("absolute left-1 top-1 size-4 rounded-full bg-white shadow transition", "group-aria-checked:translate-x-5") }) }), props.label ?? props.children ? _jsxs("span", { class: "grid gap-0.5 text-sm", children: [_jsx("b", { children: props.label ?? props.children }), props.description
                            ? _jsx("small", { class: $("$muted"), children: props.description })
                            : null] }) : null] });
    },
    RadioGroup: function RadioGroup(props) {
        const current = model(props, props.defaultValue);
        return _jsx("div", { "aria-label": props["aria-label"] || props.label, class: $("lui-radio-group grid gap-2", font), role: "radiogroup", children: itemsOf(props.items).map((item) => _jsxs("label", { class: "inline-flex items-start gap-2.5 text-sm", children: [_jsx("input", { checked: pick(current.value, (value) => Object.is(value, item.value)), class: $("accent-[var(--lui-action)]", tones[props.color || "primary"] || tones.primary), disabled: props.disabled || item.disabled, name: props.name, type: "radio", value: String(item.value), onChange: () => current.set(item.value) }), _jsxs("span", { class: "grid", children: [_jsx("b", { children: item.label }), item.description
                                ? _jsx("small", { class: $("$muted"), children: item.description })
                                : null] })] })) });
    },
    Slider: function Slider(props) {
        const current = model(props, props.defaultValue ?? 0);
        const marks = props.marks === true
            ? [props.min ?? 0, props.max ?? 100]
            : Array.isArray(props.marks) ? props.marks : [];
        const list = marks.length ? `lui-slider-${++sliderId}` : undefined;
        const tone = tones[props.color || "primary"] || tones.primary;
        const values = () => {
            const value = read(current.value);
            return Array.isArray(value) ? value.map(Number) : [Number(value)];
        };
        const set = (index, value) => {
            const source = values();
            current.set(source.length > 1
                ? source.map((item, at) => at === index ? value : item)
                    .sort((left, right) => left - right)
                : value);
        };
        const controls = live(() => values().map((value, index) => _jsx("input", { "aria-label": props["aria-label"] || props.label || `Slider ${index + 1}`, class: $("accent-[var(--lui-action)]", values().length > 1 && "lui-slider__range", props.size === "sm" && "h-1.5", props.size === "lg" && "h-3", tone), disabled: props.disabled, list: index === 0 ? list : undefined, max: props.max ?? 100, min: props.min ?? 0, step: props.step ?? 1, style: props.inverted ? { direction: "rtl" } : undefined, type: "range", value: value, onInput: (event) => {
                set(index, Number(target(event).value));
            } })));
        return _jsxs("label", { class: $("lui-slider grid gap-2", values().length > 1 && "lui-slider--range", font), children: [props.label || props.showValue !== false ? _jsxs("span", { class: "flex items-center justify-between text-sm", children: [_jsx("span", { children: props.label }), _jsx("b", { children: pick(current.value, (value) => Array.isArray(value)
                                ? value.map((item) => props.format?.(Number(item))
                                    ?? Number(item)).join(" – ")
                                : props.format?.(Number(value)) ?? Number(value)) })] }) : null, _jsx("span", { class: "lui-slider__controls", children: controls }), list ? _jsx("datalist", { id: list, children: marks.map((mark) => _jsx("option", { label: String(mark.label ?? mark.value ?? mark), value: Number(mark.value ?? mark) })) }) : null] });
    },
    FormField: function FormField(props) {
        return _jsxs("label", { class: $("lui-field grid gap-1.5", font), children: [props.label || props.hint ? _jsxs("span", { class: "flex items-center justify-between text-sm", children: [_jsxs("b", { children: [props.label, props.required ? " *" : ""] }), _jsx("i", { children: props.hint })] })
                    : null, props.children, props.error ? _jsx("small", { class: $("$dangerText"), children: props.error })
                    : props.description || props.help ? _jsx("small", { class: $("$muted"), children: props.description || props.help }) : null] });
    },
    FieldGroup: function FieldGroup(props) {
        return _jsx("div", { class: $("lui-field-group flex gap-3", props.orientation === "vertical" && "flex-col"), children: props.children });
    },
    ColorPicker: function ColorPicker(props) {
        const current = model(props, props.defaultValue || "#25f4d0");
        return _jsxs("label", { class: $("lui-color inline-flex items-center gap-2 text-sm", font), children: [props.label ? _jsx("span", { children: props.label }) : null, _jsx("input", { disabled: props.disabled, type: "color", value: current.value, onInput: (event) => {
                        current.set(target(event).value);
                    } }), _jsx("code", { children: current.value })] });
    },
    InputTime: function InputTime(props) {
        return _jsx(Input, { ...props, type: "time" });
    },
    InputDate: function InputDate(props) {
        return _jsx(Input, { ...props, type: "date" });
    },
    Alert: function Alert(props) {
        const open = state({ value: props.defaultOpen !== false });
        const body = live(() => open.value ? _jsxs("section", { class: $("lui-alert flex gap-3 $radius border p-4", "$toneLine", "$toneBg", props.variant === "solid" && "border-transparent bg-[var(--lui-tone)] text-white", props.variant === "outline" && "$bg", font, toneBox[props.color || "info"]), role: "alert", children: [_jsx(Icon, { class: "mt-0.5 text-[var(--lui-tone)]", name: props.icon || "info" }), _jsxs("div", { class: "grid flex-1 gap-1", children: [_jsx("b", { children: props.title }), props.description ? _jsx("p", { children: props.description }) : props.children] }), props.actions?.map((item) => _jsx(Button, { ...item, size: "sm" })), props.close ? _jsx("button", { "aria-label": "Close", class: "rounded p-1", type: "button", onClick: () => open.value = false, children: _jsx(Icon, { name: "x" }) }) : null] }) : null);
        return body;
    },
    Banner: function Banner(props) {
        const open = state({ value: props.defaultOpen !== false });
        return live(() => open.value ? _jsxs("section", { class: $("lui-banner flex items-center gap-3 border p-3", "$toneLine", "$toneBg", props.variant === "solid" && "border-transparent bg-[var(--lui-tone)] text-white", props.variant === "outline" && "$bg", font, toneBox[props.color || "primary"]), children: [props.icon ? _jsx(Icon, { name: props.icon }) : null, _jsxs("div", { class: "flex-1", children: [_jsx("b", { children: props.title }), props.description
                            ? _jsx("p", { class: $("text-sm $muted"), children: props.description })
                            : null] }), props.actions?.map((item) => _jsx(Button, { ...item, size: "sm" })), props.close ? _jsx("button", { "aria-label": "Close", onClick: () => open.value = false, children: _jsx(Icon, { name: "x" }) }) : null] }) : null);
    },
    Avatar: function Avatar(props) {
        const failed = state({ value: false });
        const size = props.size === "sm" ? "size-8 text-xs"
            : props.size === "lg" ? "size-14 text-base"
                : props.size === "xl" ? "size-20 text-lg" : "size-10 text-sm";
        const content = live(() => props.src && !failed.value
            ? _jsx("img", { alt: props.alt || "", class: "size-full object-cover", src: props.src, onError: () => failed.value = true })
            : props.text || props.alt?.slice(0, 2) || "LU");
        return _jsxs("span", { class: $("lui-avatar relative inline-grid shrink-0 place-items-center overflow-hidden", "rounded-full $soft font-semibold", font, size), children: [content, props.status ? _jsx("i", { class: $("absolute bottom-0 right-0 size-2.5 rounded-full ring-2", "ring-[var(--lui-bg)]", props.status === "online" || props.status === "success"
                        ? "bg-[var(--lui-success)]" : "bg-[var(--lui-warning)]") }) : null] });
    },
    AvatarGroup: function AvatarGroup(props) {
        const items = Array.isArray(props.items) ? props.items : [];
        const max = Math.max(1, Number(props.max || items.length || 5));
        const shown = items.slice(0, max);
        const more = Math.max(0, items.length - shown.length);
        return _jsxs("div", { "aria-label": props["aria-label"] || "Avatar group", class: $("lui-avatar-group inline-flex items-center", font), children: [shown.map((item) => _jsx("span", { class: "-ml-2 first:ml-0", children: _jsx(Avatar, { ...item, size: props.size || item.size }) })), props.children, more ? _jsxs("span", { class: $("-ml-2 grid size-10 place-items-center rounded-full", "border-2 border-[var(--lui-bg)] $soft text-xs font-semibold", props.size === "sm" && "size-8", props.size === "lg" && "size-14 text-sm"), children: ["+", more] }) : null] });
    },
    Card: function Card(props) {
        return _jsxs("section", { ...props.$attrs, class: $("lui-card $radius border $line", "$bg p-5 shadow-[var(--lui-shadow)]", font), children: [props.slotHeader ? _jsx("header", { children: props.slotHeader() }) : props.title
                    ? _jsxs("header", { class: "mb-4", children: [_jsx("b", { children: props.title }), props.description
                                ? _jsx("p", { class: $("text-sm $muted"), children: props.description })
                                : null] }) : null, props.children, props.slotFooter ? _jsx("footer", { class: "mt-4", children: props.slotFooter() }) : null] });
    },
    Progress: function Progress(props) {
        const source = valueOf(props, 0);
        const max = Math.max(1, Number(props.max || 100));
        const raw = pick(source, (value) => {
            const safe = Math.max(0, Math.min(max, Number(value)));
            return Number.isFinite(safe) ? safe : 0;
        });
        const percent = pick(raw, (value) => value / max * 100);
        const display = props.indeterminate
            ? typeof props.status === "string" ? props.status : "Working"
            : pick(raw, (value) => props.format?.(value)
                ?? `${Math.round(value / max * 100)}%`);
        const tone = tones[props.color || "primary"] || tones.primary;
        if (props.orientation === "circular" || props.circular) {
            const size = props.size === "sm" ? "size-12"
                : props.size === "lg" ? "size-20" : "size-16";
            const fill = props.indeterminate ? "28%" : pick(percent, (value) => `${value}%`);
            const caption = props.label
                ?? (typeof props.status === "string" ? props.status : undefined);
            const ringValue = props.indeterminate ? undefined : pick(raw, (value) => `${Math.round(value / max * 100)}%`);
            return _jsxs("span", { class: $("lui-progress-circular inline-grid justify-items-center gap-2", font, tone), children: [_jsx("span", { "aria-label": caption, "aria-valuemax": max, "aria-valuemin": "0", "aria-valuenow": props.indeterminate ? undefined : raw, class: $("lui-progress-ring relative grid shrink-0 place-items-center", "overflow-hidden rounded-full p-1 text-sm font-semibold", props.indeterminate && "animate-spin", size), role: "progressbar", style: pick(fill, (value) => ({
                            background: `conic-gradient(var(--lui-action) ${value}, `
                                + `var(--lui-soft) ${value})`,
                        })), children: _jsx("b", { class: $("grid size-full place-items-center rounded-full $bg"), children: ringValue }) }), caption ? _jsx("span", { class: $("lui-progress-label text-center text-sm $muted"), children: caption }) : null] });
        }
        return _jsxs("div", { class: $("lui-progress-wrap grid gap-1.5", font), children: [props.label || props.status ? _jsxs("span", { class: "flex justify-between text-sm", children: [_jsx("span", { children: props.label }), _jsx("b", { children: display })] }) : null, _jsx("div", { "aria-valuemax": max, "aria-valuemin": "0", "aria-valuenow": props.indeterminate ? undefined : raw, class: $("overflow-hidden rounded-full $soft", props.size === "sm" ? "h-1.5"
                        : props.size === "lg" ? "h-3" : "h-2"), role: "progressbar", children: _jsx("i", { class: $("block h-full rounded-full $actionBg", "transition-[width]", props.animated && "animate-pulse", tone), style: props.indeterminate
                            ? { width: "38%" }
                            : pick(percent, (value) => ({ width: `${value}%` })) }) })] });
    },
    ProgressGroup: function ProgressGroup(props) {
        const items = itemsOf(props.items);
        const total = Math.max(1, Number(props.max)
            || items.reduce((sum, item) => sum + Number(item.value || 0), 0));
        return _jsxs("section", { class: $("lui-progress-group grid gap-3", font), children: [props.label || props.value ? _jsxs("header", { class: "flex items-end justify-between gap-4", children: [_jsxs("span", { class: "grid", children: [_jsx("b", { children: props.label }), props.description
                                    ? _jsx("small", { class: $("$muted"), children: props.description })
                                    : null] }), props.value ? _jsx("strong", { children: props.value }) : null] }) : null, _jsx("div", { "aria-label": props["aria-label"] || props.label, class: $("flex h-3 gap-1 overflow-hidden rounded-full $soft"), role: "progressbar", children: items.map((item) => _jsx("i", { class: $("h-full rounded-full $actionBg", tones[item.color || "primary"] || tones.primary), style: { width: `${Math.max(0, Number(item.value)) / total * 100}%` }, title: `${item.label}: ${item.value}` })) }), _jsx("div", { class: "flex flex-wrap gap-x-4 gap-y-2", children: items.map((item) => (_jsxs("span", { class: $("inline-flex items-center gap-1.5 text-xs $muted"), children: [_jsx("i", { class: $("size-2 rounded-full $actionBg", tones[item.color || "primary"] || tones.primary) }), _jsx("span", { children: item.label }), _jsx("b", { class: $("$text"), children: item.value })] }))) })] });
    },
    Skeleton: function Skeleton(props) {
        return _jsx("span", { ...props.$attrs, "aria-hidden": "true", class: $("lui-skeleton block animate-pulse rounded $soft") });
    },
    Empty: function Empty(props) {
        return _jsxs("section", { class: $("lui-empty grid justify-items-center gap-3 $radius border", "$line $bg px-6 py-10 text-center shadow-sm", font), children: [_jsx("span", { class: $("grid size-12 place-items-center rounded-2xl", "$soft $primaryText"), children: _jsx(Icon, { name: props.icon || "inbox", size: 22 }) }), _jsxs("div", { class: "grid gap-1", children: [_jsx("b", { children: props.title || props.label || "Nothing here yet" }), props.description ? _jsx("p", { class: $("max-w-sm text-sm $muted"), children: props.description }) : null] }), props.actions?.length ? _jsx("div", { class: "flex flex-wrap justify-center gap-2", children: props.actions.map((item) => _jsx(Button, { ...item })) }) : props.children] });
    },
    ScrollArea: function ScrollArea(props) {
        const height = props.height ?? props.maxHeight ?? 240;
        return _jsx("div", { class: $("lui-scroll $radius border $line $bg", font), style: { maxHeight: typeof height === "number" ? `${height}px` : height }, children: _jsx("div", { class: "lui-scroll__body overflow-auto p-4", children: props.children }) });
    },
    User: function User(props) {
        return _jsxs("div", { class: $("lui-user flex items-center gap-3", font), children: [_jsx(Avatar, { ...props.avatar, src: props.avatar?.src || props.src, text: props.initials }), _jsxs("span", { class: "grid", children: [_jsx("b", { children: props.name || props.label }), _jsx("small", { class: $("$muted"), children: props.description || props.email })] }), props.children] });
    },
    Link: function Link(props) {
        const href = props.to || props.href;
        const away = props.external ?? /^https?:\/\//.test(String(href || ""));
        return _jsxs("a", { ...props.$attrs, "aria-disabled": props.disabled || undefined, class: $("lui-link inline-flex items-center gap-1 $primaryText", "underline-offset-4 hover:underline aria-disabled:pointer-events-none", "aria-disabled:opacity-50", props.variant === "subtle"
                && "font-medium $muted", props.variant === "button" && $("rounded-md border $line $bg", "px-3 py-2 no-underline $hoverSoft hover:no-underline"), font), href: props.disabled ? undefined : href, rel: away ? props.rel || "noreferrer" : props.rel, target: away ? props.target || "_blank" : props.target, children: [props.children, away ? _jsx(Icon, { name: "external-link" }) : null] });
    },
    Breadcrumb: function Breadcrumb(props) {
        return _jsx("nav", { "aria-label": "Breadcrumb", class: $("lui-breadcrumb flex flex-wrap items-center gap-2", font), children: itemsOf(props.items).map((item, index) => _jsxs("span", { class: "inline-flex items-center gap-2", children: [index ? _jsx(Icon, { class: $("$muted"), name: "chevron-right" }) : null, _jsx(Link, { to: item.to || item.href, children: item.label })] })) });
    },
    Accordion: function Accordion(props) {
        const items = itemsOf(props.items);
        const name = props.name || `luon-accordion-${++accordionId}`;
        const fallback = props.multiple
            ? props.defaultValue || (props.defaultOpen === undefined
                ? [] : [items[props.defaultOpen]?.value])
            : props.defaultValue ?? items[props.defaultOpen]?.value;
        const current = model(props, fallback);
        const open = (value) => pick(current.value, (active) => (props.multiple
            ? Array.isArray(active)
                && active.some((entry) => Object.is(entry, value))
            : Object.is(active, value)));
        const toggle = (value) => {
            const active = read(current.value);
            if (props.multiple) {
                const values = Array.isArray(active) ? active : [];
                current.set(values.some((entry) => Object.is(entry, value))
                    ? values.filter((entry) => !Object.is(entry, value))
                    : [...values, value]);
                return;
            }
            const same = Object.is(active, value);
            current.set(same && props.collapsible !== false ? undefined : value);
        };
        const separated = props.variant === "separated";
        const padding = props.size === "sm" ? "px-3 py-2.5 text-sm"
            : props.size === "lg" ? "px-5 py-5 text-base" : "p-4";
        const duration = `${Math.max(0, Number(props.duration ?? 240))}ms`;
        return _jsx("div", { class: $("lui-accordion grid divide-y divide-[var(--lui-line)] overflow-hidden", "$radius border $line", props.variant === "plain" && "rounded-none border-x-0", separated && "gap-2 overflow-visible border-0 divide-y-0", font), children: items.map((item, index) => _jsxs("section", { class: $(separated && $("overflow-hidden $radius border", "$line")), "data-state": pick(open(item.value), (active) => active ? "open" : "closed"), children: [_jsxs("button", { "aria-controls": `${name}-${index}`, "aria-expanded": open(item.value), class: $("flex w-full items-center justify-between gap-3 text-left", "font-medium $hoverSoft", padding), disabled: item.disabled || props.disabled, type: "button", onClick: (event) => {
                            event.preventDefault();
                            if (!item.disabled && !props.disabled)
                                toggle(item.value);
                        }, children: [_jsxs("span", { class: "inline-flex items-center gap-2", children: [item.icon
                                        ? _jsx(Icon, { name: item.icon }) : null, item.label] }), props.chevron === false ? null : _jsx("span", { class: pick(open(item.value), (active) => $("mr-1 shrink-0 transition-transform", active && "rotate-180")), style: { transitionDuration: duration }, children: _jsx(Icon, { name: props.chevron || "chevron-down" }) })] }), _jsx("div", { "aria-hidden": pick(open(item.value), (active) => String(!active)), class: pick(open(item.value), (active) => $("grid transition-[grid-template-rows,opacity] ease-out", active ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0")), id: `${name}-${index}`, role: "region", style: { transitionDuration: duration }, children: _jsx("div", { class: "min-h-0 overflow-hidden", children: _jsx("div", { class: $("text-sm $muted", props.size === "sm" ? "px-3 pb-3" : props.size === "lg"
                                    ? "px-5 pb-5" : "px-4 pb-4"), children: props.content?.(item, index) ?? item.content
                                    ?? item.children ?? item.description }) }) })] })) });
    },
    Table: function Table(props) {
        const rows = props.data || props.rows || [];
        const columns = props.columns || Object.keys(rows[0] || {}).map((key) => ({
            key,
            label: tableLabel(key),
        }));
        return _jsx("div", { class: $("lui-table-wrap overflow-x-auto $radius", "border $line"), children: _jsxs("table", { class: $("lui-table w-full border-collapse text-left text-sm", font), children: [_jsx("thead", { class: $("$soft"), children: _jsx("tr", { children: columns.map((column) => _jsx("th", { class: $("border-b $line px-3 py-2 font-semibold"), children: column.label || column.header || column.title })) }) }), _jsx("tbody", { children: rows.map((row) => _jsx("tr", { class: $("border-b $line last:border-0"), children: columns.map((column) => {
                                const key = column.key || column.accessorKey;
                                return _jsx("td", { class: "px-3 py-2", children: column.cell ? column.cell(row) : row[key] });
                            }) })) })] }) });
    },
}, (name) => __specs[name]);
