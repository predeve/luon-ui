/** @jsxImportSource @luon/view */
import {
  liveView as live,
  passProps,
  state,
  type Child,
} from "@luon/view";

import { Icon } from "./icon.view.js";
import { tones } from "./skin.ts";
import type { Item, UiProps } from "./types.ts";
import {
  $,
  itemsOf,
  model,
  place,
  read,
  resetPlace,
  target,
} from "./util.ts";

const font = "font-[family-name:var(--lui-font)] $text";

function childrenOf(children: Child | Child[] | undefined): Child[] {
  const values: Child[] = [];
  const add = (value: Child | Child[]) => {
    if (Array.isArray(value)) {
      for (const child of value) add(child);
    } else if (value != null) values.push(value);
  };
  if (children != null) add(children);
  return values;
}

export function Carousel(props: UiProps) {
  const children = childrenOf(props.children);
  const active = state({ value: 0 });
  let timer: ReturnType<typeof setInterval> | undefined;
  const move = (value: number) => {
    if (!children.length) return;
    active.value = (value + children.length) % children.length;
    props.onChange?.(active.value);
  };
  const ref = (node: Element | null) => {
    if (timer) clearInterval(timer);
    timer = undefined;
    if (!node || !props.autoplay || children.length < 2) return;
    queueMicrotask(() => {
      if (!node.isConnected) return;
      timer = setInterval(
        () => move(active.value + 1),
        Number(props.interval || 4500),
      );
    });
  };
  return <section
    aria-roledescription="carousel"
    class={$("lui-carousel grid gap-3", font)}
    ref={ref}
  >
    <div class="overflow-hidden"><div
      class="flex transition-transform duration-300"
      style={live(() => ({ transform: `translateX(-${active.value * 100}%)` }))}
    >{children.map((child, index) => <div
      aria-hidden={live(() => index !== active.value)}
      class="w-full shrink-0"
    >{child}</div>)}</div></div>
    {children.length > 1 ? <nav class="flex items-center justify-center gap-2">
      <button
        aria-label="Previous slide"
        class={$("grid size-9 place-items-center rounded $hoverSoft")}
        type="button"
        onClick={() => move(active.value - 1)}
      ><Icon name="chevron-left" /></button>
      {children.map((_, index) => <button
        aria-label={`Go to slide ${index + 1}`}
        aria-pressed={live(() => index === active.value)}
        class={live(() => $(
          "size-2 rounded-full",
          index === active.value
            ? "$primaryBg" : "bg-[var(--lui-line)]",
        ))}
        type="button"
        onClick={() => move(index)}
      />)}
      <button
        aria-label="Next slide"
        class={$("grid size-9 place-items-center rounded $hoverSoft")}
        type="button"
        onClick={() => move(active.value + 1)}
      ><Icon name="chevron-right" /></button>
    </nav> : null}
  </section>;
}

function clone(child: Child): Child {
  return child instanceof Node ? child.cloneNode(true) : child;
}

export function Marquee(props: UiProps) {
  const source = props.children ?? itemsOf(props.items).map((item) => item.label);
  const children = childrenOf(source);
  const speed = `${Number(props.duration || props.speed || 24)}s`;
  return <div class={"lui-marquee overflow-hidden"}>
    <div
      class={$(
        "flex w-max gap-4 motion-reduce:animate-none",
        "[animation:lui-marquee_var(--lui-speed)_linear_infinite]",
        props.reverse && "[animation-direction:reverse]",
        props.pauseOnHover && "hover:[animation-play-state:paused]",
      )}
      style={{ "--lui-speed": speed }}
    >
      <div class="flex gap-4">{children}</div>
      <div aria-hidden="true" class="flex gap-4">{children.map(clone)}</div>
    </div>
  </div>;
}

