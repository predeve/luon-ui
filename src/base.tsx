/** @jsxImportSource @luon/view */
import { liveView as live, state } from "@luon/view";

import { SelectMenu } from "./form.view.js";
import { Icon } from "./icon.view.js";
import Button from "./button.view.js";
import Input from "./input.view.js";
import { control, controlSkin, focus, font, sizes, tones } from "./skin.ts";
import type { UiProps } from "./types.ts";
import {
  $,
  itemsOf,
  model,
  pick,
  read,
  target,
  valueOf,
} from "./util.ts";

const badgeKinds: Record<string, string> = {
  outline: "border-[var(--lui-action)] bg-transparent $actionText",
  soft: "border-transparent "
    + "$actionSoft "
    + "$actionText",
  solid: "border-transparent $actionBg text-[var(--lui-on-action)]",
  subtle: "border-[color-mix(in_srgb,var(--lui-action)_24%,transparent)] "
    + "bg-[color-mix(in_srgb,var(--lui-action)_7%,var(--lui-bg))] "
    + "$actionText",
};

const textSizes: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

const weights: Record<string, string> = {
  bold: "font-bold",
  medium: "font-medium",
  normal: "font-normal",
  semibold: "font-semibold",
};

const colors: Record<string, string> = {
  danger: "$dangerText",
  default: "$text",
  muted: "$muted",
  primary: "$primaryText",
};

let accordionId = 0;
let sliderId = 0;
let fieldId = 0;

export function Text(props: UiProps) {
  const Tag = props.as || "span";
  const base = $(
    "lui-text leading-relaxed",
    font,
    colors[props.color || "default"],
    textSizes[props.size || "md"],
    weights[props.weight || "normal"],
  );
  return <Tag {...props.$attrs} class={base}>{props.children}</Tag>;
}

export function Badge(props: UiProps) {
  const color = props.color || "neutral";
  const variant = props.variant || "soft";
  const base = $(
    "lui-badge inline-flex items-center gap-1.5 rounded-full border font-medium",
    font,
    tones[color] || tones.neutral,
    badgeKinds[variant] || badgeKinds.soft,
    props.size === "xs" ? "px-1.5 py-0.5 text-[.65rem]" : undefined,
    props.size === "sm" ? "px-2 py-0.5 text-xs" : undefined,
    !props.size || props.size === "md" ? "px-2.5 py-1 text-xs" : undefined,
    props.size === "lg" ? "px-3 py-1.5 text-sm" : undefined,
    props.size === "xl" ? "px-3.5 py-2 text-base" : undefined,
  );
  return <span {...props.$attrs} class={base}>
    {props.dot ? <i class="size-1.5 rounded-full bg-current" /> : null}
    {props.label ?? props.children}
    {props.count !== undefined ? <strong>{props.count}</strong> : null}
  </span>;
}

export function Chip(props: UiProps) {
  const color = props.color || "primary";
  const tone = tones[color] || tones.primary;
  const position = props.position || "top-right";
  const place = position === "top-left" ? "-left-1 -top-1"
    : position === "bottom-left" ? "-bottom-1 -left-1"
      : position === "bottom-right" ? "-bottom-1 -right-1"
        : "-right-1 -top-1";
  return <span class={$(
    "lui-chip relative inline-flex",
    font,
    tone,
  )}>
    {props.children}
    {props.show === false ? null : <span class={$(
      "absolute z-10 grid min-h-4 min-w-4 place-items-center rounded-full",
      "ring-2 ring-[var(--lui-bg)] $actionBg px-1 text-[.6rem]",
      "font-semibold text-[var(--lui-on-action)]",
      place,
    )}>{props.text ?? props.label ?? props.value}</span>}
  </span>;
}

export function Kbd(props: UiProps) {
  return <kbd class={$(
    "lui-kbd inline-flex items-center justify-center rounded-md border",
    "$line $soft px-1.5 py-0.5 text-xs font-semibold $muted shadow-sm",
    props.size === "sm" && "px-1 py-0.5 text-[.65rem]",
    props.size === "lg" && "px-2 py-1 text-sm",
    font,
  )}>{props.value ?? props.children}</kbd>;
}

