import {
  liveView as live,
  recipeView,
  sourceView,
  state,
  type Read,
  untrackView,
} from "@luon/view";

import type { Item, UiProps } from "./types.ts";

export function isRead(value: unknown): value is Read<any> {
  return Boolean(value)
    && typeof value === "object"
    && (value as Read).__act === true
    && typeof (value as Read).read === "function";
}

export function read<Value>(value: Value | Read<Value>): Value {
  return isRead(value) ? value.read() : value;
}

export const $ = recipeView({
  $actionBg: "bg-[var(--lui-action)]",
  $actionSoft: "bg-[color-mix(in_srgb,var(--lui-action)_12%,var(--lui-bg))]",
  $actionText: "text-[var(--lui-action)]",
  $afterBg: "after:bg-[var(--lui-bg)]",
  $bg: "bg-[var(--lui-bg)]",
  $dangerText: "text-[var(--lui-danger)]",
  $hoverSoft: "hover:bg-[var(--lui-soft)]",
  $line: "border-[var(--lui-line)]",
  $muted: "text-[var(--lui-muted)]",
  $placeholderMuted: "placeholder:text-[var(--lui-muted)]",
  $primaryBg: "bg-[var(--lui-primary)]",
  $primaryText: "text-[var(--lui-primary)]",
  $radius: "rounded-[var(--lui-radius)]",
  $soft: "bg-[var(--lui-soft)]",
  $text: "text-[var(--lui-text)]",
  $toneBg: "bg-[color-mix(in_srgb,var(--lui-tone)_8%,var(--lui-bg))]",
  $toneLine: "border-[color-mix(in_srgb,var(--lui-tone)_28%,var(--lui-line))]",
});

export function pick<Value, Result>(
  value: Value | Read<Value>,
  map: (value: Value) => Result,
) {
  return isRead(value) ? live(() => map(value.read())) : map(value);
}

export function valueOf(props: UiProps, fallback?: unknown) {
  const source = sourceView(props);
  return source.value
    ?? source.modelValue
    ?? source["model-value"]
    ?? fallback;
}

export function change(props: UiProps, value: unknown) {
  props.onChange?.(value);
  props.onValueChange?.(value);
  props["onUpdate:model-value"]?.(value);
}

export function model(
  props: UiProps,
  fallback?: unknown,
  source = valueOf(props),
) {
  const initial = source === undefined
    ? fallback
    : untrackView(() => read(source));
  const data = state({ value: initial });
  const value = isRead(source) ? source : live(() => data.value);
  const set = (next: unknown) => {
    if (!isRead(source)) data.value = next;
    change(props, next);
  };
  return { set, value };
}

export function itemsOf(values: unknown[] = []): Item[] {
  return values.map((value, index) => {
    if (typeof value !== "object" || value === null) {
      return { label: String(value), value };
    }
    const item = value as Record<string, any>;
    return {
      ...item,
      label: String(item.label ?? item.name ?? item.value ?? index + 1),
      value: item.value ?? item.id ?? item.label ?? index,
    };
  });
}

export function target<ElementType extends Element>(event: Event) {
  return event.currentTarget as ElementType;
}

export function moveFocus(
  event: KeyboardEvent,
  root: Element,
  selector: string,
) {
  if (event.defaultPrevented || event.isComposing
    || event.altKey || event.ctrlKey || event.metaKey) return;
  const nodes = [...root.querySelectorAll<HTMLElement>(selector)]
    .filter((node) => !node.matches(':disabled, [aria-disabled="true"]'));
  if (!nodes.length) return;
  const index = nodes.indexOf(root.ownerDocument.activeElement as HTMLElement);
  let next: number | undefined;
  if (["ArrowDown", "ArrowRight"].includes(event.key)) {
    next = (index + 1) % nodes.length;
  } else if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
    next = index < 0 ? nodes.length - 1
      : (index - 1 + nodes.length) % nodes.length;
  } else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = nodes.length - 1;
  else if (event.key.length === 1 && event.key !== " ") {
    for (let offset = 1; offset <= nodes.length; offset++) {
      const at = (index + offset) % nodes.length;
      if (nodes[at]?.textContent?.trim().toLocaleLowerCase()
        .startsWith(event.key.toLocaleLowerCase())) {
        next = at;
        break;
      }
    }
  }
  if (next === undefined) return;
  event.preventDefault();
  const node = nodes[next]!;
  node.focus();
  node.scrollIntoView?.({ block: "nearest" });
  return node;
}