function TreeNode(props: UiProps, item: Item, level: number): Child {
  const source = item as Record<string, any>;
  const children = itemsOf(source.children || []);
  const label = <span class="inline-flex items-center gap-2">
    {item.icon ? <Icon name={item.icon} /> : null}
    <span>{item.label}</span>
  </span>;
  if (!children.length) {
    return <button
      class={$("w-full rounded px-2 py-1.5 text-left $hoverSoft")}
      disabled={item.disabled || props.disabled}
      style={{ paddingLeft: `${level * 1.25 + .5}rem` }}
      type="button"
      onClick={() => {
        props.onSelect?.(item.value, item);
        props.onChange?.(item.value);
      }}
    >{label}</button>;
  }
  return <details open={source.defaultOpen || props.defaultOpenAll}>
    <summary
      class={$("cursor-pointer rounded px-2 py-1.5 $hoverSoft")}
      style={{ paddingLeft: `${level * 1.25 + .5}rem` }}
    >{label}</summary>
    {children.map((child) => TreeNode(props, child, level + 1))}
  </details>;
}

export function Tree(props: UiProps) {
  return <div class={$("lui-tree grid text-sm", font)} role="tree">
    {itemsOf(props.items).map((item) => TreeNode(props, item, 0))}
  </div>;
}

function menuItems(values: unknown[], close: () => void) {
  return values.flat(Infinity).map((value, index) => {
    const source = value as Record<string, any>;
    const item = itemsOf([value])[0]!;
    if (source?.type === "separator") {
      return <hr class={$("my-1 $line")} />;
    }
    if (source?.type === "label") {
      return <span class={$("px-3 py-1 text-xs $muted")}>
        {item.label}
      </span>;
    }
    const body = <>
      {item.icon ? <Icon name={item.icon} /> : null}
      <span class="grid flex-1"><span>{item.label}</span>{item.description
        ? <small class={$("$muted")}>{item.description}</small>
        : null}</span>
      {source?.kbds?.length ? <kbd>{source.kbds.join("+")}</kbd> : null}
    </>;
    if (source?.to || source?.href) {
      return <a
        class={$("flex items-center gap-2 rounded px-3 py-2 $hoverSoft")}
        href={source.to || source.href}
        role="menuitem"
        onClick={close}
      >{body}</a>;
    }
    return <button
      class={$(
        "flex items-center gap-2 rounded px-3 py-2 text-left",
        "$hoverSoft",
        ["danger", "error"].includes(source?.color)
          && "$dangerText",
      )}
      disabled={item.disabled}
      role="menuitem"
      type="button"
      onClick={() => {
        source?.onSelect?.();
        source?.onClick?.();
        close();
      }}
    >{body}</button>;
  });
}

let menuId = 0;

export function DropdownMenu(props: UiProps) {
  const id = props.id || `lui-menu-${++menuId}`;
  let menu: HTMLElement | null = null;
  let anchor: Element | null = null;
  const close = () => menu?.hidePopover?.();
  const source = props.slotTrigger?.() ?? props.trigger ?? props.children;
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
          menu?.togglePopover?.();
        }}
      >{source}</span>;
    }
  } else if (passProps(source, { popovertarget: id })) {
    trigger = source;
  } else {
    trigger = <button
      class={$(
        "inline-flex items-center gap-2 rounded border",
        "$line px-3 py-2 text-sm",
      )}
      popovertarget={id}
      ref={(node: Element | null) => anchor = node}
      type="button"
    >{source ?? props.label ?? "Menu"}<Icon
        class="mr-1"
        name="chevron-down"
      /></button>;
  }
  return <>{trigger}<div
    class={$(
      "lui-menu m-0 hidden min-w-48 gap-0.5 open:grid",
      "$radius",
      "border $line $bg p-1 shadow-xl",
      font,
    )}
    id={id}
    popover="auto"
    ref={(node: Element | null) => menu = node as HTMLElement | null}
    role="menu"
    onToggle={() => {
      anchor ||= document.querySelector(`[popovertarget="${id}"]`);
      if (!menu || !anchor) return;
      const open = menu.matches(":popover-open");
      anchor.setAttribute("aria-expanded", String(open));
      if (open) place(menu, anchor, props.align, props.width);
    }}
  >{menuItems(props.items || [], close)}</div></>;
}