export function Separator(props: UiProps) {
  const vertical = props.orientation === "vertical";
  return <div
    aria-orientation={vertical ? "vertical" : "horizontal"}
    class={$(
      "lui-separator flex items-center $muted",
      vertical ? "h-full flex-col" : "w-full",
      font,
    )}
    role="separator"
  >
    <i class={$(
      "$line",
      vertical ? "w-px flex-1 border-l" : "h-px flex-1 border-t",
    )} />
    {props.label || props.children ? <span class={$(
      vertical ? "py-2 text-xs" : "px-3 text-xs",
    )}>{props.label || props.children}</span> : null}
    {props.label || props.children ? <i class={$(
      "$line",
      vertical ? "w-px flex-1 border-l" : "h-px flex-1 border-t",
    )} /> : null}
  </div>;
}

export type TextareaProps = UiProps & {
  autoresize?: boolean;
  maxRows?: number;
  resize?: boolean | "vertical" | "both";
};
export function Textarea(props: TextareaProps) {
  const current = model(props, props.defaultValue ?? "");
  const resize = (node: HTMLTextAreaElement) => {
    if (!props.autoresize) return;
    node.style.height = "auto";
    const css = window.getComputedStyle(node);
    const line = parseFloat(css.lineHeight)
      || parseFloat(css.fontSize) * 1.5 || 20;
    const pixels = (value: string) => parseFloat(value) || 0;
    const padding = pixels(css.paddingTop) + pixels(css.paddingBottom);
    const border = pixels(css.borderTopWidth) + pixels(css.borderBottomWidth);
    const min = Math.max(1, Number(props.rows) || 3);
    const max = Math.max(min, Number(props.maxRows) || Infinity);
    const content = node.scrollHeight - padding;
    const height = Math.max(min * line, Math.min(content, max * line));
    const extra = css.boxSizing === "border-box" ? padding + border : 0;
    node.style.height = `${height + extra}px`;
    node.style.overflowY = content > max * line ? "auto" : "hidden";
  };
  return <textarea
    {...props.$attrs}
    aria-invalid={Boolean(props.error) || undefined}
    disabled={props.disabled}
    class={$(
      control, controlSkin(props), "lui-textarea",
      props.autoresize ? "min-h-0" : "min-h-24",
      sizes[props.size || "md"],
      props.resize === false || props.autoresize ? "resize-none"
        : props.resize === "both" ? "resize" : "resize-y",
    )}
    ref={(node: Element | null) => {
      if (node && props.autoresize) queueMicrotask(() => {
        if (node.isConnected) resize(node as HTMLTextAreaElement);
      });
    }}
    value={current.value}
    onInput={(event: Event) => {
      if (props.disabled || props.readOnly) return;
      const node = target<HTMLTextAreaElement>(event);
      resize(node);
      current.set(node.value);
    }}
  />;
}

export function Select(props: UiProps) {
  if (!props.multiple) {
    return <SelectMenu {...props} searchInput={false} />;
  }
  const current = model(props, props.defaultValue ?? "");
  const select = <select
    {...props.$attrs}
    class={$(
      control,
      controlSkin(props),
      "lui-select",
      sizes[props.size || "md"],
    )}
    value={undefined}
    disabled={props.disabled}
    aria-invalid={Boolean(props.error) || undefined}
    onChange={(event: Event) => {
      const node = target<HTMLSelectElement>(event);
      const value = [...node.selectedOptions].map((item) => item.value);
      current.set(value);
    }}
  >
    {itemsOf(props.items).map((item) => <option
      disabled={item.disabled}
      selected={pick(current.value, (value) => (
        Array.isArray(value)
          && value.some((entry) => String(entry) === String(item.value))
      ))}
      value={String(item.value)}
    >{item.label}</option>)}
  </select>;
  return select;
}

