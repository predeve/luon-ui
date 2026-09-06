/** @jsxImportSource @luon/view */
import { liveView as live, state } from "@luon/view";

import { Icon } from "./icon.view.js";
import {
  control, controlSkin, focus, font, sizes, squareSizes, tones,
} from "./skin.ts";
import type { Item, UiProps } from "./types.ts";
import {
  change,
  $,
  itemsOf,
  model,
  moveFocus,
  pick,
  place,
  read,
  target,
} from "./util.ts";

const field = $(
  "$radius border $line",
  "$bg text-sm",
  font,
);

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
        "peer-checked:bg-[var(--lui-primary)]",
        "peer-checked:text-[var(--lui-on-primary)]",
        "peer-focus-visible:outline-3",
      )}><Icon name="check" /></i>
      <span class="grid gap-0.5 text-sm"><b>{item.label}</b>{item.description
        ? <small class={$("$muted")}>{item.description}</small>
        : null}</span>
    </label>)}</div>;
}

export type InputNumberProps = UiProps & {
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
};
export function InputNumber(props: InputNumberProps) {
  const step = Number(props.step) > 0 ? Number(props.step) : 1;
  const min = props.min === undefined ? -Infinity : Number(props.min);
  const max = props.max === undefined ? Infinity : Number(props.max);
  const current = model(props, props.defaultValue ?? props.min ?? 0);
  const set = (value: number | undefined) => {
    if (props.disabled || props.readOnly) return;
    if (value === undefined) return current.set(undefined);
    if (!Number.isFinite(value)) return;
    current.set(Math.min(max, Math.max(min, value)));
  };
  const value = () => Number(read(current.value) || 0);
  const shift = (direction: number) => set(Number(
    (value() + step * direction).toPrecision(15),
  ));
  return <div class={$(
    "lui-number inline-grid grid-cols-[auto_minmax(4rem,1fr)_auto]",
    "overflow-hidden $radius border focus-within:outline-2",
    "focus-within:outline-offset-2 focus-within:outline-[var(--lui-focus)]",
    "has-[[aria-invalid=true]]:border-[var(--lui-danger)]",
    "has-[[aria-invalid=true]]:[--lui-focus:var(--lui-danger)]",
    font, controlSkin(props), props.disabled && "opacity-50",
  )}>
    <button
      aria-label="Decrease"
      class={$("grid place-items-center $hoverSoft disabled:opacity-50",
        squareSizes[props.size || "md"], focus)}
      disabled={live(() => props.disabled || props.readOnly || value() <= min)}
      type="button"
      onClick={() => shift(-1)}
    ><Icon name="minus" /></button>
    <input
      aria-label={props["aria-label"] || props.label || "Number"}
      aria-describedby={props["aria-describedby"]}
      aria-invalid={Boolean(props.error) || undefined}
      class={$("min-w-0 border-x $line bg-transparent text-center outline-none",
        sizes[props.size || "md"])}
      disabled={props.disabled}
      id={props.id}
      name={props.name}
      readOnly={props.readOnly}
      required={props.required}
      max={Number.isFinite(max) ? max : undefined}
      min={Number.isFinite(min) ? min : undefined}
      step={step}
      type="number"
      value={current.value}
      onInput={(event: Event) => {
        const input = target<HTMLInputElement>(event);
        set(input.value === "" ? undefined : Number(input.value));
      }}
    />
    <button
      aria-label="Increase"
      class={$("grid place-items-center $hoverSoft disabled:opacity-50",
        squareSizes[props.size || "md"], focus)}
      disabled={live(() => props.disabled || props.readOnly || value() >= max)}
      type="button"
      onClick={() => shift(1)}
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
    if (props.disabled || props.readOnly) return;
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
    onClick={() => {
      if (!props.disabled && !props.readOnly) {
        current.set(values().filter((item) => item !== value));
      }
    }}
  ><Icon name="x" /></button></span>));
  return <div class={$(
    "lui-tags flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5",
    "focus-within:outline-2 focus-within:outline-offset-2",
    "focus-within:outline-[var(--lui-focus,var(--lui-primary))]",
    "has-[[aria-invalid=true]]:border-[var(--lui-danger)]",
    "has-[[aria-invalid=true]]:[--lui-focus:var(--lui-danger)]",
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
        if (event.isComposing || props.disabled || props.readOnly) return;
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

export type FileReject = {
  file: File;
  reason: "type" | "size" | "count";
};
export type FileUploadProps = UiProps & {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  readOnly?: boolean;
  removable?: boolean;
  onReject?: (files: FileReject[]) => void;
};
export function FileUpload(props: FileUploadProps) {
  const current = model(props, props.defaultValue ?? (props.multiple ? [] : null));
  let depth = 0;
  const status = state({ dragging: false, errors: [] as FileReject[] });
  let input: HTMLInputElement | null = null;
  const locked = () => props.disabled || props.readOnly;
  const files = (): File[] => {
    const value = read(current.value);
    return value == null ? [] : Array.isArray(value) ? value : [value as File];
  };
  const accepts = (file: File) => {
    const types = (props.accept || "").toLowerCase().split(",")
      .map((value) => value.trim()).filter(Boolean);
    return !types.length || types.some((type) => type.startsWith(".")
      ? file.name.toLowerCase().endsWith(type)
      : type.endsWith("/*") ? file.type.toLowerCase().startsWith(type.slice(0, -1))
        : file.type.toLowerCase() === type);
  };
  const receive = (values: File[]) => {
    if (locked() || !values.length) return;
    const accepted: File[] = [];
    const rejected: FileReject[] = [];
    const max = props.multiple ? Math.max(0, props.maxFiles ?? Infinity) : 1;
    for (const file of values) {
      const reason = !accepts(file) ? "type"
        : props.maxSize !== undefined && file.size > props.maxSize ? "size"
          : accepted.length >= max ? "count" : undefined;
      if (reason) rejected.push({ file, reason });
      else accepted.push(file);
    }
    status.errors = rejected;
    if (accepted.length) current.set(props.multiple ? accepted : accepted[0]);
    if (rejected.length) props.onReject?.(rejected);
  };
  const remove = (file: File) => {
    if (locked()) return;
    const next = files().filter((item) => item !== file);
    status.errors = [];
    if (input) input.value = "";
    current.set(props.multiple ? next : null);
  };
  return <div class={$("lui-upload grid gap-3", font)}>
    <div
      aria-disabled={props.disabled || undefined}
      class={live(() => $(
        "grid place-items-center gap-2 border border-dashed p-6 text-center",
        "$radius $bg transition-colors",
        status.dragging ? "border-[var(--lui-primary)] $soft" : "$line",
        props.disabled && "opacity-50",
      ))}
      onDragEnter={(event: DragEvent) => {
        event.preventDefault();
        if (!locked()) status.dragging = ++depth > 0;
      }}
      onDragLeave={() => {
        depth = Math.max(0, depth - 1);
        status.dragging = depth > 0;
      }}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = locked() ? "none" : "copy";
        }
      }}
      onDrop={(event: DragEvent) => {
        event.preventDefault();
        depth = 0;
        status.dragging = false;
        receive([...(event.dataTransfer?.files || [])]);
      }}
    >
      <input accept={props.accept} class="sr-only"
        disabled={locked()} multiple={props.multiple}
        aria-label={props.label || "Choose files"}
        ref={(node: Element | null) => input = node as HTMLInputElement | null}
        tabindex={-1} type="file"
        onChange={(event: Event) => {
          receive([...(target<HTMLInputElement>(event).files || [])]);
        }}
      />
      <Icon class={$("text-2xl $primaryText")}
        name={props.icon || "cloud-upload"} />
      <b class="text-sm font-medium">{props.label || "Choose files"}</b>
      <small class={$("$muted")}>
        {props.description || "Drop files here or browse"}
      </small>
      <button class={$("rounded $soft px-3 py-1.5 text-sm $hoverSoft", focus)}
        disabled={locked()} type="button"
        onClick={() => { if (!locked()) input?.click(); }}
      >Browse</button>
    </div>
    {live(() => files().length ? <ul class="grid gap-2">
      {files().map((file) => <li class={$(
        "flex items-center gap-3 $radius border $line $bg px-3 py-2 text-sm",
      )}>
        <Icon class={$("shrink-0 $muted")} name="file" />
        <span class="min-w-0 flex-1 truncate">{file.name}</span>
        <small class={$("shrink-0 $muted")}>
          {file.size < 1024 ? `${file.size} B`
            : `${Math.ceil(file.size / 1024)} KB`}
        </small>
        {props.removable === false ? null : <button
          aria-label={`Remove ${file.name}`} class={$("rounded p-1", focus)}
          disabled={locked()} type="button" onClick={() => remove(file)}
        ><Icon name="x" /></button>}
      </li>)}
    </ul> : null)}
    {live(() => status.errors.length ? <div role="alert"
      class={$("grid gap-1 text-sm $dangerText")}
    >{status.errors.map(({ file, reason }) => <p>
        {file.name}: {reason === "type" ? "File type is not allowed."
          : reason === "size" ? "File is too large." : "Too many files."}
      </p>)}</div> : null)}
  </div>;
}

