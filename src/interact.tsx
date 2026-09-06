/** @jsxImportSource @luon/view */
import { liveView as live, state, type Child } from "@luon/view";

import { Icon } from "./icon.view.js";
import { focus, font, tones } from "./skin.ts";
import type { Item, UiProps } from "./types.ts";
import {
  $,
  itemsOf,
  model,
  pick,
  place,
  read,
  target,
  valueOf,
} from "./util.ts";

let nextId = 0;

export function Collapsible(props: UiProps) {
  const id = props.id || `lui-collapse-${++nextId}`;
  const current = model(
    props,
    Boolean(props.defaultOpen),
    props.open ?? valueOf(props),
  );
  const open = pick(current.value, Boolean);
  const set = () => current.set(!Boolean(read(current.value)));
  const trigger = props.slotTrigger?.(open, set) ?? props.trigger;
  return <section class={$("lui-collapse grid gap-2", font)}>
    {trigger ? <span
      aria-controls={id}
      aria-expanded={open}
      class="contents"
      role="button"
      onClick={set}
    >{trigger}</span> : <button
      aria-controls={id}
      aria-expanded={open}
      class={$(
        "flex items-center justify-between gap-3 $radius border",
        "$line $bg px-3 py-2 text-left text-sm font-medium $hoverSoft",
        focus,
      )}
      type="button"
      onClick={set}
    ><span>{props.label || "Show details"}</span><Icon
        class={pick(open, (value) => $(
          "transition-transform",
          value && "rotate-180",
        ))}
        name="chevron-down"
      /></button>}
    <div
      aria-hidden={pick(open, (value) => String(!value))}
      class={pick(open, (value) => $(
        "grid transition-[grid-template-rows,opacity]",
        value ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0",
      ))}
      id={id}
    ><div class="min-h-0 overflow-hidden"><div class={$(
        "$radius border $line $bg p-4 text-sm",
      )}>{props.content ?? props.children}</div></div></div>
  </section>;
}

export function NavigationMenu(props: UiProps) {
  const vertical = props.orientation === "vertical";
  return <nav
    aria-label={props["aria-label"] || props.label || "Navigation"}
    class={$(
      "lui-nav flex gap-1 $radius border $line $bg p-1",
      vertical && "flex-col",
      font,
    )}
  >{itemsOf(props.items).map((item: any) => {
    const children = Array.isArray(item.children) ? item.children : [];
    const active = item.active || Object.is(props.value, item.value);
    return <span class="lui-nav__item group relative">
      <a
        aria-current={active ? "page" : undefined}
        aria-haspopup={children.length ? "menu" : undefined}
        class={$(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
          "font-medium $muted hover:text-[var(--lui-text)] $hoverSoft",
          active && "$soft $primaryText",
        )}
        href={item.to || item.href || "#"}
      >{item.icon ? <Icon name={item.icon} /> : null}<span>{item.label}</span>
        {children.length ? <Icon name="chevron-down" size={13} /> : null}
      </a>
      {children.length ? <div class={$(
        "lui-nav__menu absolute left-0 top-full z-50 hidden min-w-48",
        "$radius border $line $bg p-1 shadow-xl",
        "group-hover:grid group-focus-within:grid",
      )}>{itemsOf(children).map((child: any) => <a
          class={$(
            "flex items-start gap-2 rounded px-3 py-2 text-sm $hoverSoft",
          )}
          href={child.to || child.href || "#"}
        >{child.icon ? <Icon name={child.icon} /> : null}<span class="grid">
            <b>{child.label}</b>{child.description
              ? <small class={$("$muted")}>{child.description}</small> : null}
          </span></a>)}</div> : null}
    </span>;
  })}</nav>;
}

