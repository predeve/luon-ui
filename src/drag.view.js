// Generated from src/drag.tsx.
import { jsx as _jsx } from "@luon/view/jsx-runtime";
import { liveView as live } from "@luon/view";
import { model, read, valueOf } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
function pointOf(value) {
    const point = value;
    return {
        x: Number.isFinite(point?.x) ? Number(point?.x) : 0,
        y: Number.isFinite(point?.y) ? Number(point?.y) : 0,
    };
}
function gripOf(event, node, handle) {
    const target = event.target;
    if (!(target instanceof Element))
        return false;
    if (handle) {
        const grip = target.closest(handle);
        return Boolean(grip && node.contains(grip));
    }
    return !target.closest("a,button,input,select,textarea,[contenteditable=true]");
}
function limitOf(node, point, bounds) {
    const any = Number.MAX_SAFE_INTEGER;
    if (!bounds)
        return { maxX: any, maxY: any, minX: -any, minY: -any };
    if (typeof bounds === "object" && !(bounds instanceof HTMLElement)) {
        return {
            maxX: bounds.right ?? any,
            maxY: bounds.bottom ?? any,
            minX: bounds.left ?? -any,
            minY: bounds.top ?? -any,
        };
    }
    const parent = bounds === "parent" ? node.parentElement : bounds;
    if (!parent)
        return { maxX: any, maxY: any, minX: -any, minY: -any };
    const box = node.getBoundingClientRect();
    const area = parent.getBoundingClientRect();
    return {
        maxX: point.x + area.right - box.right,
        maxY: point.y + area.bottom - box.bottom,
        minX: point.x + area.left - box.left,
        minY: point.y + area.top - box.top,
    };
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function capturePointer(node, pointer) {
    try {
        node.setPointerCapture?.(pointer);
    }
    catch {
        // A detached node or an already released pointer cannot be captured.
    }
}
function releasePointer(node, pointer) {
    try {
        node?.releasePointerCapture?.(pointer);
    }
    catch {
        // Pointer capture may already have been released by the browser.
    }
}
function trackPointer(name, listener, active) {
    const method = active ? "addEventListener" : "removeEventListener";
    window[method](name, listener, true);
}
const sortModels = new Set();
let sorting;
function groupOf(model) {
    const group = model.props.group;
    return typeof group === "string" ? { name: group } : group;
}
function accepts(source, target) {
    if (source === target)
        return true;
    const from = groupOf(source);
    const to = groupOf(target);
    if (!from?.name || from.name !== to?.name || from.pull === false
        || to.put === false)
        return false;
    return !Array.isArray(to.put) || to.put.includes(from.name);
}
function sortItems(model, drag = sorting) {
    if (!model.node)
        return [];
    return [...model.node.children].filter((item) => (item !== drag?.item && item !== drag?.hint
        && item instanceof HTMLElement));
}
function itemOf(event, model) {
    if (!model.node || propsOff(model.props, event))
        return;
    let item = event.target instanceof Element ? event.target : null;
    while (item?.parentElement && item.parentElement !== model.node) {
        item = item.parentElement;
    }
    if (!(item instanceof HTMLElement) || item.parentElement !== model.node) {
        return;
    }
    if (model.props.handle) {
        const grip = event.target instanceof Element
            ? event.target.closest(model.props.handle)
            : null;
        if (!grip || !item.contains(grip))
            return;
    }
    else if (!gripOf(event, item))
        return;
    return item;
}
function propsOff(props, event) {
    return props.disabled || event.button !== 0 || event.isPrimary === false;
}
function cleanIds(node) {
    node.removeAttribute("id");
    for (const child of node.querySelectorAll("[id]")) {
        child.removeAttribute("id");
    }
}
function sortDetail(drag, event, target = drag.target) {
    return {
        event,
        from: drag.source.node,
        item: drag.item,
        newIndex: hintIndex(drag, target),
        oldIndex: drag.from,
        to: target?.node || drag.source.node,
    };
}
function startSort(event) {
    const drag = sorting;
    const box = drag.item.getBoundingClientRect();
    const preview = drag.item.cloneNode(true);
    const hint = drag.item.cloneNode(false);
    cleanIds(preview);
    cleanIds(hint);
    preview.classList.add("lui-sortable-preview");
    preview.setAttribute("aria-hidden", "true");
    Object.assign(preview.style, {
        height: `${box.height}px`,
        left: "0",
        margin: "0",
        top: "0",
        width: `${box.width}px`,
    });
    hint.classList.add("lui-sortable-hint");
    hint.setAttribute("aria-hidden", "true");
    Object.assign(hint.style, {
        height: `${box.height}px`,
        width: `${box.width}px`,
    });
    drag.item.before(hint);
    drag.item.classList.add("lui-sortable-chosen");
    drag.item.style.display = "none";
    document.body.append(preview);
    document.documentElement.classList.add("lui-sort-active");
    drag.source.node?.classList.add("lui-sortable-active");
    Object.assign(drag, {
        hint,
        moved: true,
        offsetX: drag.px - box.left,
        offsetY: drag.py - box.top,
        preview,
    });
    movePreview(event);
    drag.source.props.onStart?.(sortDetail(drag, event, drag.source));
}
function movePreview(event) {
    const drag = sorting;
    if (!drag?.preview)
        return;
    drag.preview.style.translate =
        `${event.clientX - drag.offsetX}px ${event.clientY - drag.offsetY}px`;
}
function modelAt(event) {
    const drag = sorting;
    const hit = document.elementFromPoint?.(event.clientX, event.clientY);
    const matches = [...sortModels].filter((model) => (model.node?.isConnected && accepts(drag.source, model)));
    const exact = matches.find((model) => hit && model.node?.contains(hit));
    if (exact)
        return exact;
    return matches.find((model) => {
        const box = model.node.getBoundingClientRect();
        return event.clientX >= box.left && event.clientX <= box.right
            && event.clientY >= box.top && event.clientY <= box.bottom;
    });
}
function hintBefore(model, event) {
    const horizontal = model.props.direction === "horizontal";
    return sortItems(model).find((item) => {
        const box = item.getBoundingClientRect();
        return horizontal
            ? event.clientX < box.left + box.width / 2
            : event.clientY < box.top + box.height / 2;
    });
}
function rectsOf(models) {
    const rects = new Map();
    for (const model of models) {
        for (const item of sortItems(model)) {
            rects.set(item, item.getBoundingClientRect());
        }
    }
    return rects;
}
function animateSort(rects, models) {
    const duration = Math.max(...models.map((model) => Number(model.props.animation ?? 220)));
    if (duration <= 0)
        return;
    for (const model of models) {
        for (const item of sortItems(model)) {
            const from = rects.get(item);
            const to = item.getBoundingClientRect();
            const x = from ? from.left - to.left : 0;
            const y = from ? from.top - to.top : 0;
            if (!x && !y)
                continue;
            item.animate?.([
                { translate: `${x}px ${y}px` },
                { translate: "0 0" },
            ], {
                duration,
                easing: "cubic-bezier(.22, 1, .36, 1)",
            });
        }
    }
}
function placeHint(model, event) {
    const drag = sorting;
    const hint = drag.hint;
    const before = hintBefore(model, event);
    if (hint.parentElement === model.node && hint.nextElementSibling === before) {
        return;
    }
    const models = drag.target === model ? [model] : [drag.target, model];
    const rects = rectsOf(models);
    model.node.insertBefore(hint, before || null);
    drag.target.node?.classList.remove("lui-sortable-target");
    drag.target = model;
    model.node.classList.add("lui-sortable-target");
    animateSort(rects, models);
    model.props.onMove?.(sortDetail(drag, event, model));
}
function scrollSort(model, event) {
    let node = model.node;
    while (node && node.scrollHeight <= node.clientHeight
        && node.scrollWidth <= node.clientWidth)
        node = node.parentElement;
    if (!node)
        return;
    const box = node.getBoundingClientRect();
    const edge = 36;
    const speed = 14;
    if (event.clientY - box.top < edge)
        node.scrollTop -= speed;
    else if (box.bottom - event.clientY < edge)
        node.scrollTop += speed;
    if (event.clientX - box.left < edge)
        node.scrollLeft -= speed;
    else if (box.right - event.clientX < edge)
        node.scrollLeft += speed;
}
function hintIndex(drag, model) {
    const hint = drag.hint;
    if (!hint || hint.parentElement !== model.node)
        return drag.from;
    let index = 0;
    for (const child of model.node.children) {
        if (child === hint)
            return index;
        if (child !== drag.item)
            index++;
    }
    return index;
}
function sortMove(event) {
    const drag = sorting;
    if (!drag || drag.pointer !== event.pointerId)
        return;
    if (!drag.moved) {
        const threshold = Math.max(0, Number(drag.source.props.threshold ?? 4));
        if (Math.hypot(event.clientX - drag.px, event.clientY - drag.py)
            < threshold)
            return;
        startSort(event);
        if (sorting !== drag)
            return;
    }
    event.preventDefault();
    movePreview(event);
    const target = modelAt(event);
    if (!target)
        return;
    placeHint(target, event);
    if (sorting !== drag)
        return;
    scrollSort(target, event);
}
function setSortValues(drag, detail) {
    const target = drag.target;
    const index = detail.newIndex;
    const source = [...drag.source.get()];
    const moved = source.splice(drag.from, 1);
    if (!moved.length)
        return;
    if (target === drag.source) {
        source.splice(index, 0, moved[0]);
        drag.source.set(source);
    }
    else {
        const values = [...target.get()];
        values.splice(index, 0, moved[0]);
        drag.source.set(source);
        target.set(values);
    }
    drag.source.props.onSort?.(detail);
    if (target !== drag.source)
        target.props.onSort?.(detail);
}
function cleanSort(event, cancel) {
    const drag = sorting;
    if (!drag)
        return;
    let final;
    let ended;
    if (drag.moved) {
        if (cancel) {
            drag.source.node?.insertBefore(drag.item, drag.next?.parentElement === drag.source.node ? drag.next : null);
        }
        else {
            drag.target.node?.insertBefore(drag.item, drag.hint || null);
            final = sortDetail(drag, event, drag.target);
        }
        ended = final ?? sortDetail(drag, event, drag.target);
        drag.item.style.display = drag.display;
        drag.item.classList.remove("lui-sortable-chosen");
        drag.preview?.remove();
        drag.hint?.remove();
        drag.source.node?.classList.remove("lui-sortable-active");
        drag.target.node?.classList.remove("lui-sortable-target");
        document.documentElement.classList.remove("lui-sort-active");
    }
    releasePointer(drag.source.node, event.pointerId);
    trackSort(false);
    sorting = undefined;
    if (final)
        setSortValues(drag, final);
    if (ended)
        drag.source.props.onEnd?.(ended);
}
function sortEnd(event, cancel = false) {
    if (!sorting || sorting.pointer !== event.pointerId)
        return;
    cleanSort(event, cancel);
}
function sortCancel(event) {
    sortEnd(event, true);
}
function trackSort(active) {
    trackPointer("pointermove", sortMove, active);
    trackPointer("pointerup", sortEnd, active);
    trackPointer("pointercancel", sortCancel, active);
}
function sortDown(event, model) {
    if (sorting)
        return;
    const item = itemOf(event, model);
    if (!item || !model.node)
        return;
    sorting = {
        display: item.style.display,
        from: sortItems(model, undefined).indexOf(item),
        item,
        moved: false,
        next: item.nextElementSibling,
        offsetX: 0,
        offsetY: 0,
        pointer: event.pointerId,
        px: event.clientX,
        py: event.clientY,
        source: model,
        target: model,
    };
    capturePointer(model.node, event.pointerId);
    trackSort(true);
}
const __specs = {
    Draggable: uiProps("Draggable"),
    Sortable: uiProps("Sortable"),
};
export const { Draggable, Sortable, } = __namedViews({
    Draggable: function Draggable(props) {
        const current = model(props, props.defaultValue ?? { x: 0, y: 0 }, valueOf(props));
        let node = null;
        let drag;
        const track = (active) => {
            trackPointer("pointermove", move, active);
            trackPointer("pointerup", end, active);
            trackPointer("pointercancel", end, active);
        };
        const detail = (event, point, element = node, start = drag?.base ?? point) => ({
            event,
            node: element,
            point,
            start,
        });
        const down = (event) => {
            if (!node || props.disabled || event.button !== 0
                || !gripOf(event, node, props.handle))
                return;
            const base = pointOf(read(current.value));
            drag = {
                base,
                limit: limitOf(node, base, props.bounds),
                moved: false,
                pointer: event.pointerId,
                px: event.clientX,
                py: event.clientY,
            };
            capturePointer(node, event.pointerId);
            track(true);
        };
        const move = (event) => {
            if (!node || !drag || drag.pointer !== event.pointerId)
                return;
            const active = drag;
            const element = node;
            const dx = event.clientX - active.px;
            const dy = event.clientY - active.py;
            if (!active.moved) {
                const threshold = Math.max(0, Number(props.threshold ?? 4));
                if (Math.hypot(dx, dy) < threshold)
                    return;
                active.moved = true;
                element.classList.add("lui-draggable-dragging");
                props.onStart?.(detail(event, active.base, element, active.base));
                if (drag !== active || node !== element)
                    return;
            }
            event.preventDefault();
            const axis = props.axis ?? "both";
            const point = {
                x: axis === "y" ? active.base.x : clamp(active.base.x + dx, active.limit.minX, active.limit.maxX),
                y: axis === "x" ? active.base.y : clamp(active.base.y + dy, active.limit.minY, active.limit.maxY),
            };
            current.set(point);
            if (drag === active && node === element) {
                props.onMove?.(detail(event, point, element, active.base));
            }
        };
        const end = (event) => {
            if (!node || !drag || drag.pointer !== event.pointerId)
                return;
            const active = drag;
            const element = node;
            const point = pointOf(read(current.value));
            element.classList.remove("lui-draggable-dragging");
            releasePointer(element, event.pointerId);
            track(false);
            drag = undefined;
            if (active.moved) {
                props.onEnd?.(detail(event, point, element, active.base));
            }
        };
        const ref = (element) => {
            if (!element && drag) {
                track(false);
                drag = undefined;
            }
            node = element;
        };
        const Tag = props.tag || "div";
        const placement = live(() => {
            const point = pointOf(read(current.value));
            return {
                ...(props.style || {}),
                translate: `${point.x}px ${point.y}px`,
            };
        });
        return _jsx(Tag, { ...props.$attrs, "aria-disabled": props.disabled || undefined, class: ["lui-draggable", props.className ?? props.class], ref: ref, style: placement, onPointerDown: down, children: props.children });
    },
    Sortable: function Sortable(props) {
        const current = model(props, props.defaultValue ?? [], valueOf(props));
        const sort = {
            get: () => {
                const value = read(current.value);
                return Array.isArray(value) ? [...value] : [];
            },
            node: null,
            props,
            set: (value) => current.set(value),
        };
        const ref = (node) => {
            if (sort.node)
                sortModels.delete(sort);
            if (!node && sorting?.source === sort) {
                cleanSort(new PointerEvent("pointercancel", {
                    pointerId: sorting.pointer,
                }), true);
            }
            sort.node = node;
            if (sort.node)
                sortModels.add(sort);
        };
        const Tag = props.tag || "div";
        return _jsx(Tag, { ...props.$attrs, "aria-disabled": props.disabled || undefined, class: ["lui-sortable", props.className ?? props.class], ref: ref, style: props.style, onPointerDown: (event) => sortDown(event, sort), children: props.children });
    },
}, (name) => __specs[name], { "file": "/Users/predeve/Developer/luon.dev/luon-packages/ui/src/drag.tsx" });