export function Checkbox(props: UiProps) {
  const current = model(
    props,
    props.defaultChecked ?? props.checked ?? false,
    props.checked ?? valueOf(props),
  );
  return <label class={$(
    "lui-check inline-flex cursor-pointer items-start gap-2.5",
    font,
    tones[props.color || "primary"] || tones.primary,
  )}>
    <input
      {...props.$attrs}
      disabled={props.disabled}
      checked={pick(current.value, Boolean)}
      class="peer sr-only"
      type="checkbox"
      onChange={(event: Event) => {
        current.set(target<HTMLInputElement>(event).checked);
      }}
    />
    <i class={$(
      "mt-0.5 grid size-5 place-items-center rounded border",
      "$line $bg text-transparent",
      "peer-checked:border-[var(--lui-action)]",
      "peer-checked:bg-[var(--lui-action)]",
      "peer-checked:text-[var(--lui-on-action)]",
      "peer-focus-visible:outline-3",
    )}><Icon name="check" /></i>
    <span class="grid gap-0.5 text-sm">
      <b>{props.label ?? props.children}</b>
      {props.description
        ? <small class={$("$muted")}>{props.description}</small>
        : null}
    </span>
  </label>;
}

export function Switch(props: UiProps) {
  const current = model(
    props,
    props.defaultChecked ?? props.checked ?? false,
    props.checked ?? valueOf(props),
  );
  return <button
    {...props.$attrs}
    disabled={props.disabled}
    aria-checked={pick(current.value, Boolean)}
    class={$(
      "lui-switch group inline-flex items-center gap-2.5 text-left",
      font,
      focus,
      tones[props.color || "primary"] || tones.primary,
    )}
    role="switch"
    type="button"
    onClick={() => {
      if (!props.disabled) current.set(!Boolean(read(current.value)));
    }}
  >
    <span class={$(
      "relative h-6 w-11 shrink-0 rounded-full bg-[var(--lui-line)] transition",
      "group-aria-checked:bg-[var(--lui-action)]",
    )}>
      <i class={$(
        "absolute left-1 top-1 size-4 rounded-full bg-white shadow transition",
        "group-aria-checked:translate-x-5",
      )} />
    </span>
    {props.label ?? props.children ? <span class="grid gap-0.5 text-sm">
      <b>{props.label ?? props.children}</b>
      {props.description
        ? <small class={$("$muted")}>{props.description}</small>
        : null}
    </span> : null}
  </button>;
}

export function RadioGroup(props: UiProps) {
  const current = model(props, props.defaultValue);
  const name = props.name || `lui-radio-${++fieldId}`;
  return <div
    aria-label={props["aria-label"] || props.label}
    class={$("lui-radio-group", font,
      props.orientation === "horizontal"
        ? "flex flex-wrap gap-4" : "grid gap-2")}
    role="radiogroup"
  >
    {itemsOf(props.items).map((item) => <label
      class="inline-flex items-start gap-2.5 text-sm"
    >
      <input
        checked={pick(current.value, (value) => Object.is(value, item.value))}
        class={$(
          "accent-[var(--lui-action)]",
          tones[props.color || "primary"] || tones.primary,
        )}
        disabled={props.disabled || item.disabled}
        name={name}
        type="radio"
        value={String(item.value)}
        onChange={() => current.set(item.value)}
      />
      <span class="grid"><b>{item.label}</b>{item.description
        ? <small class={$("$muted")}>{item.description}</small>
        : null}</span>
    </label>)}
  </div>;
}

export function Slider(props: UiProps) {
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
  const set = (index: number, value: number) => {
    const source = values();
    current.set(source.length > 1
      ? source.map((item, at) => at === index ? value : item)
        .sort((left, right) => left - right)
      : value);
  };
  const controls = live(() => values().map((value, index) => <input
    aria-label={props["aria-label"] || props.label || `Slider ${index + 1}`}
    class={$(
      "accent-[var(--lui-action)]",
      values().length > 1 && "lui-slider__range",
      props.size === "sm" && "h-1.5",
      props.size === "lg" && "h-3",
      tone,
    )}
    disabled={props.disabled}
    list={index === 0 ? list : undefined}
    max={props.max ?? 100}
    min={props.min ?? 0}
    step={props.step ?? 1}
    style={props.inverted ? { direction: "rtl" } : undefined}
    type="range"
    value={value}
    onInput={(event: Event) => {
      set(index, Number(target<HTMLInputElement>(event).value));
    }}
  />));
  return <label class={$(
    "lui-slider grid gap-2",
    values().length > 1 && "lui-slider--range",
    font,
  )}>
    {props.label || props.showValue !== false ? <span
      class="flex items-center justify-between text-sm"
    >
      <span>{props.label}</span>
      <b>{pick(current.value, (value) => Array.isArray(value)
        ? value.map((item) => props.format?.(Number(item))
          ?? Number(item)).join(" – ")
        : props.format?.(Number(value)) ?? Number(value))}</b>
    </span> : null}
    <span class="lui-slider__controls">{controls}</span>
    {list ? <datalist id={list}>{marks.map((mark: any) => <option
      label={String(mark.label ?? mark.value ?? mark)}
      value={Number(mark.value ?? mark)}
    />)}</datalist> : null}
  </label>;
}