export function InputRating(props: UiProps) {
  const max = Math.max(1, Number(props.max || 5));
  const current = model(props, props.defaultValue ?? 0);
  return <div
    aria-label={props["aria-label"] || props.label || "Rating"}
    class={"lui-rating inline-flex gap-1"}
    role="radiogroup"
    onKeyDown={(event: KeyboardEvent) => {
      if (props.disabled || props.readOnly) return;
      moveFocus(event, target<HTMLElement>(event), '[role="radio"]')?.click();
    }}
  >{Array.from({ length: max }, (_, index) => index + 1).map((value) => <button
    aria-checked={pick(current.value, (item) => Number(item) === value)}
    aria-label={`${value} of ${max}`}
    class={pick(current.value, (item) => $(
      "rounded text-2xl leading-none", focus,
      value <= Number(item) ? "text-[var(--lui-warning)]" : "text-[var(--lui-line)]",
    ))}
    disabled={props.disabled || props.readOnly}
    role="radio"
    tabindex={pick(current.value, (item) => (
      Number(item) === value || (!Number(item) && value === 1) ? 0 : -1
    ))}
    type="button"
    onClick={() => {
      if (!props.disabled && !props.readOnly) current.set(value);
    }}
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
    if (props.disabled || props.readOnly
      || items.find((item) => Object.is(item.value, value))?.disabled) return;
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
    aria-multiselectable={props.multiple || undefined}
    aria-readonly={props.readOnly || undefined}
    onKeyDown={(event: KeyboardEvent) => {
      const node = moveFocus(event, target<HTMLElement>(event), '[role="option"]');
      if (node && !props.multiple && !props.readOnly) node.click();
    }}
  >{items.map((item) => <button
    aria-selected={live(() => selected(item.value))}
    class={live(() => $(
      "flex items-center justify-between rounded px-3 py-2 text-left", focus,
      selected(item.value)
        ? "$primaryBg text-[var(--lui-on-primary)]"
        : "$hoverSoft",
    ))}
    disabled={props.disabled || props.readOnly || item.disabled}
    role="option"
    tabindex={live(() => {
      const active = items.find((entry) => !entry.disabled && selected(entry.value))
        || items.find((entry) => !entry.disabled);
      return item === active ? 0 : -1;
    })}
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
  const tone = tones[props.color || "primary"] || tones.primary;
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

export type SelectMenuProps = UiProps & {
  clearable?: boolean;
  empty?: string;
  filter?: (item: Item, query: string) => boolean;
  ignoreFilter?: boolean;
  maxVisible?: number;
  multiple?: boolean;
  readOnly?: boolean;
  searchTerm?: unknown;
  onSearchChange?: (value: string) => void;
  slotItem?: (item: Item, selected: boolean) => any;
  slotEmpty?: () => any;
  slotValue?: (items: Item[]) => any;
};
export function SelectMenu(props: SelectMenuProps) {
  const current = model(
    props, props.defaultValue ?? (props.multiple ? [] : ""),
  );
  const query = model({
    value: props.searchTerm, onChange: props.onSearchChange,
  }, "");
  const active = state({ id: "", open: false });
  const id = props.id || `lui-select-${++menuId}`;
  const popup = `${id}-popup`;
  const listId = `${id}-list`;
  let trigger: HTMLButtonElement | null = null;
  let menu: HTMLElement | null = null;
  const items = () => itemsOf((read(props.items) || []).flatMap((item: any) => (
    item && typeof item === "object" && Array.isArray(item.items)
      ? itemsOf(item.items).map((entry) => ({ ...entry, group: item.group }))
      : [item]
  )));
  const selected = (value: unknown) => {
    const source = read(current.value);
    return props.multiple
      ? Array.isArray(source)
        && source.some((entry) => Object.is(entry, value))
      : Object.is(source, value);
  };
  const chosen = () => items().filter((item) => selected(item.value));
  const blocked = () => props.disabled || props.readOnly || props.loading;
  const close = (restore = true) => {
    menu?.hidePopover?.();
    active.open = false;
    active.id = "";
    if (restore) trigger?.focus();
  };
  const choose = (item: Item) => {
    if (blocked() || item.disabled) return;
    if (!props.multiple) {
      close();
      current.set(item.value);
      return;
    }
    const source = read(current.value);
    const values = Array.isArray(source) ? source : [];
    current.set(selected(item.value)
      ? values.filter((value) => !Object.is(value, item.value))
      : [...values, item.value]);
  };
  const nodes = () => [...(menu?.querySelectorAll<HTMLButtonElement>(
    '[role="option"]:not(:disabled)',
  ) || [])];
  const move = (event: KeyboardEvent) => {
    if (event.isComposing || blocked()) return;
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      close();
      return;
    }
    const options = nodes();
    const index = options.findIndex((node) => node.id === active.id);
    if (event.key === "Enter") {
      event.preventDefault();
      options[index]?.click();
      return;
    }
    let next: number;
    if (event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === "ArrowUp") {
      next = index < 0 ? options.length - 1
        : (index - 1 + options.length) % options.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    const node = options[next];
    if (!node) return;
    active.id = node.id;
    node.scrollIntoView?.({ block: "nearest" });
    if (props.searchInput === false) node.focus();
  };
  const open = (last = false) => {
    if (blocked()) return;
    menu?.showPopover?.();
    active.open = true;
    const options = nodes();
    const node = options.find((item) => item.id === active.id)
      || options.find((item) => item.getAttribute("aria-selected")
      === "true") || (last ? options.at(-1) : options[0]);
    active.id = node?.id || "";
    const search = menu?.querySelector<HTMLInputElement>("input");
    if (search) search.focus();
    else node?.focus();
  };
  const label = live(() => {
    const found = chosen();
    if (props.slotValue && found.length) return props.slotValue(found);
    if (!found.length) return <span class={$("$muted")}>
      {props.placeholder || props.label || "Select"}
    </span>;
    if (!props.multiple) return found[0]!.label;
    const max = Math.max(1, props.maxVisible ?? 3);
    return <span class="flex flex-wrap gap-1">
      {found.slice(0, max).map((item) => <span
        class={$("rounded $soft px-1.5 py-0.5 text-xs")}
      >{item.label}</span>)}
      {found.length > max ? <span class={$("text-xs $muted")}>
        +{found.length - max}
      </span> : null}
    </span>;
  });
  const options = live(() => {
    const needle = String(read(query.value) || "").trim();
    const found = items().filter((item) => props.ignoreFilter
      || (props.filter ? props.filter(item, needle)
        : `${item.label} ${item.description || ""}`
          .toLocaleLowerCase().includes(needle.toLocaleLowerCase())));
    if (!found.length) return <small class={$("p-3 $muted")} role="status">
      {props.slotEmpty?.() || props.empty || "No results"}
    </small>;
    return found.map((item, index) => <>
      {item.group && item.group !== found[index - 1]?.group ? <div
        class={$("px-3 pt-2 pb-1 text-xs font-medium $muted")}
      >{item.group}</div> : null}
      <button
        aria-selected={live(() => selected(item.value))}
        class={live(() => $(
          "flex items-center gap-2 rounded px-3 py-2 text-left text-sm",
          "outline-none disabled:opacity-50",
          active.id === `${id}-option-${index}` ? "$soft" : "$hoverSoft",
          selected(item.value) && "font-medium",
        ))}
        disabled={item.disabled || props.disabled || props.readOnly}
        id={`${id}-option-${index}`}
        role="option"
        tabindex={-1}
        type="button"
        onClick={() => choose(item)}
        onPointerMove={() => {
          if (!item.disabled) active.id = `${id}-option-${index}`;
        }}
      >{props.slotItem ? live(() => props.slotItem!(item,
          selected(item.value))) : <>
          {item.icon ? <Icon name={item.icon} /> : null}
          <span class="grid flex-1"><span>{item.label}</span>
            {item.description ? <small class={$("$muted")}>
              {item.description}
            </small> : null}
          </span>
        </>}
        <span class="ml-auto size-4 shrink-0">{live(() => (
          selected(item.value) ? <Icon name="check" /> : null
        ))}</span>
      </button>
    </>);
  });
  return <div class={$("lui-select-menu relative", font)}>
    <button
      {...props.$attrs}
      aria-busy={props.loading || undefined}
      aria-controls={listId}
      aria-expanded={live(() => active.open)}
      aria-haspopup="listbox"
      aria-invalid={Boolean(props.error) || undefined}
      aria-label={props["aria-label"] || props.label}
      aria-readonly={props.readOnly || undefined}
      class={$(
        "flex w-full items-center gap-2 text-left",
        control, controlSkin(props), sizes[props.size || "md"],
      )}
      disabled={props.disabled || props.loading}
      id={id}
      popovertarget={props.readOnly ? undefined : popup}
      ref={(node: Element | null) => {
        trigger = node as HTMLButtonElement | null;
      }}
      type="button"
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          open(event.key === "ArrowUp");
        }
      }}
    >
      {props.icon ? <Icon name={props.icon} /> : null}
      <span class={$("min-w-0 flex-1", props.clearable && "pr-7")}>
        {label}
      </span>
      <Icon class={$(props.loading && "animate-spin")}
        name={props.loading ? "loader" : "chevron-down"} />
    </button>
    {props.clearable ? <button
      aria-label="Clear selection"
      class={$("absolute right-9 top-1/2 -translate-y-1/2 rounded p-1",
        "$muted $hoverSoft disabled:opacity-40", focus)}
      disabled={live(() => blocked() || !chosen().length)}
      type="button"
      onClick={() => {
        if (blocked()) return;
        close();
        current.set(props.multiple ? [] : "");
      }}
    ><Icon name="x" /></button> : null}
    <div
      class={$("m-0 min-w-48 $radius border $line $bg p-1 shadow-lg")}
      id={popup}
      popover="auto"
      ref={(node: Element | null) => menu = node as HTMLElement | null}
      onKeyDown={move}
      onToggle={(event: Event) => {
        const node = target<HTMLElement>(event);
        const shown = (event as ToggleEvent).newState === "open";
        active.open = shown;
        if (trigger && shown) {
          place(node, trigger, props.align,
            props.width ?? trigger.getBoundingClientRect().width);
          open();
        } else active.id = "";
      }}
    >
      {props.searchInput === false ? null : <input
        aria-activedescendant={live(() => active.id || undefined)}
        aria-controls={listId}
        aria-expanded={live(() => active.open)}
        aria-label={props.searchPlaceholder || "Search"}
        class={$("mb-1 w-full px-3 py-2", field, focus)}
        placeholder={props.searchPlaceholder || "Search"}
        role="combobox"
        value={query.value}
        onInput={(event: Event) => {
          active.id = "";
          query.set(target<HTMLInputElement>(event).value);
        }}
      />}
      <div class="grid gap-1" id={listId} role="listbox"
        aria-label={props.label || props["aria-label"] || "Options"}
        aria-multiselectable={props.multiple || undefined}
      >{options}</div>
    </div>
    {props.name ? live(() => {
      const value = read(current.value);
      const values = props.multiple ? Array.isArray(value) ? value : []
        : [value ?? ""];
      return values.map((entry) => <input
        disabled={props.disabled} name={props.name}
        type="hidden" value={String(entry)}
      />);
    }) : null}
  </div>;
}