export function CommandPalette(props: UiProps) {
  const id = `lui-command-${++nextId}`;
  const items = itemsOf(props.items);
  const query = state({ value: "" });
  const cursor = state({ value: items.findIndex((item) => !item.disabled) });
  const found = () => {
    const needle = query.value.trim().toLocaleLowerCase();
    return needle ? items.filter((item) => (
      `${item.label} ${item.description || ""}`
        .toLocaleLowerCase().includes(needle)
    )) : items;
  };
  const choose = (item: any) => {
    if (props.disabled || item.disabled) return;
    item.onSelect?.(item);
    props.onSelect?.(item);
    props.onChange?.(item.value);
  };
  const results = live(() => {
    const values = found();
    if (!values.length) return <div class="grid justify-items-center gap-2 p-6"
      role="status">
      <Icon class={$("$muted")} name="search-x" size={22} />
      <small class={$("$muted")}>
        {props.empty || "No commands found"}
      </small>
    </div>;
    return values.map((item: any, index) => <button
      aria-selected={cursor.value === index}
      disabled={props.disabled || item.disabled}
      id={`${id}-${index}`}
      class={$(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-left",
        "disabled:opacity-40",
        cursor.value === index ? "$soft $text" : "$muted $hoverSoft",
      )}
      role="option"
      tabindex={-1}
      type="button"
      onClick={() => choose(item)}
      onMouseEnter={() => { if (!item.disabled) cursor.value = index; }}
    >
      <span class={$(
        "grid size-8 shrink-0 place-items-center rounded $soft",
      )}>
        <Icon name={item.icon || "command"} />
      </span>
      <span class="grid min-w-0 flex-1"><b>{item.label}</b>{item.description
        ? <small class={$("$muted")}>{item.description}</small> : null}</span>
      {item.kbds?.map((key: string) => <kbd class={$(
        "rounded border $line $soft px-1.5 py-0.5 text-xs",
      )}>{key}</kbd>)}
    </button>);
  });
  return <section class={$(
    "lui-command overflow-hidden $radius border $line $bg shadow-xl",
    font,
  )}>
    <label class={$("flex items-center gap-2 border-b $line px-3")}>
      <Icon class={$("$muted")} name="search" />
      <input
        aria-activedescendant={live(() => {
          const item = found()[cursor.value];
          return item && !item.disabled ? `${id}-${cursor.value}` : undefined;
        })}
        aria-controls={`${id}-list`}
        aria-expanded="true"
        aria-label={props["aria-label"] || "Search commands"}
        disabled={props.disabled}
        role="combobox"
        class="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
        placeholder={props.placeholder || "Type a command…"}
        value={live(() => query.value)}
        onInput={(event: Event) => {
          query.value = target<HTMLInputElement>(event).value;
          cursor.value = found().findIndex((item) => !item.disabled);
        }}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.isComposing || props.disabled) return;
          const values = found();
          const enabled = values.map((item, index) => item.disabled ? -1 : index)
            .filter((index) => index >= 0);
          const at = enabled.indexOf(cursor.value);
          if (event.key === "ArrowDown" || event.key === "ArrowUp"
            || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            cursor.value = event.key === "Home" ? enabled[0] ?? -1
              : event.key === "End" ? enabled.at(-1) ?? -1
              : at < 0 ? (step > 0 ? enabled[0] : enabled.at(-1)) ?? -1
              : enabled[(at + step + enabled.length) % enabled.length] ?? -1;
            document.getElementById(`${id}-${cursor.value}`)
              ?.scrollIntoView?.({ block: "nearest" });
          } else if (event.key === "Enter" && values[cursor.value]) {
            event.preventDefault();
            choose(values[cursor.value]);
          }
        }}
      />
    </label>
    <div class="grid max-h-72 gap-1 overflow-y-auto p-1" role="listbox"
      id={`${id}-list`} aria-label={props.label || "Commands"}>
      {results}
    </div>
  </section>;
}

function contentOf(props: UiProps, item: Item | undefined, value: unknown) {
  if (typeof props.children === "function") {
    return props.children(value, item);
  }
  if (props.children !== undefined) return props.children;
  const source = item as Record<string, any> | undefined;
  return source?.content ?? item?.children ?? item?.description;
}