export type FormFieldProps = UiProps & {
  orientation?: "vertical" | "horizontal";
  required?: boolean;
  error?: string | boolean;
};
export function FormField(props: FormFieldProps) {
  const id = props.id || `lui-field-${++fieldId}`;
  const message = typeof props.error === "string" ? `${id}-error`
    : !props.error && (props.description || props.help)
      ? `${id}-description` : undefined;
  let observer: MutationObserver | undefined;
  const saved = new Map<Element, Map<string, {
    before: string | null;
    after: string;
  }>>();
  const write = (node: Element, key: string, value: string) => {
    const attrs = saved.get(node) || new Map();
    const before = attrs.has(key) ? attrs.get(key)!.before
      : node.getAttribute(key);
    attrs.set(key, { before, after: value });
    saved.set(node, attrs);
    node.setAttribute(key, value);
  };
  const ref = (node: Element | null) => {
    observer?.disconnect();
    for (const [control, attrs] of saved) {
      for (const [key, { before, after }] of attrs) {
        if (control.getAttribute(key) !== after) continue;
        if (before === null) control.removeAttribute(key);
        else control.setAttribute(key, before);
      }
    }
    saved.clear();
    if (!node) return;
    const connect = () => {
      const controls = [...node.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]), textarea, select, '
        + 'button[aria-haspopup="listbox"], button[role="switch"]',
      )];
      const first = controls[0];
      const label = node.querySelector<HTMLLabelElement>("label[data-field]");
      if (first && label) {
        first.id ||= `${id}-control`;
        label.htmlFor = first.id;
      }
      for (const control of controls) {
        if (message) {
          const ids = new Set((control.getAttribute("aria-describedby") || "")
            .split(/\s+/).filter(Boolean));
          ids.add(message);
          write(control, "aria-describedby", [...ids].join(" "));
        }
        if (props.error) write(control, "aria-invalid", "true");
        if (props.required && (controls.length === 1
          || control.matches('[type="radio"]'))) {
          write(control, "aria-required", "true");
          if (control.matches("input, textarea, select")) {
            write(control, "required", "");
          }
        }
      }
    };
    const Observer = node.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      observer = new Observer(connect);
      observer.observe(node, { childList: true, subtree: true });
    }
    queueMicrotask(() => { if (node.isConnected) connect(); });
  };
  return <div class={$("lui-field grid gap-2", font,
    props.orientation === "horizontal"
      && "sm:grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)] sm:items-start")}
    ref={ref}
  >
    {props.label || props.hint ? <div
      class="flex items-baseline justify-between gap-3 text-sm"
    ><label data-field="" class="font-medium" id={`${id}-label`}>
        {props.label}{props.required ? <span aria-hidden="true"> *</span> : null}
      </label><span class={$("text-xs $muted")}>{props.hint}</span></div> : null}
    <div class="grid min-w-0 gap-1.5">
      {props.children}
      {typeof props.error === "string" ? <small
        class={$("$dangerText")} id={`${id}-error`} role="alert"
      >{props.error}</small> : !props.error && (props.description || props.help)
        ? <small class={$("$muted")} id={`${id}-description`}>
          {props.description || props.help}
        </small> : null}
    </div>
  </div>;
}

export function FieldGroup(props: UiProps) {
  return <div class={$(
    "lui-field-group flex gap-3",
    props.orientation === "vertical" && "flex-col",
  )}>{props.children}</div>;
}

