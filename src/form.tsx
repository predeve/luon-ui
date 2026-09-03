/** @jsxImportSource @luon/view */
import { liveView as live, state } from "@luon/view";

import { Icon } from "./icon.view.js";
import type { UiProps } from "./types.ts";
import {
  change,
  $,
  itemsOf,
  model,
  pick,
  place,
  read,
  target,
} from "./util.ts";

const font = "font-[family-name:var(--lui-font)] $text";
const field = $(
  "$radius border $line",
  "$bg text-sm",
  font,
);

const menuTones: Record<string, string> = {
  danger: "[--lui-action:var(--lui-danger)]",
  error: "[--lui-action:var(--lui-danger)]",
  neutral: "[--lui-action:var(--lui-text)]",
  primary: "[--lui-action:var(--lui-primary)]",
  success: "[--lui-action:var(--lui-success)]",
  warning: "[--lui-action:var(--lui-warning)]",
};

const menuSizes: Record<string, string> = {
  sm: "min-h-8 px-2.5 py-1.5 text-sm",
  md: "min-h-10 px-3 py-2 text-sm",
  lg: "min-h-11 px-4 py-2.5 text-base",
};

let menuId = 0;

export function CheckboxGroup(props: UiProps) {
  const items = itemsOf(props.items);
  const current = model(props, props.defaultValue ?? []);
  const values = () => {
    const value = read(current.value);
    return Array.isArray(value) ? value : [];
  };
  const selected = (value: unknown) => values()
    .some((item) => Object.is(item, value));
  const toggle = (value: unknown) => current.set(selected(value)
    ? values().filter((item) => !Object.is(item, value))
    : [...values(), value]);
  return <div
    aria-label={props["aria-label"] || props.label}
    class={$(
      "lui-check-group grid gap-2",
      props.orientation === "horizontal" && "grid-cols-2",
      font,
    )}
    role="group"
  >{items.map((item) => <label class={$(
      "flex cursor-pointer items-start gap-3 $radius border p-3",
      "$line $bg $hoverSoft",
      item.disabled && "opacity-50",
    )}>
      <input
        checked={live(() => selected(item.value))}
        class="peer sr-only"
        disabled={props.disabled || item.disabled}
        type="checkbox"
        onChange={() => toggle(item.value)}
      />
      <i class={$(
        "mt-0.5 grid size-5 shrink-0 place-items-center rounded border",
        "$line text-transparent",
        "peer-checked:border-[var(--lui-primary)]",
        "peer-checked:bg-[var(--lui-primary)] peer-checked:text-white",
        "peer-focus-visible:outline-3",
      )}><Icon name="check" /></i>
      <span class="grid gap-0.5 text-sm"><b>{item.label}</b>{item.description
        ? <small class={$("$muted")}>{item.description}</small>
        : null}</span>
    </label>)}</div>;
}

export function InputNumber(props: UiProps) {
  const step = Number(props.step ?? 1);
  const min = props.min === undefined ? -Infinity : Number(props.min);
  const max = props.max === undefined ? Infinity : Number(props.max);
  const current = model(props, props.defaultValue ?? props.min ?? 0);
  const set = (value: number) => {
    if (!Number.isFinite(value)) return;
    current.set(Math.min(max, Math.max(min, value)));
  };
  const value = () => Number(read(current.value) || 0);
  return <div class={$(
    "lui-number inline-grid grid-cols-[auto_minmax(4rem,1fr)_auto]",
    "overflow-hidden $radius border $line $bg",
    font,
  )}>
    <button
      aria-label="Decrease"
      class="grid size-10 place-items-center $hoverSoft disabled:opacity-50"
      disabled={live(() => props.disabled || value() <= min)}
      type="button"
      onClick={() => set(value() - step)}
    ><Icon name="minus" /></button>
    <input
      aria-label={props["aria-label"] || props.label || "Number"}
      class="min-w-0 border-x $line bg-transparent px-2 text-center outline-none"
      disabled={props.disabled}
      max={Number.isFinite(max) ? max : undefined}
      min={Number.isFinite(min) ? min : undefined}
      step={step}
      type="number"
      value={current.value}
      onInput={(event: Event) => {
        set(Number(target<HTMLInputElement>(event).value));
      }}
    />
    <button
      aria-label="Increase"
      class="grid size-10 place-items-center $hoverSoft disabled:opacity-50"
      disabled={live(() => props.disabled || value() >= max)}
      type="button"
      onClick={() => set(value() + step)}
    ><Icon name="plus" /></button>
  </div>;
}