export function Tabs(props: UiProps) {
  const items = itemsOf(props.items);
  const id = `lui-tabs-${++nextId}`;
  const first = items.find((item) => !item.disabled)?.value;
  const current = model(props, props.defaultValue ?? first);
  const vertical = props.orientation === "vertical";
  const line = props.variant === "line";
  const panelStyle = props.variant === "panel";
  const joined = panelStyle;
  const refs: Array<HTMLButtonElement | null> = [];
  const enabled = items
    .map((item, index) => item.disabled ? -1 : index)
    .filter((index) => index >= 0);
  const move = (event: KeyboardEvent, index: number) => {
    const at = enabled.indexOf(index);
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const found = event.key === next
      ? enabled[(at + 1) % enabled.length]
      : event.key === previous
        ? enabled[(at - 1 + enabled.length) % enabled.length]
        : event.key === "Home" ? enabled[0]
          : event.key === "End" ? enabled.at(-1) : undefined;
    if (at < 0 || found === undefined) return;
    event.preventDefault();
    current.set(items[found]?.value);
    refs[found]?.focus();
  };
  const panel = live(() => {
    const value = read(current.value);
    const item = items.find((entry) => Object.is(entry.value, value));
    return contentOf(props, item, value);
  });
  return <section class={$(
    "lui-tabs grid",
    joined ? "gap-0" : "gap-3",
    vertical && "grid-cols-[auto_1fr]",
    font,
  )}>
    {props.label ? <span class={$(
      "text-sm font-medium",
      joined && "mb-2",
    )}>{props.label}</span> : null}
    <nav
      aria-label={props["aria-label"] || props.label}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      class={$(
        "flex gap-1",
        joined ? $(
          "relative z-10 -mb-px w-full items-end overflow-x-auto px-4",
        ) : $(
          "$radius $soft p-1",
          vertical && "flex-col",
          line && $(
            "rounded-none border-b $line bg-transparent p-0",
            vertical && "border-b-0 border-r",
          ),
          panelStyle && "rounded-b-none border $line",
        ),
        props.width === "equal" && "[&>*]:flex-1",
      )}
      role="tablist"
    >{items.map((item, index) => {
      const active = pick(
        current.value,
        (value) => Object.is(value, item.value),
      );
      return <button
        aria-controls={`${id}-panel`}
        aria-selected={active}
        class={pick(active, (value) => $(
          "inline-flex items-center justify-center gap-2 rounded-md",
          "transition disabled:opacity-50",
          props.size === "sm" ? "px-2.5 py-1.5 text-xs"
            : props.size === "lg" ? "px-4 py-2.5 text-base"
              : "px-3 py-2 text-sm",
          joined && $(
            "relative min-h-10 shrink-0 rounded-b-none border px-4",
            "$line border-b-0",
          ),
          value && joined
            ? $(
              "border-b-[var(--lui-bg)]",
              "$bg font-semibold shadow-sm",
              "text-[var(--luon-tabs-active-text,var(--lui-primary))]",
            )
            : joined
              ? "$soft $muted hover:text-[var(--lui-text)]"
            : value
            ? line
              ? $(
                "rounded-b-none border-b-2 border-[var(--lui-primary)]",
                "bg-transparent font-semibold $primaryText",
              )
              : "$bg font-semibold shadow"
            : "$muted hover:text-[var(--lui-text)]",
          focus,
        ))}
        disabled={item.disabled}
        id={`${id}-tab-${index}`}
        ref={(node: Element | null) => {
          refs[index] = node as HTMLButtonElement | null;
        }}
        role="tab"
        style={props.maxWidth > 0
          ? { maxWidth: `${Number(props.maxWidth)}px` }
          : undefined}
        tabIndex={pick(active, (value) => value ? 0 : -1)}
        type="button"
        onClick={() => current.set(item.value)}
        onKeyDown={(event: KeyboardEvent) => move(event, index)}
      >
        {item.icon ? <Icon name={item.icon} /> : null}
        <span>{item.label}</span>
        {(item as any).badge !== undefined
          ? <small>{(item as any).badge}</small>
          : null}
      </button>;
    })}</nav>
    {props.content === false ? null : <div
      aria-labelledby={pick(current.value, (value) => {
        const index = items.findIndex((item) => Object.is(item.value, value));
        return `${id}-tab-${Math.max(0, index)}`;
      })}
      class={$(
        "lui-tabs-panel min-w-0",
        joined && $(
          "relative z-0 min-h-28 w-full $radius border",
          "$line $bg p-4",
        ),
      )}
      id={`${id}-panel`}
      role="tabpanel"
    >{panel}</div>}
  </section>;
}

