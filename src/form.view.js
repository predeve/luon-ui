// Generated from src/form.tsx.
import { jsx as _jsx, jsxs as _jsxs } from "@luon/view/jsx-runtime";
import { liveView as live, state } from "@luon/view";
import { Icon } from "./icon.view.js";
import { change, $, itemsOf, model, pick, place, read, target, } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
const font = "font-[family-name:var(--lui-font)] $text";
const field = $("$radius border $line", "$bg text-sm", font);
const menuTones = {
    danger: "[--lui-action:var(--lui-danger)]",
    error: "[--lui-action:var(--lui-danger)]",
    neutral: "[--lui-action:var(--lui-text)]",
    primary: "[--lui-action:var(--lui-primary)]",
    success: "[--lui-action:var(--lui-success)]",
    warning: "[--lui-action:var(--lui-warning)]",
};
const menuSizes = {
    sm: "min-h-8 px-2.5 py-1.5 text-sm",
    md: "min-h-10 px-3 py-2 text-sm",
    lg: "min-h-11 px-4 py-2.5 text-base",
};
let menuId = 0;
const __specs = {
    CheckboxGroup: uiProps("CheckboxGroup"),
    InputNumber: uiProps("InputNumber"),
    InputTags: uiProps("InputTags"),
    FileUpload: uiProps("FileUpload"),
    InputRating: uiProps("InputRating"),
    Listbox: uiProps("Listbox"),
    PinInput: uiProps("PinInput"),
    SelectMenu: uiProps("SelectMenu"),
};
export const { CheckboxGroup, InputNumber, InputTags, FileUpload, InputRating, Listbox, PinInput, SelectMenu, } = __namedViews({
    CheckboxGroup: function CheckboxGroup(props) {
        const items = itemsOf(props.items);
        const current = model(props, props.defaultValue ?? []);
        const values = () => {
            const value = read(current.value);
            return Array.isArray(value) ? value : [];
        };
        const selected = (value) => values()
            .some((item) => Object.is(item, value));
        const toggle = (value) => current.set(selected(value)
            ? values().filter((item) => !Object.is(item, value))
            : [...values(), value]);
        return _jsx("div", { "aria-label": props["aria-label"] || props.label, class: $("lui-check-group grid gap-2", props.orientation === "horizontal" && "grid-cols-2", font), role: "group", children: items.map((item) => _jsxs("label", { class: $("flex cursor-pointer items-start gap-3 $radius border p-3", "$line $bg $hoverSoft", item.disabled && "opacity-50"), children: [_jsx("input", { checked: live(() => selected(item.value)), class: "peer sr-only", disabled: props.disabled || item.disabled, type: "checkbox", onChange: () => toggle(item.value) }), _jsx("i", { class: $("mt-0.5 grid size-5 shrink-0 place-items-center rounded border", "$line text-transparent", "peer-checked:border-[var(--lui-primary)]", "peer-checked:bg-[var(--lui-primary)] peer-checked:text-white", "peer-focus-visible:outline-3"), children: _jsx(Icon, { name: "check" }) }), _jsxs("span", { class: "grid gap-0.5 text-sm", children: [_jsx("b", { children: item.label }), item.description
                                ? _jsx("small", { class: $("$muted"), children: item.description })
                                : null] })] })) });
    },
    InputNumber: function InputNumber(props) {
        const step = Number(props.step ?? 1);
        const min = props.min === undefined ? -Infinity : Number(props.min);
        const max = props.max === undefined ? Infinity : Number(props.max);
        const current = model(props, props.defaultValue ?? props.min ?? 0);
        const set = (value) => {
            if (!Number.isFinite(value))
                return;
            current.set(Math.min(max, Math.max(min, value)));
        };
        const value = () => Number(read(current.value) || 0);
        return _jsxs("div", { class: $("lui-number inline-grid grid-cols-[auto_minmax(4rem,1fr)_auto]", "overflow-hidden $radius border $line $bg", font), children: [_jsx("button", { "aria-label": "Decrease", class: "grid size-10 place-items-center $hoverSoft disabled:opacity-50", disabled: live(() => props.disabled || value() <= min), type: "button", onClick: () => set(value() - step), children: _jsx(Icon, { name: "minus" }) }), _jsx("input", { "aria-label": props["aria-label"] || props.label || "Number", class: "min-w-0 border-x $line bg-transparent px-2 text-center outline-none", disabled: props.disabled, max: Number.isFinite(max) ? max : undefined, min: Number.isFinite(min) ? min : undefined, step: step, type: "number", value: current.value, onInput: (event) => {
                        set(Number(target(event).value));
                    } }), _jsx("button", { "aria-label": "Increase", class: "grid size-10 place-items-center $hoverSoft disabled:opacity-50", disabled: live(() => props.disabled || value() >= max), type: "button", onClick: () => set(value() + step), children: _jsx(Icon, { name: "plus" }) })] });
    },
    InputTags: function InputTags(props) {
        const current = model(props, props.defaultValue ?? []);
        const draft = state({ value: "" });
        const values = () => {
            const value = read(current.value);
            return Array.isArray(value) ? value.map(String) : [];
        };
        const add = () => {
            const value = draft.value.trim();
            const found = values();
            if (!value || found.includes(value) || found.length >= (props.max ?? Infinity)) {
                return;
            }
            current.set([...found, value]);
            draft.value = "";
        };
        const tags = live(() => values().map((value) => _jsxs("span", { class: $("inline-flex items-center gap-1 rounded $soft", "px-2 py-1 text-xs"), children: [value, _jsx("button", { "aria-label": `Remove ${value}`, disabled: props.disabled || props.readOnly, type: "button", onClick: () => current.set(values().filter((item) => item !== value)), children: _jsx(Icon, { name: "x" }) })] })));
        return _jsxs("div", { class: $("lui-tags flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5", field), children: [props.icon ? _jsx(Icon, { class: $("$muted"), name: props.icon }) : null, tags, _jsx("input", { "aria-label": props["aria-label"] || "Add tag", class: "min-w-24 flex-1 bg-transparent outline-none", disabled: props.disabled, placeholder: props.placeholder, readOnly: props.readOnly, value: live(() => draft.value), onBlur: () => props.addOnBlur && add(), onInput: (event) => {
                        draft.value = target(event).value;
                    }, onKeyDown: (event) => {
                        if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            add();
                        }
                        else if (event.key === "Backspace" && !draft.value && values().length
                            && !props.readOnly) {
                            current.set(values().slice(0, -1));
                        }
                    } }), props.max ? _jsx("small", { class: $("$muted"), children: live(() => `${values().length}/${props.max}`) }) : null] });
    },
    FileUpload: function FileUpload(props) {
        const names = state({ value: [] });
        let input = null;
        const receive = (files) => {
            names.value = files.map((file) => file.name);
            change(props, props.multiple ? files : files[0]);
        };
        return _jsxs("div", { class: $("lui-upload grid place-items-center gap-2 border-2 border-dashed p-6", "text-center $hoverSoft", field), onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                event.preventDefault();
                receive([...(event.dataTransfer?.files || [])]);
            }, children: [_jsx("input", { accept: props.accept, class: "sr-only", disabled: props.disabled, multiple: props.multiple, ref: (node) => input = node, type: "file", onChange: (event) => {
                        receive([...(target(event).files || [])]);
                    } }), _jsx(Icon, { class: $("text-2xl $primaryText"), name: props.icon || "cloud-upload" }), _jsx("b", { children: props.label || "Choose files" }), _jsx("small", { class: $("$muted"), children: live(() => names.value.length ? names.value.join(", ")
                        : props.description || "Drop files here or browse") }), _jsx("button", { class: $("rounded $primaryBg px-3 py-1.5 text-sm text-white"), disabled: props.disabled, type: "button", onClick: () => input?.click(), children: "Browse" })] });
    },
    InputRating: function InputRating(props) {
        const max = Math.max(1, Number(props.max || 5));
        const current = model(props, props.defaultValue ?? 0);
        return _jsx("div", { "aria-label": props["aria-label"] || props.label || "Rating", class: "lui-rating inline-flex gap-1", role: "radiogroup", children: Array.from({ length: max }, (_, index) => index + 1).map((value) => _jsx("button", { "aria-checked": pick(current.value, (item) => Number(item) === value), "aria-label": `${value} of ${max}`, class: pick(current.value, (item) => $("text-2xl leading-none", value <= Number(item) ? "text-[var(--lui-warning)]" : "text-[var(--lui-line)]")), disabled: props.disabled || props.readOnly, role: "radio", type: "button", onClick: () => current.set(value), children: "\u2605" })) });
    },
    Listbox: function Listbox(props) {
        const items = itemsOf(props.items);
        const current = model(props, props.defaultValue ?? (props.multiple ? [] : undefined));
        const selected = (value) => {
            const source = read(current.value);
            return props.multiple
                ? Array.isArray(source) && source.some((item) => Object.is(item, value))
                : Object.is(source, value);
        };
        const choose = (value) => {
            if (!props.multiple)
                return current.set(value);
            const source = read(current.value);
            const values = Array.isArray(source) ? source : [];
            current.set(selected(value)
                ? values.filter((item) => !Object.is(item, value))
                : [...values, value]);
        };
        return _jsx("div", { "aria-label": props["aria-label"] || props.label, class: $("lui-listbox grid gap-1 p-1", field), role: "listbox", children: items.map((item) => _jsxs("button", { "aria-selected": live(() => selected(item.value)), class: live(() => $("flex items-center justify-between rounded px-3 py-2 text-left", selected(item.value)
                    ? "$primaryBg text-white"
                    : "$hoverSoft")), disabled: props.disabled || item.disabled, role: "option", type: "button", onClick: () => choose(item.value), children: [_jsxs("span", { class: "grid", children: [_jsx("b", { children: item.label }), item.description
                                ? _jsx("small", { children: item.description }) : null] }), live(() => selected(item.value) ? _jsx(Icon, { name: "check" }) : null)] })) });
    },
    PinInput: function PinInput(props) {
        const length = Math.max(1, Number(props.length || 4));
        const current = model(props, props.defaultValue ?? "");
        const array = Array.isArray(props.defaultValue)
            || Array.isArray(props.modelValue) || Array.isArray(props.value);
        const refs = [];
        const chars = () => {
            const value = read(current.value);
            return Array.isArray(value) ? value.map(String) : String(value || "").split("");
        };
        const setAt = (index, source) => {
            const values = chars();
            values[index] = source.slice(-1);
            const next = values.slice(0, length);
            current.set(array ? next : next.join(""));
            if (source && index < length - 1)
                refs[index + 1]?.focus();
        };
        const tone = menuTones[props.color || "primary"] || menuTones.primary;
        const size = props.size === "sm" ? "size-9 text-base"
            : props.size === "lg" ? "size-13 text-xl" : "size-11 text-lg";
        return _jsx("div", { class: $("lui-pin flex gap-2", tone), children: Array.from({ length }, (_, index) => _jsx("input", { autoComplete: props.otp ? "one-time-code" : undefined, "aria-label": `${props.label || "Pin"} ${index + 1}`, class: $("text-center", field, size, props.variant === "soft" && "border-transparent $soft", "focus:border-[var(--lui-action)]"), disabled: props.disabled, inputMode: props.type === "number" ? "numeric" : "text", maxLength: "1", pattern: props.type === "number" || props.otp ? "[0-9]*" : undefined, placeholder: props.placeholder, ref: (node) => {
                    refs[index] = node;
                }, type: props.mask ? "password" : "text", value: live(() => chars()[index] || ""), onInput: (event) => {
                    setAt(index, target(event).value);
                }, onKeyDown: (event) => {
                    if (event.key === "Backspace" && !target(event).value
                        && index > 0)
                        refs[index - 1]?.focus();
                } })) });
    },
    SelectMenu: function SelectMenu(props) {
        const items = itemsOf(props.items);
        const current = model(props, props.defaultValue ?? (props.multiple ? [] : ""));
        const query = state({ value: "" });
        const id = props.id || `lui-select-${++menuId}`;
        let trigger = null;
        const selected = (value) => {
            const source = read(current.value);
            return props.multiple
                ? Array.isArray(source)
                    && source.some((entry) => Object.is(entry, value))
                : Object.is(source, value);
        };
        const close = () => {
            const node = document.getElementById(id);
            node?.hidePopover?.();
        };
        const choose = (value) => {
            if (!props.multiple) {
                current.set(value);
                close();
                return;
            }
            const source = read(current.value);
            const values = Array.isArray(source) ? source : [];
            current.set(selected(value)
                ? values.filter((entry) => !Object.is(entry, value))
                : [...values, value]);
        };
        const label = live(() => {
            const found = items.filter((item) => selected(item.value));
            return found.length
                ? found.map((item) => item.label).join(", ")
                : props.placeholder || props.label || "Select";
        });
        const options = live(() => {
            const needle = query.value.trim().toLocaleLowerCase();
            const found = needle
                ? items.filter((item) => `${item.label} ${item.description || ""}`
                    .toLocaleLowerCase().includes(needle))
                : items;
            if (!found.length) {
                return _jsx("small", { class: $("p-3 $muted"), children: "No results" });
            }
            return found.map((item) => _jsxs("button", { "aria-selected": live(() => selected(item.value)), class: live(() => $("flex items-center gap-2 rounded px-3 py-2 text-left", selected(item.value)
                    ? "$soft font-semibold"
                    : "$hoverSoft")), disabled: item.disabled, role: "option", type: "button", onClick: () => choose(item.value), children: [item.icon ? _jsx(Icon, { name: item.icon }) : null, _jsxs("span", { class: "grid flex-1", children: [_jsx("span", { children: item.label }), item.description
                                ? _jsx("small", { class: $("$muted"), children: item.description })
                                : null] }), live(() => selected(item.value) ? _jsx(Icon, { name: "check" }) : null)] }));
        });
        return _jsxs("div", { class: $("lui-select-menu relative", font), children: [_jsxs("button", { "aria-label": props["aria-label"] || props.label, class: $("flex w-full items-center gap-2 text-left", field, menuTones[props.color || "primary"] || menuTones.primary, menuSizes[props.size || "md"] || menuSizes.md, props.variant === "soft" && "border-transparent $soft"), disabled: props.disabled || props.loading, popovertarget: id, ref: (node) => {
                        trigger = node;
                    }, type: "button", children: [props.icon ? _jsx(Icon, { name: props.icon }) : null, _jsx("span", { class: "min-w-0 flex-1", children: label }), _jsx(Icon, { class: $(props.loading && "animate-spin"), name: props.loading ? "loader" : "chevron-down" })] }), _jsxs("div", { class: $("m-0 min-w-48 $radius border", "$line $bg p-1 shadow-xl"), id: id, popover: "auto", onToggle: (event) => {
                        const menu = target(event);
                        const open = menu.matches(":popover-open");
                        trigger?.setAttribute("aria-expanded", String(open));
                        if (trigger && open) {
                            place(menu, trigger, props.align, props.width ?? trigger.getBoundingClientRect().width);
                        }
                    }, children: [props.searchInput === false ? null : _jsx("input", { "aria-label": props.searchPlaceholder || "Search", class: $("mb-2 w-full px-3 py-2", field), placeholder: props.searchPlaceholder || "Search", value: live(() => query.value), onInput: (event) => {
                                query.value = target(event).value;
                            } }), _jsx("div", { class: "grid gap-1", role: "listbox", children: options })] })] });
    },
}, (name) => __specs[name]);