export function ContextMenu(props: UiProps) {
  let menu: HTMLElement | null = null;
  const close = () => menu?.hidePopover?.();
  let unbind = () => {};
  const bind = (node: Element | null) => {
    unbind();
    unbind = () => {};
    if (!node) return;
    const doc = node.ownerDocument;
    const outside = (event: Event) => {
      if (!(event.target instanceof Node) || menu?.contains(event.target)) {
        return;
      }
      close();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    doc.addEventListener("pointerdown", outside, true);
    doc.addEventListener("keydown", keydown);
    unbind = () => {
      doc.removeEventListener("pointerdown", outside, true);
      doc.removeEventListener("keydown", keydown);
    };
  };
  return <div
    class={"lui-context"}
    ref={bind}
    onContextMenu={(event: MouseEvent) => {
      event.preventDefault();
      if (!menu) return;
      resetPlace(menu);
      menu.style.left = `${event.clientX}px`;
      menu.style.top = `${event.clientY}px`;
      menu.showPopover?.();
    }}
  >
    {props.children}
    <div
      class={$(
        "lui-context-menu fixed m-0 hidden min-w-48 gap-0.5 open:grid",
        "$radius border $line",
        "$bg p-1 shadow-xl",
        font,
      )}
      popover="manual"
      ref={(node: Element | null) => menu = node as HTMLElement | null}
      role="menu"
    >{menuItems(props.items || [], close)}</div>
  </div>;
}

export type CalendarDay = {
  active: boolean;
  date: Date;
  day: number;
  disabled: boolean;
  key: string;
  outside: boolean;
  today: boolean;
};

export type CalendarProps = UiProps & {
  renderDay?: (day: CalendarDay) => Child;
};

function dateOf(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

function dayKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(left: unknown, right: unknown) {
  const a = dateOf(left);
  const b = dateOf(right);
  return Boolean(a && b && dayKey(a) === dayKey(b));
}

export function Calendar(props: CalendarProps) {
  const selected = model(props, props.defaultValue);
  const initialValue = read(selected.value) as any;
  const seed = props.range ? initialValue?.start || initialValue?.from
    : Array.isArray(initialValue) ? initialValue[0] : initialValue;
  const initial = dateOf(seed) || dateOf(props.defaultMonth) || new Date();
  const month = state({
    value: new Date(initial.getFullYear(), initial.getMonth(), 1),
  });
  const locale = props.locale || "en-US";
  const weekStartsOn = Number(props.weekStartsOn ?? 0);
  const select = (date: Date) => {
    const value = read(selected.value) as any;
    const start = dateOf(value?.start || value?.from);
    const end = dateOf(value?.end || value?.to);
    if (props.range) {
      selected.set(!start || end || date < start
        ? { start: date, end: undefined }
        : { start, end: date });
    } else if (props.multiple) {
      const values = Array.isArray(value) ? value : [];
      selected.set(values.some((item) => sameDay(item, date))
        ? values.filter((item) => !sameDay(item, date))
        : [...values, date]);
    } else selected.set(date);
  };
  const view = live(() => {
    const shown = month.value;
    const value = read(selected.value) as any;
    const first = new Date(shown);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    first.setDate(1 - offset);
    const last = new Date(shown.getFullYear(), shown.getMonth() + 1, 0);
    const span = Math.ceil((last.getDate()
      + (shown.getDay() - weekStartsOn + 7) % 7) / 7) * 7;
    const days = Array.from({ length: props.fixedWeeks === false ? span : 42 },
      (_, index) => {
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
    return <>
      <header class="lui-calendar__head flex items-center justify-between gap-2">
        <button
          aria-label="Previous month"
          class={$(
            "lui-calendar__nav grid size-9 place-items-center rounded",
            "$hoverSoft",
          )}
          type="button"
          onClick={() => month.value = new Date(
            shown.getFullYear(), shown.getMonth() - 1, 1,
          )}
        ><Icon name="chevron-left" /></button>
        {props.caption === "dropdown" || props.monthControls
          || props.yearControls
          ? <span class="lui-calendar__caption flex gap-1">
          <label class="relative flex items-center">
            <select
              aria-label="Month"
              class={$(
                "appearance-none rounded border $line",
                "$bg py-1 pr-8 pl-1",
              )}
              value={shown.getMonth()}
              onChange={(event: Event) => {
                month.value = new Date(
                  shown.getFullYear(),
                  Number(target<HTMLSelectElement>(event).value),
                  1,
                );
              }}
            >{Array.from({ length: 12 }, (_, index) => <option value={index}>
              {new Intl.DateTimeFormat(locale, { month: "long" })
                .format(new Date(2026, index, 1))}
            </option>)}</select>
            <Icon
              class="pointer-events-none absolute right-3"
              name="chevron-down"
              size={14}
            />
          </label>
          <label class="relative flex items-center">
            <select
              aria-label="Year"
              class={$(
                "appearance-none rounded border $line",
                "$bg py-1 pr-8 pl-1",
              )}
              value={shown.getFullYear()}
              onChange={(event: Event) => {
                month.value = new Date(
                  Number(target<HTMLSelectElement>(event).value),
                  shown.getMonth(),
                  1,
                );
              }}
            >{Array.from({ length: 21 }, (_, index) => (
              shown.getFullYear() - 10 + index
            )).map((year) => <option value={year}>{year}</option>)}</select>
            <Icon
              class="pointer-events-none absolute right-3"
              name="chevron-down"
              size={14}
            />
          </label>
        </span> : <button
          class="lui-calendar__title font-semibold"
          type="button"
          onClick={() => {
            const today = new Date();
            month.value = new Date(today.getFullYear(), today.getMonth(), 1);
          }}
        >{title}</button>}
        <button
          aria-label="Next month"
          class={$(
            "lui-calendar__nav grid size-9 place-items-center rounded",
            "$hoverSoft",
          )}
          type="button"
          onClick={() => month.value = new Date(
            shown.getFullYear(), shown.getMonth() + 1, 1,
          )}
        ><Icon name="chevron-right" /></button>
      </header>
      <div class={$(
        "lui-calendar__week grid grid-cols-7 text-center text-xs",
        "$muted",
      )}>
        {Array.from({ length: 7 }, (_, index) => {
          const date = new Date(2026, 7, 2 + ((weekStartsOn + index) % 7));
          return <b>{new Intl.DateTimeFormat(locale, {
            weekday: props.weekdayFormat || props.weekday || "short",
          })
            .format(date)}</b>;
        })}
      </div>
      <div class="lui-calendar__days grid grid-cols-7">{days.map((date) => {
        const values = Array.isArray(value) ? value : [value];
        const active = props.range
          ? sameDay(rangeStart, date) || sameDay(rangeEnd, date)
          : values.some((item) => sameDay(item, date));
        const inRange = Boolean(props.range && rangeStart && rangeEnd
          && date >= rangeStart && date <= rangeEnd);
        const outside = date.getMonth() !== shown.getMonth();
        const min = dateOf(props.min);
        const max = dateOf(props.max);
        const disabled = Boolean(props.disabled
          || (min && date < min) || (max && date > max)
          || props.isDateDisabled?.(date));
        const day: CalendarDay = {
          active,
          date,
          day: date.getDate(),
          disabled,
          key: dayKey(date),
          outside,
          today: sameDay(new Date(), date),
        };
        return <button
          aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "long" })
            .format(date)}
          aria-pressed={active}
          class={$(
            "lui-calendar__day grid min-h-9 place-items-center rounded text-sm",
            "$hoverSoft disabled:opacity-30",
            outside && "outside $muted opacity-60",
            day.today && "today font-bold $actionText",
            inRange && !active && "between $actionSoft",
            active && "active $actionBg text-white",
            props.variant === "planner" && "min-h-20 content-start p-1",
          )}
          disabled={disabled}
          type="button"
          onClick={() => select(date)}
        >{outside && props.showOutside === false ? null
          : props.renderDay?.(day) ?? date.getDate()}</button>;
      })}</div>
      {props.showToday || props.showClear ? <footer
        class={$("flex items-center justify-end gap-2 border-t $line pt-3")}
      >
        {props.showClear ? <button
          class={$("rounded px-2 py-1 text-sm $muted $hoverSoft")}
          type="button"
          onClick={() => selected.set(props.multiple ? [] : undefined)}
        >Clear</button> : null}
        {props.showToday ? <button
          class={$(
            "rounded px-2 py-1 text-sm font-semibold $actionText $hoverSoft",
          )}
          type="button"
          onClick={() => {
            const today = new Date();
            month.value = new Date(today.getFullYear(), today.getMonth(), 1);
            select(today);
          }}
        >Today</button> : null}
      </footer> : null}
    </>;
  });
  return <section class={$(
    "lui-calendar grid gap-3 $radius border p-4",
    "$line $bg",
    props.variant === "planner" && "lui-calendar--planner",
    tones[props.color || "primary"] || tones.primary,
    font,
  )}>{view}</section>;
}