function pagesOf(page: number, pages: number, siblings: number, edges: boolean) {
  const values = new Set<number>();
  const width = Math.min(pages, Math.max(5, siblings * 2 + 3));
  let start = Math.max(1, page - Math.floor(width / 2));
  const end = Math.min(pages, start + width - 1);
  start = Math.max(1, end - width + 1);
  for (let value = start; value <= end; value++) values.add(value);
  if (edges) {
    values.add(1);
    values.add(pages);
  }
  const sorted = [...values].sort((left, right) => left - right);
  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && value - previous > 1
      ? ["gap", value] as const
      : [value] as const;
  });
}

export function Pagination(props: UiProps) {
  const total = Math.max(1, Number(props.total || 1));
  const per = Math.max(1, Number(
    props.itemsPerPage || props["items-per-page"] || 10,
  ));
  const pages = Math.max(1, Math.ceil(total / per));
  const current = model(
    props,
    props.defaultPage || 1,
    props.page ?? valueOf(props),
  );
  const set = (value: number) => {
    const next = Math.min(pages, Math.max(1, value));
    current.set(next);
    props.onPageChange?.(next);
    props["onUpdate:page"]?.(next);
  };
  const page = () => Math.min(pages, Math.max(1, Number(read(current.value))));
  const tone = tones[props.color || "primary"] || tones.primary;
  const size = props.size === "sm" ? "size-8 text-xs"
    : props.size === "lg" ? "size-11 text-base" : "size-9 text-sm";
  const buttons = live(() => pagesOf(
    page(),
    pages,
    Math.max(0, Number(props.siblingCount ?? 1)),
    Boolean(props.showEdges),
  ).map((value) => value === "gap" ? <span aria-hidden="true">…</span>
    : <button
      aria-current={value === page() ? "page" : undefined}
      class={$(
        "rounded-md",
        size,
        tone,
        value === page()
          ? props.variant === "subtle"
            ? "$actionSoft $actionText font-semibold"
            : "$actionBg text-[var(--lui-on-action)]"
          : "$hoverSoft",
      )}
      disabled={props.disabled}
      type="button"
      onClick={() => set(value)}
    >{value}</button>));
  return <nav
    aria-label={props["aria-label"] || "Pagination"}
    class={$("lui-pagination flex items-center gap-1", font)}
  >
    <button
      aria-label="Previous page"
      class={$("grid place-items-center rounded-md $hoverSoft", size, tone)}
      disabled={pick(current.value, (value) => (
        props.disabled || Number(value) <= 1
      ))}
      type="button"
      onClick={() => set(page() - 1)}
    ><Icon name="chevron-left" /></button>
    {buttons}
    <button
      aria-label="Next page"
      class={$("grid place-items-center rounded-md $hoverSoft", size, tone)}
      disabled={pick(current.value, (value) => (
        props.disabled || Number(value) >= pages
      ))}
      type="button"
      onClick={() => set(page() + 1)}
    ><Icon name="chevron-right" /></button>
  </nav>;
}

export function Stepper(props: UiProps) {
  const items = itemsOf(props.items);
  const current = model(props, props.defaultValue ?? 0);
  return <ol class={$(
    "lui-stepper flex items-start gap-3",
    font,
  )}>{items.map((item, index) => {
    const active = pick(current.value, (value) => index <= Number(value));
    return <li class={pick(active, (value) => $(
      "flex flex-1 items-start gap-2 text-sm",
      value ? "$primaryText" : "$muted",
    ))}>
      <button
        aria-current={pick(current.value, (value) => (
          Number(value) === index ? "step" : undefined
        ))}
        class="grid size-8 shrink-0 place-items-center rounded-full border"
        type="button"
        onClick={() => current.set(index)}
      >{index + 1}</button>
      <span class="grid"><b>{item.label}</b>{item.description
        ? <small>{item.description}</small> : null}</span>
    </li>;
  })}</ol>;
}