export function ColorPicker(props: UiProps) {
  const current = model(props, props.defaultValue || "#25f4d0");
  return <label class={$(
    "lui-color inline-flex items-center gap-2 text-sm",
    font,
  )}>
    {props.label ? <span>{props.label}</span> : null}
    <input
      disabled={props.disabled}
      type="color"
      value={current.value}
      onInput={(event: Event) => {
        current.set(target<HTMLInputElement>(event).value);
      }}
    />
    <code>{current.value}</code>
  </label>;
}

export function InputTime(props: UiProps) {
  return <Input {...props} type="time" />;
}

export function InputDate(props: UiProps) {
  return <Input {...props} type="date" />;
}

const toneBox: Record<string, string> = {
  danger: "[--lui-tone:var(--lui-danger)]",
  error: "[--lui-tone:var(--lui-danger)]",
  info: "[--lui-tone:var(--lui-primary)]",
  neutral: "[--lui-tone:var(--lui-text)]",
  primary: "[--lui-tone:var(--lui-primary)]",
  secondary: "[--lui-tone:var(--lui-secondary)]",
  success: "[--lui-tone:var(--lui-success)]",
  warning: "[--lui-tone:var(--lui-warning)]",
};

export function Alert(props: UiProps) {
  const open = state({ value: props.defaultOpen !== false });
  const body = live(() => open.value ? <section class={$(
    "lui-alert flex gap-3 $radius border p-4",
    props.variant === "solid" ? "border-transparent bg-[var(--lui-tone)] "
      + "text-[var(--lui-on-action)]"
      : props.variant === "outline" ? "$toneLine $bg" : "$toneLine $toneBg",
    font,
    toneBox[props.color || "info"],
    tones[props.color || "primary"] || tones.primary,
  )} role="alert">
    <Icon class={$("mt-0.5", props.variant !== "solid"
      && "text-[var(--lui-tone)]")} name={props.icon || "info"} />
    <div class="grid flex-1 gap-1"><b>{props.title}</b>
      {props.description ? <p>{props.description}</p> : props.children}
    </div>
    {props.actions?.map((item: UiProps) => <Button {...item} size="sm" />)}
    {props.close ? <button
      aria-label="Close"
      class="rounded p-1"
      type="button"
      onClick={() => open.value = false}
    ><Icon name="x" /></button> : null}
  </section> : null);
  return body;
}

export function Banner(props: UiProps) {
  const open = state({ value: props.defaultOpen !== false });
  return live(() => open.value ? <section class={$(
    "lui-banner flex items-center gap-3 border p-3",
    props.variant === "solid" ? "border-transparent bg-[var(--lui-tone)] "
      + "text-[var(--lui-on-action)]"
      : props.variant === "outline" ? "$toneLine $bg" : "$toneLine $toneBg",
    font,
    toneBox[props.color || "primary"],
    tones[props.color || "primary"] || tones.primary,
  )}>
    {props.icon ? <Icon name={props.icon} /> : null}
    <div class="flex-1"><b>{props.title}</b>{props.description
      ? <p class={$("text-sm", props.variant !== "solid" && "$muted")}>
        {props.description}
      </p>
      : null}</div>
    {props.actions?.map((item: UiProps) => <Button {...item} size="sm" />)}
    {props.close ? <button aria-label="Close" onClick={() => open.value = false}>
      <Icon name="x" />
    </button> : null}
  </section> : null);
}

export function Avatar(props: UiProps) {
  const failed = state({ value: false });
  const size = props.size === "sm" ? "size-8 text-xs"
    : props.size === "lg" ? "size-14 text-base"
      : props.size === "xl" ? "size-20 text-lg" : "size-10 text-sm";
  const content = live(() => props.src && !failed.value
    ? <img
      alt={props.alt || ""}
      class="size-full object-cover"
      src={props.src}
      onError={() => failed.value = true}
    />
    : props.text || props.alt?.slice(0, 2) || "LU");
  return <span class={$(
    "lui-avatar relative inline-grid shrink-0 place-items-center overflow-hidden",
    "rounded-full $soft font-semibold",
    font,
    size,
  )}>{content}{props.status ? <i class={$(
    "absolute bottom-0 right-0 size-2.5 rounded-full ring-2",
    "ring-[var(--lui-bg)]",
    props.status === "online" || props.status === "success"
      ? "bg-[var(--lui-success)]" : "bg-[var(--lui-warning)]",
  )} /> : null}</span>;
}