export function InputTags(props: UiProps) {
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
  const tags = live(() => values().map((value) => <span class={$(
    "inline-flex items-center gap-1 rounded $soft",
    "px-2 py-1 text-xs",
  )}>{value}<button
    aria-label={`Remove ${value}`}
    disabled={props.disabled || props.readOnly}
    type="button"
    onClick={() => current.set(values().filter((item) => item !== value))}
  ><Icon name="x" /></button></span>));
  return <div class={$(
    "lui-tags flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5",
    field,
  )}>
    {props.icon ? <Icon
      class={$("$muted")}
      name={props.icon}
    /> : null}
    {tags}
    <input
      aria-label={props["aria-label"] || "Add tag"}
      class="min-w-24 flex-1 bg-transparent outline-none"
      disabled={props.disabled}
      placeholder={props.placeholder}
      readOnly={props.readOnly}
      value={live(() => draft.value)}
      onBlur={() => props.addOnBlur && add()}
      onInput={(event: Event) => {
        draft.value = target<HTMLInputElement>(event).value;
      }}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === ",") {
          event.preventDefault();
          add();
        } else if (event.key === "Backspace" && !draft.value && values().length
          && !props.readOnly) {
          current.set(values().slice(0, -1));
        }
      }}
    />
    {props.max ? <small class={$("$muted")}>{live(
      () => `${values().length}/${props.max}`,
    )}</small> : null}
  </div>;
}

export function FileUpload(props: UiProps) {
  const names = state({ value: [] as string[] });
  let input: HTMLInputElement | null = null;
  const receive = (files: File[]) => {
    names.value = files.map((file) => file.name);
    change(props, props.multiple ? files : files[0]);
  };
  return <div class={$(
    "lui-upload grid place-items-center gap-2 border-2 border-dashed p-6",
    "text-center $hoverSoft",
    field,
  )}
    onDragOver={(event: DragEvent) => event.preventDefault()}
    onDrop={(event: DragEvent) => {
      event.preventDefault();
      receive([...(event.dataTransfer?.files || [])]);
    }}
  >
    <input
      accept={props.accept}
      class="sr-only"
      disabled={props.disabled}
      multiple={props.multiple}
      ref={(node: Element | null) => input = node as HTMLInputElement | null}
      type="file"
      onChange={(event: Event) => {
        receive([...(target<HTMLInputElement>(event).files || [])]);
      }}
    />
    <Icon
      class={$("text-2xl $primaryText")}
      name={props.icon || "cloud-upload"}
    />
    <b>{props.label || "Choose files"}</b>
    <small class={$("$muted")}>
      {live(() => names.value.length ? names.value.join(", ")
        : props.description || "Drop files here or browse")}
    </small>
    <button
      class={$("rounded $primaryBg px-3 py-1.5 text-sm text-white")}
      disabled={props.disabled}
      type="button"
      onClick={() => input?.click()}
    >Browse</button>
  </div>;
}

export function InputRating(props: UiProps) {
  const max = Math.max(1, Number(props.max || 5));
  const current = model(props, props.defaultValue ?? 0);
  return <div
    aria-label={props["aria-label"] || props.label || "Rating"}
    class={"lui-rating inline-flex gap-1"}
    role="radiogroup"
  >{Array.from({ length: max }, (_, index) => index + 1).map((value) => <button
    aria-checked={pick(current.value, (item) => Number(item) === value)}
    aria-label={`${value} of ${max}`}
    class={pick(current.value, (item) => $(
      "text-2xl leading-none",
      value <= Number(item) ? "text-[var(--lui-warning)]" : "text-[var(--lui-line)]",
    ))}
    disabled={props.disabled || props.readOnly}
    role="radio"
    type="button"
    onClick={() => current.set(value)}
  >★</button>)}</div>;
}

export function Listbox(props: UiProps) {
  const items = itemsOf(props.items);
  const current = model(props, props.defaultValue ?? (props.multiple ? [] : undefined));
  const selected = (value: unknown) => {
    const source = read(current.value);
    return props.multiple
      ? Array.isArray(source) && source.some((item) => Object.is(item, value))
      : Object.is(source, value);
  };
  const choose = (value: unknown) => {
    if (!props.multiple) return current.set(value);
    const source = read(current.value);
    const values = Array.isArray(source) ? source : [];
    current.set(selected(value)
      ? values.filter((item) => !Object.is(item, value))
      : [...values, value]);
  };
  return <div
    aria-label={props["aria-label"] || props.label}
    class={$("lui-listbox grid gap-1 p-1", field)}
    role="listbox"
  >{items.map((item) => <button
    aria-selected={live(() => selected(item.value))}
    class={live(() => $(
      "flex items-center justify-between rounded px-3 py-2 text-left",
      selected(item.value)
        ? "$primaryBg text-white"
        : "$hoverSoft",
    ))}
    disabled={props.disabled || item.disabled}
    role="option"
    type="button"
    onClick={() => choose(item.value)}
  ><span class="grid"><b>{item.label}</b>{item.description
    ? <small>{item.description}</small> : null}</span>
    {live(() => selected(item.value) ? <Icon name="check" /> : null)}
  </button>)}</div>;
}