export function Timeline(props: UiProps) {
  return <ol class={$(
    "lui-timeline grid gap-4 border-l $line pl-5",
    font,
  )}>{itemsOf(props.items).map((item) => <li class="relative grid gap-0.5">
    <i class={$(
      "absolute -left-[1.55rem] top-1 size-2.5 rounded-full",
      "$primaryBg",
    )} />
    <b>{item.label}</b>
    {item.description
      ? <small class={$("$muted")}>{item.description}</small>
      : null}
  </li>)}</ol>;
}

const drawerClass: Record<string, string> = {
  bottom: "mb-0 mt-auto w-full max-w-none rounded-b-none",
  left: "ml-0 mr-auto h-full max-h-none rounded-l-none",
  right: "ml-auto mr-0 h-full max-h-none rounded-r-none",
  top: "mb-auto mt-0 w-full max-w-none rounded-t-none",
};

function showDialog(node: HTMLDialogElement, initialFocus?: string) {
  queueMicrotask(() => {
    if (!node.isConnected) return;
    try {
      node.showModal();
    } catch {
      node.open = true;
    }
    if (initialFocus) node.querySelector<HTMLElement>(initialFocus)?.focus();
  });
}

export type OverlayProps = UiProps & {
  size?: "sm" | "md" | "lg" | "xl";
  initialFocus?: string;
  restoreFocus?: boolean;
  dismissible?: boolean;
  width?: string | number;
};
function Overlay(props: OverlayProps & { kind: "drawer" | "modal" }): Child {
  const id = `lui-${props.kind}-${++nextId}`;
  const direction = props.direction || "right";
  const side = props.kind === "drawer"
    && (direction === "left" || direction === "right");
  const current = model(
    props,
    Boolean(props.defaultOpen),
    props.open ?? valueOf(props),
  );
  let panel: HTMLDialogElement | null = null;
  let previous: HTMLElement | null = null;
  let backdrop = false;
  const set = (value: boolean) => {
    if (value === Boolean(read(current.value))) return;
    if (value && props.disabled) return;
    current.set(value);
    props.onOpenChange?.(value);
    props["onUpdate:open"]?.(value);
  };
  const launch = (event: MouseEvent) => {
    previous = event.target instanceof Element
      ? event.target.closest<HTMLElement>("button, a, [tabindex]") : null;
    set(true);
  };
  const outside = (event: MouseEvent) => {
    const rect = panel?.getBoundingClientRect();
    return rect && (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom);
  };
  const widths = { sm: "max-w-sm", md: "max-w-xl",
    lg: "max-w-3xl", xl: "max-w-5xl" };
  const trigger = props.slotTrigger?.() ?? props.trigger;
  const controlled = props.open !== undefined
    || props.modelValue !== undefined
    || props["model-value"] !== undefined;
  const implicit = trigger === undefined && props.label === undefined;
  const button = controlled && implicit ? null : trigger === undefined ? <button
    class={$(
      "$radius $primaryBg px-3 py-2",
      "text-sm font-semibold text-[var(--lui-on-primary)]",
    )}
    disabled={props.disabled}
    type="button"
    onClick={launch}
  >{props.label || "Open"}</button> : <span
    class="contents"
    onClick={launch}
  >{trigger}</span>;
  const dialog = live(() => Boolean(read(current.value)) ? <dialog
    aria-label={props["aria-label"]}
    aria-describedby={props.description ? `${id}-description` : undefined}
    aria-labelledby={props.title ? `${id}-title` : undefined}
    class={$(
      "lui-dialog fixed inset-0 m-auto max-h-[90dvh]",
      !props.fullscreen && (props.size
        ? $("w-[calc(100%-2rem)]", widths[props.size])
        : "w-[min(36rem,calc(100%-2rem))]"),
      "$radius border $line",
      "$bg p-0 $text shadow-[var(--lui-shadow-overlay)]",
      "backdrop:bg-black/50",
      props.scrollable && "overflow-hidden",
      props.fullscreen && $(
        "m-0 h-dvh w-full max-h-none max-w-none rounded-none",
      ),
      props.kind === "drawer" && drawerClass[direction],
      font,
    )}
    style={!props.fullscreen && props.width ? {
      width: typeof props.width === "number" ? `${props.width}px` : props.width,
      maxWidth: "calc(100% - 1rem)",
    } : undefined}
    ref={(node: Element | null) => {
      if (node) {
        panel = node as HTMLDialogElement;
        previous ||= node.ownerDocument.activeElement as HTMLElement | null;
        showDialog(panel, props.initialFocus);
      } else if (panel) {
        const doc = panel.ownerDocument;
        const restore = panel.contains(doc.activeElement)
          || doc.activeElement === doc.body;
        const old = panel;
        panel = null;
        if (old.open) old.close();
        if (restore && props.restoreFocus !== false && previous?.isConnected) {
          previous.focus();
        }
      }
    }}
    onCancel={(event: Event) => {
      event.preventDefault();
      if (props.dismissible !== false) set(false);
    }}
    onPointerDown={(event: PointerEvent) => {
      backdrop = event.target === event.currentTarget && Boolean(outside(event));
    }}
    onClick={(event: MouseEvent) => {
      const dismiss = backdrop && event.target === event.currentTarget
        && outside(event);
      backdrop = false;
      if (dismiss && props.dismissible !== false) set(false);
    }}
    onClose={(event: Event) => {
      if (panel && event.currentTarget === panel) set(false);
    }}
  >
    <div class={$(
      "flex min-h-0 flex-col",
      (side || props.fullscreen) && "h-full",
      props.scrollable && !props.fullscreen && "max-h-[90dvh]",
    )}>
      <header class={$(
        "flex shrink-0 items-start justify-between",
        "gap-4 border-b $line p-5",
      )}>
        {props.slotHeader ? <div>
          {props.title ? <span class="sr-only" id={`${id}-title`}>
            {props.title}
          </span> : null}
          {props.description ? <span class="sr-only" id={`${id}-description`}>
            {props.description}
          </span> : null}
          {props.slotHeader(() => set(false))}
        </div> : <div
          class="grid gap-1"
        >
          {props.title ? <b id={`${id}-title`}>{props.title}</b> : null}
          {props.description ? <p
            class={$("text-sm $muted")}
            id={`${id}-description`}
          >{props.description}</p> : null}
        </div>}
        {props.dismissible === false ? null : <button
          aria-label="Close"
          class={$("rounded p-1 $hoverSoft", focus)}
          type="button"
          onClick={() => set(false)}
        ><Icon name="x" /></button>}
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto p-5">
        {props.slotBody?.() || props.content || props.body || props.children}
      </div>
      {props.slotFooter ? <footer class={$("shrink-0 border-t $line p-5")}>
        {props.slotFooter(() => set(false))}
      </footer> : null}
    </div>
  </dialog> : null);
  return <>{button}{dialog}</>;
}