export function AvatarGroup(props: UiProps) {
  const items = Array.isArray(props.items) ? props.items : [];
  const max = Math.max(1, Number(props.max || items.length || 5));
  const shown = items.slice(0, max);
  const more = Math.max(0, items.length - shown.length);
  return <div
    aria-label={props["aria-label"] || "Avatar group"}
    class={$("lui-avatar-group inline-flex items-center", font)}
  >
    {shown.map((item: UiProps) => <span class="-ml-2 first:ml-0">
      <Avatar {...item} size={props.size || item.size} />
    </span>)}
    {props.children}
    {more ? <span class={$(
      "-ml-2 grid size-10 place-items-center rounded-full",
      "border-2 border-[var(--lui-bg)] $soft text-xs font-semibold",
      props.size === "sm" && "size-8",
      props.size === "lg" && "size-14 text-sm",
    )}>+{more}</span> : null}
  </div>;
}

export type CardProps = UiProps & {
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "soft" | "subtle" | "elevated" | "ghost";
};
export function Card(props: CardProps) {
  const variant = props.variant || "outline";
  return <section {...props.$attrs} class={$(
    "lui-card rounded-[calc(var(--lui-radius)*1.5)] border",
    variant === "ghost" ? "border-transparent bg-transparent"
      : variant === "soft" ? "border-transparent $soft"
      : variant === "subtle" ? "$line $soft" : "$line $bg",
    variant === "elevated" && "shadow-[var(--lui-shadow)]",
    props.size === "sm" ? "p-3" : props.size === "lg" ? "p-6" : "p-5",
    font,
  )}>
    {props.slotHeader ? <header class="mb-4">{props.slotHeader()}</header>
      : props.title || props.slotTitle || props.slotActions
        || props.description || props.slotDescription ? <header
        class="mb-4 flex items-start justify-between gap-4"
      >
        <div class="min-w-0 grid gap-1">
          {props.slotTitle ? props.slotTitle() : <b>{props.title}</b>}
          {props.slotDescription ? props.slotDescription() : props.description
            ? <p class={$("text-sm $muted")}>{props.description}</p> : null}
        </div>
        {props.slotActions?.()}
      </header> : null}
    {props.children}
    {props.slotFooter ? <footer class="mt-4">{props.slotFooter()}</footer> : null}
  </section>;
}

export function Progress(props: UiProps) {
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
    const fill = props.indeterminate ? "28%" : pick(
      percent,
      (value) => `${value}%`,
    );
    const caption = props.label
      ?? (typeof props.status === "string" ? props.status : undefined);
    const ringValue = props.indeterminate ? undefined : pick(
      raw,
      (value) => `${Math.round(value / max * 100)}%`,
    );
    return <span class={$(
      "lui-progress-circular inline-grid justify-items-center gap-2",
      font,
      tone,
    )}>
      <span
        aria-label={caption}
        aria-valuemax={max}
        aria-valuemin="0"
        aria-valuenow={props.indeterminate ? undefined : raw}
        class={$(
          "lui-progress-ring relative grid shrink-0 place-items-center",
          "overflow-hidden rounded-full p-1 text-sm font-semibold",
          props.indeterminate && "animate-spin",
          size,
        )}
        role="progressbar"
        style={pick(fill, (value) => ({
          background: `conic-gradient(var(--lui-action) ${value}, `
            + `var(--lui-soft) ${value})`,
        }))}
      ><b class={$(
        "grid size-full place-items-center rounded-full $bg",
      )}>{ringValue}</b></span>
      {caption ? <span
        class={$("lui-progress-label text-center text-sm $muted")}
      >{caption}</span> : null}
    </span>;
  }
  return <div class={$("lui-progress-wrap grid gap-1.5", font)}>
    {props.label || props.status ? <span
      class="flex justify-between text-sm"
    ><span>{props.label}</span><b>{display}</b>
    </span> : null}
    <div
      aria-valuemax={max}
      aria-valuemin="0"
      aria-valuenow={props.indeterminate ? undefined : raw}
      class={$(
        "overflow-hidden rounded-full $soft",
        props.size === "sm" ? "h-1.5"
          : props.size === "lg" ? "h-3" : "h-2",
      )}
      role="progressbar"
    ><i
      class={$(
        "block h-full rounded-full $actionBg",
        "transition-[width]",
        props.animated && "animate-pulse",
        tone,
      )}
      style={props.indeterminate
        ? { width: "38%" }
        : pick(percent, (value) => ({ width: `${value}%` }))}
    /></div>
  </div>;
}

