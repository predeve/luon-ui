// Generated from src/more.tsx.
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@luon/view/jsx-runtime";
import { liveView as live, passProps, state, } from "@luon/view";
import { Icon } from "./icon.view.js";
import { focus, font, tones } from "./skin.ts";
import { $, itemsOf, menuKeys, model, place, read, resetPlace, target, } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
function childrenOf(children) {
    const values = [];
    const add = (value) => {
        if (Array.isArray(value)) {
            for (const child of value)
                add(child);
        }
        else if (value != null)
            values.push(value);
    };
    if (children != null)
        add(children);
    return values;
}
function clone(child) {
    return child instanceof Node ? child.cloneNode(true) : child;
}
function TreeNode(props, item, level) {
    const source = item;
    const children = itemsOf(source.children || []);
    const label = _jsxs("span", { class: "inline-flex items-center gap-2", children: [item.icon ? _jsx(Icon, { name: item.icon }) : null, _jsx("span", { children: item.label })] });
    if (!children.length) {
        return _jsx("button", { class: $("w-full rounded px-2 py-1.5 text-left $hoverSoft"), disabled: item.disabled || props.disabled, style: { paddingLeft: `${level * 1.25 + .5}rem` }, type: "button", onClick: () => {
                props.onSelect?.(item.value, item);
                props.onChange?.(item.value);
            }, children: label });
    }
    return _jsxs("details", { open: source.defaultOpen || props.defaultOpenAll, children: [_jsx("summary", { class: $("cursor-pointer rounded px-2 py-1.5 $hoverSoft"), style: { paddingLeft: `${level * 1.25 + .5}rem` }, children: label }), children.map((child) => TreeNode(props, child, level + 1))] });
}
function menuItems(values, close, disabled = false) {
    return values.flat(Infinity).map((value) => {
        const source = value;
        const item = itemsOf([value])[0];
        if (source?.type === "separator") {
            return _jsx("hr", { class: $("my-1 $line"), role: "separator" });
        }
        if (source?.type === "label") {
            return _jsx("span", { class: $("px-3 py-1 text-xs font-medium $muted"), children: item.label });
        }
        const locked = disabled || item.disabled;
        const choose = (event) => {
            if (locked) {
                event.preventDefault();
                return;
            }
            close();
            source?.onSelect?.();
            source?.onClick?.(event);
        };
        const body = _jsxs(_Fragment, { children: [item.icon ? _jsx(Icon, { class: "shrink-0", name: item.icon }) : null, _jsxs("span", { class: "grid flex-1", children: [_jsx("span", { children: item.label }), item.description
                            ? _jsx("small", { class: $("$muted"), children: item.description }) : null] }), source?.kbds?.length ? _jsx("kbd", { class: $("ml-4 text-xs $muted"), children: source.kbds.join("+") }) : null] });
        const style = $("flex items-center gap-2 rounded px-3 py-2 text-left text-sm", "$hoverSoft focus-visible:bg-[var(--lui-soft)] outline-none", "disabled:opacity-40 aria-disabled:opacity-40", ["danger", "error"].includes(source?.color) && "$dangerText");
        return source?.to || source?.href ? _jsx("a", { "aria-disabled": locked || undefined, class: style, href: locked ? undefined : source.to || source.href, role: "menuitem", tabindex: -1, onClick: choose, children: body }) : _jsx("button", { class: style, disabled: locked, role: "menuitem", tabindex: -1, type: "button", onClick: choose, children: body });
    });
}
let menuId = 0;
function dateOf(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(0);
        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return dayKey(date) === value ? date : undefined;
    }
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
}
function dayKey(value) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function sameDay(left, right) {
    const a = dateOf(left);
    const b = dateOf(right);
    return Boolean(a && b && dayKey(a) === dayKey(b));
}
const __specs = {
    Carousel: uiProps("Carousel"),
    Marquee: uiProps("Marquee"),
    Tree: uiProps("Tree"),
    DropdownMenu: uiProps("DropdownMenu"),
    ContextMenu: uiProps("ContextMenu"),
    Calendar: uiProps("Calendar"),
};
export const { Carousel, Marquee, Tree, DropdownMenu, ContextMenu, Calendar, } = __namedViews({
    Carousel: function Carousel(props) {
        const children = childrenOf(props.children);
        const active = state({ value: 0 });
        let timer;
        const move = (value) => {
            if (!children.length)
                return;
            active.value = (value + children.length) % children.length;
            props.onChange?.(active.value);
        };
        const ref = (node) => {
            if (timer)
                clearInterval(timer);
            timer = undefined;
            if (!node || !props.autoplay || children.length < 2)
                return;
            queueMicrotask(() => {
                if (!node.isConnected)
                    return;
                timer = setInterval(() => move(active.value + 1), Number(props.interval || 4500));
            });
        };
        return _jsxs("section", { "aria-roledescription": "carousel", class: $("lui-carousel grid gap-3", font), ref: ref, children: [_jsx("div", { class: "overflow-hidden", children: _jsx("div", { class: "flex transition-transform duration-300", style: live(() => ({ transform: `translateX(-${active.value * 100}%)` })), children: children.map((child, index) => _jsx("div", { "aria-hidden": live(() => index !== active.value), class: "w-full shrink-0", children: child })) }) }), children.length > 1 ? _jsxs("nav", { class: "flex items-center justify-center gap-2", children: [_jsx("button", { "aria-label": "Previous slide", class: $("grid size-9 place-items-center rounded $hoverSoft"), type: "button", onClick: () => move(active.value - 1), children: _jsx(Icon, { name: "chevron-left" }) }), children.map((_, index) => _jsx("button", { "aria-label": `Go to slide ${index + 1}`, "aria-pressed": live(() => index === active.value), class: live(() => $("size-2 rounded-full", index === active.value
                                ? "$primaryBg" : "bg-[var(--lui-line)]")), type: "button", onClick: () => move(index) })), _jsx("button", { "aria-label": "Next slide", class: $("grid size-9 place-items-center rounded $hoverSoft"), type: "button", onClick: () => move(active.value + 1), children: _jsx(Icon, { name: "chevron-right" }) })] }) : null] });
    },
    Marquee: function Marquee(props) {
        const source = props.children ?? itemsOf(props.items).map((item) => item.label);
        const children = childrenOf(source);
        const speed = `${Number(props.duration || props.speed || 24)}s`;
        return _jsx("div", { class: "lui-marquee overflow-hidden", children: _jsxs("div", { class: $("flex w-max gap-4 motion-reduce:animate-none", "[animation:lui-marquee_var(--lui-speed)_linear_infinite]", props.reverse && "[animation-direction:reverse]", props.pauseOnHover && "hover:[animation-play-state:paused]"), style: { "--lui-speed": speed }, children: [_jsx("div", { class: "flex gap-4", children: children }), _jsx("div", { "aria-hidden": "true", class: "flex gap-4", children: children.map(clone) })] }) });
    },
    Tree: function Tree(props) {
        return _jsx("div", { class: $("lui-tree grid text-sm", font), role: "tree", children: itemsOf(props.items).map((item) => TreeNode(props, item, 0)) });
    },
    DropdownMenu: function DropdownMenu(props) {
        const id = props.id || `lui-menu-${++menuId}`;
        let menu = null;
        let root = null;
        let anchor = null;
        let opened = false;
        const sync = () => {
            anchor ||= root?.querySelector(`[popovertarget="${id}"]`)
                || null;
            anchor?.setAttribute("aria-expanded", String(opened));
            anchor?.setAttribute("aria-controls", id);
            anchor?.setAttribute("aria-haspopup", "menu");
        };
        const close = () => {
            opened = false;
            sync();
            menu?.hidePopover?.();
            if (anchor?.isConnected)
                anchor.focus();
        };
        const open = (last = false) => {
            if (props.disabled || !menu)
                return;
            opened = true;
            sync();
            menu.showPopover?.();
            if (anchor)
                place(menu, anchor, props.align, props.width, props.side);
            const nodes = [...menu.querySelectorAll('[role="menuitem"]')]
                .filter((node) => !node.matches(':disabled, [aria-disabled="true"]'));
            (last ? nodes.at(-1) : nodes[0])?.focus();
        };
        const source = props.slotTrigger?.() ?? props.trigger ?? props.children;
        const attrs = { "aria-controls": id, "aria-expanded": false,
            "aria-haspopup": "menu", popovertarget: id,
            ...(props.disabled ? { disabled: true } : {}) };
        let trigger;
        if (source instanceof HTMLElement) {
            anchor = source.matches("button, a, [role=button]") ? source
                : source.querySelector("button, a, [role=button]");
            if (anchor) {
                for (const [key, value] of Object.entries(attrs)) {
                    anchor.setAttribute(key, String(value));
                }
                trigger = source;
            }
            else
                trigger = _jsx("button", { ...attrs, type: "button", children: source });
        }
        else if (passProps(source, attrs))
            trigger = source;
        else
            trigger = _jsxs("button", { ...attrs, class: $("inline-flex items-center gap-2 $radius border $line $bg", "px-3 py-2 text-sm disabled:opacity-50", focus), type: "button", children: [source ?? props.label ?? "Menu", _jsx(Icon, { class: "mr-1", name: "chevron-down" })] });
        return _jsxs("span", { class: "lui-menu-root contents", ref: (node) => {
                root = node;
                if (node)
                    queueMicrotask(() => { if (node.isConnected)
                        sync(); });
            }, onClick: (event) => {
                if (event.defaultPrevented || menu?.contains(event.target))
                    return;
                const node = event.target instanceof Element
                    ? event.target.closest("button, a, [role=button]") : null;
                if (!node)
                    return;
                event.preventDefault();
                anchor = node;
                if (!props.disabled) {
                    if (opened)
                        close();
                    else
                        open();
                }
            }, onKeyDown: (event) => {
                if (!menu || event.defaultPrevented || event.isComposing)
                    return;
                if (menu.contains(event.target))
                    menuKeys(event, menu, close);
                else if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                    event.preventDefault();
                    anchor = event.target;
                    open(event.key === "ArrowUp");
                }
            }, children: [trigger, _jsx("div", { class: $("lui-menu m-0 hidden min-w-48 gap-0.5 open:grid", "$radius border $line $bg p-1 shadow-[var(--lui-shadow-overlay)]", font), id: id, popover: "auto", role: "menu", ref: (node) => menu = node, onToggle: (event) => {
                        const shown = event.newState === "open";
                        if (shown && !opened)
                            open();
                        else {
                            opened = shown;
                            sync();
                        }
                    }, children: menuItems(props.items || [], close, props.disabled) })] });
    },
    ContextMenu: function ContextMenu(props) {
        let menu = null;
        let root = null;
        let anchor = null;
        let unbind = () => { };
        const close = (restore = true) => {
            unbind();
            unbind = () => { };
            menu?.hidePopover?.();
            if (restore && anchor?.isConnected)
                anchor.focus();
        };
        const open = (x, y) => {
            if (!menu || !root || props.disabled)
                return;
            close(false);
            resetPlace(menu);
            if (props.width !== undefined) {
                menu.style.width = typeof props.width === "number"
                    ? `${props.width}px` : props.width;
            }
            menu.showPopover?.();
            menu.style.maxWidth = `${Math.max(0, innerWidth - 16)}px`;
            menu.style.maxHeight = `${Math.max(0, innerHeight - 16)}px`;
            menu.style.overflowY = "auto";
            menu.style.left = `${Math.max(8, Math.min(x, innerWidth - menu.offsetWidth - 8))}px`;
            menu.style.top = `${Math.max(8, Math.min(y, innerHeight - menu.offsetHeight - 8))}px`;
            menu.querySelector('[role="menuitem"]:not(:disabled):not([aria-disabled="true"])')?.focus();
            const doc = root.ownerDocument;
            const outside = (event) => {
                if (!menu?.contains(event.target))
                    close(false);
            };
            const key = (event) => {
                if (event.key === "Escape")
                    close();
            };
            doc.addEventListener("pointerdown", outside, true);
            doc.addEventListener("keydown", key);
            unbind = () => {
                doc.removeEventListener("pointerdown", outside, true);
                doc.removeEventListener("keydown", key);
            };
        };
        return _jsxs("div", { class: "lui-context", tabindex: props.disabled ? -1 : 0, "aria-label": props["aria-label"], ref: (node) => {
                unbind();
                root = node;
            }, onKeyDown: (event) => {
                if (menu?.contains(event.target)) {
                    menuKeys(event, menu, close);
                }
                else if (event.key === "ContextMenu"
                    || (event.shiftKey && event.key === "F10")) {
                    event.preventDefault();
                    anchor = event.target;
                    const box = anchor.getBoundingClientRect();
                    open(box.left, box.bottom);
                }
            }, onContextMenu: (event) => {
                if (props.disabled)
                    return;
                event.preventDefault();
                anchor = event.target instanceof HTMLElement
                    && event.target.matches("button, a, input, [tabindex]")
                    ? event.target : root;
                open(event.clientX, event.clientY);
            }, children: [props.children, _jsx("div", { class: $("lui-context-menu fixed m-0 hidden min-w-48 gap-0.5 open:grid", "$radius border $line $bg p-1 shadow-[var(--lui-shadow-overlay)]", font), popover: "manual", role: "menu", ref: (node) => menu = node, children: menuItems(props.items || [], close, props.disabled) })] });
    },
    Calendar: function Calendar(props) {
        const selected = model(props, props.defaultValue);
        const initialValue = read(selected.value);
        const seed = props.range ? initialValue?.start || initialValue?.from
            : Array.isArray(initialValue) ? initialValue[0] : initialValue;
        const initial = dateOf(seed) || dateOf(props.defaultMonth) || new Date();
        const month = state({
            value: new Date(initial.getFullYear(), initial.getMonth(), 1),
        });
        const locale = props.locale || "en-US";
        const weekStartsOn = Number(props.weekStartsOn ?? 0);
        const blocked = (date) => {
            const min = dateOf(props.min);
            const max = dateOf(props.max);
            const key = dayKey(date);
            return Boolean(props.disabled || props.readOnly
                || (min && key < dayKey(min)) || (max && key > dayKey(max))
                || props.isDateDisabled?.(date));
        };
        const select = (date) => {
            if (blocked(date))
                return;
            const value = read(selected.value);
            const start = dateOf(value?.start || value?.from);
            const end = dateOf(value?.end || value?.to);
            if (props.range) {
                selected.set(!start || end || date < start
                    ? { start: date, end: undefined }
                    : { start, end: date });
            }
            else if (props.multiple) {
                const values = Array.isArray(value) ? value : [];
                selected.set(values.some((item) => sameDay(item, date))
                    ? values.filter((item) => !sameDay(item, date))
                    : [...values, date]);
            }
            else
                selected.set(date);
        };
        const view = live(() => {
            const shown = month.value;
            const value = read(selected.value);
            const first = new Date(shown);
            const offset = (first.getDay() - weekStartsOn + 7) % 7;
            first.setDate(1 - offset);
            const last = new Date(shown.getFullYear(), shown.getMonth() + 1, 0);
            const span = Math.ceil((last.getDate()
                + (shown.getDay() - weekStartsOn + 7) % 7) / 7) * 7;
            const days = Array.from({ length: props.fixedWeeks === false ? span : 42 }, (_, index) => {
                const date = new Date(first);
                date.setDate(first.getDate() + index);
                return date;
            });
            const rangeStart = dateOf(value?.start || value?.from);
            const rangeEnd = dateOf(value?.end || value?.to);
            const title = new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
            }).format(shown);
            return _jsxs(_Fragment, { children: [_jsxs("header", { class: "lui-calendar__head flex items-center justify-between gap-2", children: [_jsx("button", { "aria-label": "Previous month", class: $("lui-calendar__nav grid size-9 place-items-center rounded", "$hoverSoft"), type: "button", onClick: () => month.value = new Date(shown.getFullYear(), shown.getMonth() - 1, 1), children: _jsx(Icon, { name: "chevron-left" }) }), props.caption === "dropdown" || props.monthControls
                                || props.yearControls
                                ? _jsxs("span", { class: "lui-calendar__caption flex gap-1", children: [_jsxs("label", { class: "relative flex items-center", children: [_jsx("select", { "aria-label": "Month", class: $("appearance-none rounded border $line", "$bg py-1 pr-8 pl-1"), value: shown.getMonth(), onChange: (event) => {
                                                        month.value = new Date(shown.getFullYear(), Number(target(event).value), 1);
                                                    }, children: Array.from({ length: 12 }, (_, index) => _jsx("option", { value: index, children: new Intl.DateTimeFormat(locale, { month: "long" })
                                                            .format(new Date(2026, index, 1)) })) }), _jsx(Icon, { class: "pointer-events-none absolute right-3", name: "chevron-down", size: 14 })] }), _jsxs("label", { class: "relative flex items-center", children: [_jsx("select", { "aria-label": "Year", class: $("appearance-none rounded border $line", "$bg py-1 pr-8 pl-1"), value: shown.getFullYear(), onChange: (event) => {
                                                        month.value = new Date(Number(target(event).value), shown.getMonth(), 1);
                                                    }, children: Array.from({ length: 21 }, (_, index) => (shown.getFullYear() - 10 + index)).map((year) => _jsx("option", { value: year, children: year })) }), _jsx(Icon, { class: "pointer-events-none absolute right-3", name: "chevron-down", size: 14 })] })] }) : _jsx("button", { class: "lui-calendar__title font-semibold", type: "button", onClick: () => {
                                    const today = new Date();
                                    month.value = new Date(today.getFullYear(), today.getMonth(), 1);
                                }, children: title }), _jsx("button", { "aria-label": "Next month", class: $("lui-calendar__nav grid size-9 place-items-center rounded", "$hoverSoft"), type: "button", onClick: () => month.value = new Date(shown.getFullYear(), shown.getMonth() + 1, 1), children: _jsx(Icon, { name: "chevron-right" }) })] }), _jsx("div", { class: $("lui-calendar__week grid grid-cols-7 text-center text-xs", "$muted"), children: Array.from({ length: 7 }, (_, index) => {
                            const date = new Date(2026, 7, 2 + ((weekStartsOn + index) % 7));
                            return _jsx("b", { children: new Intl.DateTimeFormat(locale, {
                                    weekday: props.weekdayFormat || props.weekday || "short",
                                })
                                    .format(date) });
                        }) }), _jsx("div", { class: "lui-calendar__days grid grid-cols-7", children: days.map((date) => {
                            const values = Array.isArray(value) ? value : [value];
                            const active = props.range
                                ? sameDay(rangeStart, date) || sameDay(rangeEnd, date)
                                : values.some((item) => sameDay(item, date));
                            const inRange = Boolean(props.range && rangeStart && rangeEnd
                                && date >= rangeStart && date <= rangeEnd);
                            const outside = date.getMonth() !== shown.getMonth();
                            const hidden = outside && props.showOutside === false;
                            const disabled = blocked(date) || hidden;
                            const day = {
                                active,
                                date,
                                day: date.getDate(),
                                disabled,
                                key: dayKey(date),
                                outside,
                                today: sameDay(new Date(), date),
                            };
                            return _jsx("button", { "aria-hidden": hidden || undefined, "aria-label": new Intl.DateTimeFormat(locale, { dateStyle: "long" })
                                    .format(date), "aria-pressed": active, class: $("lui-calendar__day grid min-h-9 place-items-center rounded text-sm", "$hoverSoft disabled:opacity-30", outside && "outside $muted opacity-60", day.today && "today font-bold $actionText", inRange && !active && "between $actionSoft", active && "active $actionBg text-[var(--lui-on-action)]", props.variant === "planner" && "min-h-20 content-start p-1"), disabled: disabled, tabindex: hidden ? -1 : undefined, type: "button", onClick: () => select(date), children: outside && props.showOutside === false ? null
                                    : props.renderDay?.(day) ?? date.getDate() });
                        }) }), props.showToday || props.showClear ? _jsxs("footer", { class: $("flex items-center justify-end gap-2 border-t $line pt-3"), children: [props.showClear ? _jsx("button", { class: $("rounded px-2 py-1 text-sm $muted $hoverSoft"), type: "button", disabled: props.disabled || props.readOnly, onClick: () => {
                                    if (!props.disabled && !props.readOnly) {
                                        selected.set(props.multiple ? [] : undefined);
                                    }
                                }, children: "Clear" }) : null, props.showToday ? _jsx("button", { disabled: blocked(new Date()), class: $("rounded px-2 py-1 text-sm font-semibold $actionText $hoverSoft"), type: "button", onClick: () => {
                                    const today = new Date();
                                    month.value = new Date(today.getFullYear(), today.getMonth(), 1);
                                    select(today);
                                }, children: "Today" }) : null] }) : null] });
        });
        return _jsx("section", { class: $("lui-calendar grid gap-3 $radius border p-4", "$line $bg", props.variant === "planner" && "lui-calendar--planner", tones[props.color || "primary"] || tones.primary, font), children: view });
    },
}, (name) => __specs[name]);