export function Modal(props: OverlayProps) {
  return Overlay({ ...props, kind: "modal" });
}

export function Drawer(props: OverlayProps) {
  return Overlay({ ...props, kind: "drawer" });
}

export function Popover(props: UiProps) {
  const id = props.id || `lui-popover-${++nextId}`;
  const source = props.slotTrigger?.() ?? props.trigger;
  const config = props.content && typeof props.content === "object"
    && (props.content.side || props.content.align)
    ? props.content : undefined;
  const content = props.slotContent?.()
    ?? props.text
    ?? (config ? props.children : props.content ?? props.children);
  const side = props.side || config?.side || "auto";
  const align = props.align || config?.align || "start";
  let anchor: Element | null = null;
  let trigger: Child;
  if (source instanceof Element) {
    if (source.matches("button, a, [role=button]")) {
      source.setAttribute("popovertarget", id);
      anchor = source;
      trigger = source;
    } else {
      trigger = <span
        class="contents"
        onClick={(event: MouseEvent) => {
          const clicked = event.target instanceof Element
            ? event.target.closest("button, a, [role=button]")
            : null;
          anchor = clicked || source;
          document.getElementById(id)?.togglePopover?.();
        }}
      >{source}</span>;
    }
  } else {
    trigger = <button
      class={$(
        "$radius border $line",
        "px-3 py-2 text-sm",
      )}
      popovertarget={id}
      ref={(node: Element | null) => anchor = node}
      type="button"
    >{source ?? props.label ?? "Open"}</button>;
  }
  return <>{trigger}<div
    class={$(
      "lui-popover m-0 hidden max-w-sm $radius border",
      "$line $bg p-4 shadow-xl",
      "open:block",
      props.arrow && "arrow",
      font,
    )}
    id={id}
    popover="auto"
    onToggle={() => {
      if (!anchor) return;
      const menu = document.getElementById(id)!;
      const open = menu.matches(":popover-open");
      anchor.setAttribute("aria-expanded", String(open));
      if (open) place(menu, anchor, align, props.width, side);
    }}
  >{content}</div></>;
}