export function menuKeys(
  event: KeyboardEvent,
  menu: HTMLElement,
  close: () => void,
) {
  if (event.defaultPrevented || event.isComposing) return;
  if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }
    close();
  } else if (event.key === " ") {
    const item = menu.ownerDocument.activeElement as HTMLElement | null;
    if (!item?.matches('[role="menuitem"]')) return;
    event.preventDefault();
    item.click();
  } else moveFocus(event, menu, '[role="menuitem"]');
}

export function resetPlace(menu: HTMLElement) {
  menu.style.bottom = "auto";
  menu.style.height = "auto";
  menu.style.left = "auto";
  menu.style.margin = "0";
  menu.style.right = "auto";
  menu.style.top = "auto";
}

export function place(
  menu: HTMLElement,
  trigger: Element,
  align = "start",
  width?: string | number,
  side = "auto",
) {
  resetPlace(menu);
  const rect = trigger.getBoundingClientRect();
  if (width !== undefined) {
    menu.style.width = typeof width === "number" ? `${width}px` : width;
  }
  const gap = 6;
  menu.style.maxWidth = `${Math.max(0, innerWidth - 16)}px`;
  const menuWidth = Math.min(menu.offsetWidth || rect.width, innerWidth - 16);
  menu.style.maxHeight = "";
  menu.style.overflowY = "";
  const menuHeight = menu.offsetHeight || menu.scrollHeight;
  if (side === "left" || side === "right") {
    const preferred = align === "end" ? rect.bottom - menuHeight
      : align === "center" ? rect.top + (rect.height - menuHeight) / 2
        : rect.top;
    const top = Math.max(8, Math.min(
      preferred,
      innerHeight - menuHeight - 8,
    ));
    const leftRoom = rect.left - gap - 8;
    const rightRoom = innerWidth - rect.right - gap - 8;
    const useLeft = side === "left"
      ? leftRoom >= menuWidth || leftRoom >= rightRoom
      : rightRoom < menuWidth && leftRoom > rightRoom;
    const left = useLeft
      ? Math.max(8, rect.left - menuWidth - gap)
      : Math.max(8, Math.min(
        innerWidth - menuWidth - 8,
        rect.right + gap,
      ));
    menu.style.position = "fixed";
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.maxHeight = `${Math.max(0, innerHeight - 16)}px`;
    menu.style.overflowY = menuHeight > innerHeight - 16 ? "auto" : "";
    menu.dataset.side = useLeft ? "left" : "right";
    return;
  }
  const preferred = align === "end" ? rect.right - menuWidth
    : align === "center" ? rect.left + (rect.width - menuWidth) / 2 : rect.left;
  const left = Math.max(8, Math.min(preferred, innerWidth - menuWidth - 8));
  const below = Math.max(0, innerHeight - rect.bottom - gap - 8);
  const above = Math.max(0, rect.top - gap - 8);
  const useBelow = side === "bottom"
    || (side !== "top" && (menuHeight <= below || below >= above));
  const room = useBelow ? below : above;
  const height = Math.min(menuHeight, room);
  const top = useBelow ? rect.bottom + gap : rect.top - gap - height;
  menu.style.position = "fixed";
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.maxHeight = `${room}px`;
  menu.style.overflowY = menuHeight > room ? "auto" : "";
  menu.dataset.side = useBelow ? "bottom" : "top";
}