export function PinInput(props: UiProps) {
  const length = Math.max(1, Number(props.length || 4));
  const current = model(props, props.defaultValue ?? "");
  const array = Array.isArray(props.defaultValue)
    || Array.isArray(props.modelValue) || Array.isArray(props.value);
  const refs: Array<HTMLInputElement | null> = [];
  const chars = () => {
    const value = read(current.value);
    return Array.isArray(value) ? value.map(String) : String(value || "").split("");
  };
  const setAt = (index: number, source: string) => {
    const values = chars();
    values[index] = source.slice(-1);
    const next = values.slice(0, length);
    current.set(array ? next : next.join(""));
    if (source && index < length - 1) refs[index + 1]?.focus();
  };
  const tone = menuTones[props.color || "primary"] || menuTones.primary;
  const size = props.size === "sm" ? "size-9 text-base"
    : props.size === "lg" ? "size-13 text-xl" : "size-11 text-lg";
  return <div class={$("lui-pin flex gap-2", tone)}>
    {Array.from({ length }, (_, index) => <input
      autocomplete={props.otp ? "one-time-code" : undefined}
      aria-label={`${props.label || "Pin"} ${index + 1}`}
      class={$(
        "text-center",
        field,
        size,
        props.variant === "soft" && "border-transparent $soft",
        "focus:border-[var(--lui-action)]",
      )}
      disabled={props.disabled}
      inputMode={props.type === "number" ? "numeric" : "text"}
      maxLength="1"
      pattern={props.type === "number" || props.otp ? "[0-9]*" : undefined}
      placeholder={props.placeholder}
      ref={(node: Element | null) => {
        refs[index] = node as HTMLInputElement | null;
      }}
      type={props.mask ? "password" : "text"}
      value={live(() => chars()[index] || "")}
      onInput={(event: Event) => {
        setAt(index, target<HTMLInputElement>(event).value);
      }}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Backspace" && !target<HTMLInputElement>(event).value
          && index > 0) refs[index - 1]?.focus();
      }}
    />)}
  </div>;
}

export function SelectMenu(props: UiProps) {
  const items = itemsOf(props.items);
  const current = model(
    props,
    props.defaultValue ?? (props.multiple ? [] : ""),
  );
  const query = state({ value: "" });
  const id = props.id || `lui-select-${++menuId}`;
  let trigger: HTMLButtonElement | null = null;
  const selected = (value: unknown) => {
    const source = read(current.value);
    return props.multiple
      ? Array.isArray(source)
        && source.some((entry) => Object.is(entry, value))
      : Object.is(source, value);
  };
  const close = () => {
    const node = document.getElementById(id) as HTMLElement & {
      hidePopover?: () => void;
    } | null;
    node?.hidePopover?.();
  };
  const choose = (value: unknown) => {
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
      return <small class={$("p-3 $muted")}>No results</small>;
    }
    return found.map((item) => <button
      aria-selected={live(() => selected(item.value))}
      class={live(() => $(
        "flex items-center gap-2 rounded px-3 py-2 text-left",
        selected(item.value)
          ? "$soft font-semibold"
          : "$hoverSoft",
      ))}
      disabled={item.disabled}
      role="option"
      type="button"
      onClick={() => choose(item.value)}
    >
      {item.icon ? <Icon name={item.icon} /> : null}
      <span class="grid flex-1"><span>{item.label}</span>{item.description
        ? <small class={$("$muted")}>{item.description}</small>
        : null}</span>
      {live(() => selected(item.value) ? <Icon name="check" /> : null)}
    </button>);
  });
  return <div class={$("lui-select-menu relative", font)}>
    <button
      aria-label={props["aria-label"] || props.label}
      class={$(
        "flex w-full items-center gap-2 text-left",
        field,
        menuTones[props.color || "primary"] || menuTones.primary,
        menuSizes[props.size || "md"] || menuSizes.md,
        props.variant === "soft" && "border-transparent $soft",
      )}
      disabled={props.disabled || props.loading}
      popovertarget={id}
      ref={(node: Element | null) => {
        trigger = node as HTMLButtonElement | null;
      }}
      type="button"
    >
      {props.icon ? <Icon name={props.icon} /> : null}
      <span class="min-w-0 flex-1">{label}</span>
      <Icon
        class={$(props.loading && "animate-spin")}
        name={props.loading ? "loader" : "chevron-down"}
      />
    </button>
    <div
      class={$(
        "m-0 min-w-48 $radius border",
        "$line $bg p-1 shadow-xl",
      )}
      id={id}
      popover="auto"
      onToggle={(event: Event) => {
        const menu = target<HTMLElement>(event);
        const open = menu.matches(":popover-open");
        trigger?.setAttribute("aria-expanded", String(open));
        if (trigger && open) {
          place(
            menu,
            trigger,
            props.align,
            props.width ?? trigger.getBoundingClientRect().width,
          );
        }
      }}
    >
      {props.searchInput === false ? null : <input
        aria-label={props.searchPlaceholder || "Search"}
        class={$("mb-2 w-full px-3 py-2", field)}
        placeholder={props.searchPlaceholder || "Search"}
        value={live(() => query.value)}
        onInput={(event: Event) => {
          query.value = target<HTMLInputElement>(event).value;
        }}
      />}
      <div class="grid gap-1" role="listbox">{options}</div>
    </div>
  </div>;
}