export function Tooltip(props: UiProps) {
  const config = props.content && typeof props.content === "object"
    ? props.content : undefined;
  const side = props.side || config?.side || "top";
  const delay = Math.max(0, Number(
    props.delayDuration ?? props.delay ?? 0,
  ));
  return <span class={"lui-tooltip group relative inline-flex"}>
    {props.children}
    <span
      class={$(
        "lui-tooltip__content pointer-events-none absolute z-50",
        "whitespace-nowrap rounded bg-[var(--lui-text)]",
        "px-2 py-1 text-xs text-[var(--lui-bg)]",
        props.arrow && "arrow",
      )}
      data-side={side}
      role="tooltip"
      style={{ "--lui-tip-delay": `${delay}ms` }}
    >{props.text || (config ? props.label : props.content)}</span>
  </span>;
}

export function Toast(props: UiProps) {
  const open = state({ value: props.defaultOpen !== false });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ref = (node: Element | null) => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!node || !props.duration) return;
    queueMicrotask(() => {
      if (!node.isConnected) return;
      timer = setTimeout(
        () => open.value = false,
        Number(props.duration),
      );
    });
  };
  return live(() => open.value ? <section
    class={$(
      "lui-toast flex max-w-sm items-start gap-3 $radius",
      "border $line $bg p-4",
      "shadow-[var(--lui-shadow)]",
      props.inline ? "relative" : "fixed bottom-4 right-4 z-50",
      font,
    )}
    ref={ref}
    role={props.color === "danger" || props.color === "error"
      ? "alert" : "status"}
  >
    {props.avatar ? <span class={$(
      "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full",
      "$soft text-xs font-semibold",
    )}>{props.avatar.src ? <img
      alt={props.avatar.alt || ""}
      class="size-full object-cover"
      src={props.avatar.src}
    /> : props.avatar.text || props.avatar.initials}</span>
      : <Icon name={props.icon || "bell"} />}
    <div class="grid flex-1 gap-1"><b>{props.title}</b>{props.description
      ? <p class={$("text-sm $muted")}>{props.description}</p>
      : props.children}</div>
    {props.actions?.map((item: any) => <button
      class={$(
        "rounded-md border $line px-2 py-1 text-xs",
        "font-medium $hoverSoft disabled:opacity-50",
      )}
      disabled={item.disabled}
      type="button"
      onClick={item.onClick}
    >{item.icon ? <Icon name={item.icon} /> : null}{item.label
      ?? item.children}</button>)}
    {props.close === false ? null : <button
      aria-label="Close"
      class={$("rounded p-1 $hoverSoft")}
      type="button"
      onClick={() => open.value = false}
    ><Icon name="x" /></button>}
  </section> : null);
}