export function ProgressGroup(props: UiProps) {
  const items = itemsOf(props.items);
  const total = Math.max(1, Number(props.max)
    || items.reduce((sum, item: any) => sum + Number(item.value || 0), 0));
  return <section class={$("lui-progress-group grid gap-3", font)}>
    {props.label || props.value ? <header
      class="flex items-end justify-between gap-4"
    >
      <span class="grid"><b>{props.label}</b>{props.description
        ? <small class={$("$muted")}>{props.description}</small>
        : null}</span>
      {props.value ? <strong>{props.value}</strong> : null}
    </header> : null}
    <div
      aria-label={props["aria-label"] || props.label}
      class={$("flex h-3 gap-1 overflow-hidden rounded-full $soft")}
      role="progressbar"
    >{items.map((item: any) => <i
        class={$(
          "h-full rounded-full $actionBg",
          tones[item.color || "primary"] || tones.primary,
        )}
        style={{ width: `${Math.max(0, Number(item.value)) / total * 100}%` }}
        title={`${item.label}: ${item.value}`}
      />)}</div>
    <div class="flex flex-wrap gap-x-4 gap-y-2">{items.map((item: any) => (
      <span class={$("inline-flex items-center gap-1.5 text-xs $muted")}>
        <i class={$(
          "size-2 rounded-full $actionBg",
          tones[item.color || "primary"] || tones.primary,
        )} />
        <span>{item.label}</span><b class={$("$text")}>{item.value}</b>
      </span>
    ))}</div>
  </section>;
}

export function Skeleton(props: UiProps) {
  return <span
    {...props.$attrs}
    aria-hidden="true"
    class={$("lui-skeleton block animate-pulse rounded $soft")}
  />;
}

export function Empty(props: UiProps) {
  return <section class={$(
    "lui-empty grid justify-items-center gap-3 $radius border",
    "$line $bg px-6 py-10 text-center shadow-sm",
    font,
  )}>
    <span class={$(
      "grid size-12 place-items-center rounded-2xl",
      "$soft $primaryText",
    )}><Icon name={props.icon || "inbox"} size={22} /></span>
    <div class="grid gap-1">
      <b>{props.title || props.label || "Nothing here yet"}</b>
      {props.description ? <p class={$("max-w-sm text-sm $muted")}>
        {props.description}
      </p> : null}
    </div>
    {props.actions?.length ? <div class="flex flex-wrap justify-center gap-2">
      {props.actions.map((item: UiProps) => <Button {...item} />)}
    </div> : props.children}
  </section>;
}

export function ScrollArea(props: UiProps) {
  const height = props.height ?? props.maxHeight ?? 240;
  return <div class={$(
    "lui-scroll $radius border $line $bg",
    font,
  )} style={{ maxHeight: typeof height === "number" ? `${height}px` : height }}>
    <div class="lui-scroll__body overflow-auto p-4">
      {props.children}
    </div>
  </div>;
}

export function User(props: UiProps) {
  return <div class={$("lui-user flex items-center gap-3", font)}>
    <Avatar
      {...props.avatar}
      src={props.avatar?.src || props.src}
      text={props.initials}
    />
    <span class="grid"><b>{props.name || props.label}</b><small
      class={$("$muted")}
    >{props.description || props.email}</small></span>
    {props.children}
  </div>;
}

export function Link(props: UiProps) {
  const href = props.to || props.href;
  const away = props.external ?? /^https?:\/\//.test(String(href || ""));
  return <a
    {...props.$attrs}
    aria-disabled={props.disabled || undefined}
    class={$(
      "lui-link inline-flex items-center gap-1 $primaryText",
      "underline-offset-4 hover:underline aria-disabled:pointer-events-none",
      "aria-disabled:opacity-50",
      props.variant === "subtle"
        && "font-medium $muted",
      props.variant === "button" && $(
        "rounded-md border $line $bg",
        "px-3 py-2 no-underline $hoverSoft hover:no-underline",
      ),
      font,
    )}
    href={props.disabled ? undefined : href}
    rel={away ? props.rel || "noreferrer" : props.rel}
    target={away ? props.target || "_blank" : props.target}
  >{props.children}{away ? <Icon name="external-link" /> : null}</a>;
}

export function Breadcrumb(props: UiProps) {
  return <nav
    aria-label="Breadcrumb"
    class={$("lui-breadcrumb flex flex-wrap items-center gap-2", font)}
  >{itemsOf(props.items).map((item, index) => <span
    class="inline-flex items-center gap-2"
  >
    {index ? <Icon class={$("$muted")} name="chevron-right" /> : null}
    <Link to={(item as any).to || (item as any).href}>{item.label}</Link>
  </span>)}</nav>;
}

export function Accordion(props: UiProps) {
  const items = itemsOf(props.items);
  const name = props.name || `luon-accordion-${++accordionId}`;
  const fallback = props.multiple
    ? props.defaultValue || (props.defaultOpen === undefined
      ? [] : [items[props.defaultOpen]?.value])
    : props.defaultValue ?? items[props.defaultOpen]?.value;
  const current = model(props, fallback);
  const open = (value: unknown) => pick(current.value, (active) => (
    props.multiple
      ? Array.isArray(active)
        && active.some((entry) => Object.is(entry, value))
      : Object.is(active, value)
  ));
  const toggle = (value: unknown) => {
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
  return <div class={$(
    "lui-accordion grid divide-y divide-[var(--lui-line)] overflow-hidden",
    "$radius border $line",
    props.variant === "plain" && "rounded-none border-x-0",
    separated && "gap-2 overflow-visible border-0 divide-y-0",
    font,
  )}>{items.map((item, index) => <section
    class={$(
      separated && $(
        "overflow-hidden $radius border",
        "$line",
      ),
    )}
    data-state={pick(open(item.value), (active) => active ? "open" : "closed")}
  >
    <button
      aria-controls={`${name}-${index}`}
      aria-expanded={open(item.value)}
      class={$(
        "flex w-full items-center justify-between gap-3 text-left",
        "font-medium $hoverSoft",
        padding,
      )}
      disabled={item.disabled || props.disabled}
      type="button"
      onClick={(event: Event) => {
        event.preventDefault();
        if (!item.disabled && !props.disabled) toggle(item.value);
      }}
    >
      <span class="inline-flex items-center gap-2">{item.icon
        ? <Icon name={item.icon} /> : null}{item.label}</span>
      {props.chevron === false ? null : <span class={pick(
        open(item.value),
        (active) => $(
          "mr-1 shrink-0 transition-transform",
          active && "rotate-180",
        ),
      )} style={{ transitionDuration: duration }}>
        <Icon name={props.chevron || "chevron-down"} />
      </span>}
    </button>
    <div
      aria-hidden={pick(open(item.value), (active) => String(!active))}
      class={pick(open(item.value), (active) => $(
        "grid transition-[grid-template-rows,opacity] ease-out",
        active ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0",
      ))}
      id={`${name}-${index}`}
      role="region"
      style={{ transitionDuration: duration }}
    >
      <div class="min-h-0 overflow-hidden"><div class={$(
        "text-sm $muted",
        props.size === "sm" ? "px-3 pb-3" : props.size === "lg"
          ? "px-5 pb-5" : "px-4 pb-4",
      )}>
        {props.content?.(item, index) ?? (item as any).content
          ?? item.children ?? item.description}
      </div></div>
    </div>
  </section>)}</div>;
}

export type { TableProps } from "./table-data.ts";
export { default as Table } from "./table.view.js";
