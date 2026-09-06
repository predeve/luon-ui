/** @jsxImportSource @luon/view */
import { r } from "@luon/rule";
import { Icon } from "./icon.view.js";
import { inputProps, type InputProps } from "./props.ts";
import { controlSkin, font, sizes } from "./skin.ts";
import { $, model, read, target } from "./util.ts";

export const spec = inputProps;
export const data = r.initial({ shown: r.boolean() });
export default (props: InputProps) => {
  const current = model(props, props.defaultValue ?? "");
  const password = props.type === "password";
  const errorId = props.id ? `${props.id}-error` : undefined;
  return <span class={style.root}>
    {props.slotLeading || props.icon || props.prefix ? <span
      class={style.leading}
    >{props.slotLeading ? props.slotLeading() : <>
        {props.icon ? <Icon name={props.icon} /> : null}
        {props.prefix ? <span>{props.prefix}</span> : null}
      </>}</span> : null}
    <input
      {...attrs}
      aria-describedby={[
        attrs["aria-describedby"],
        typeof props.error === "string" ? errorId : undefined,
      ].filter(Boolean).join(" ") || undefined}
      aria-invalid={Boolean(props.error) || undefined}
      class={[style.$input, props.className ?? props.class]}
      disabled={props.disabled}
      type={password ? data.shown ? "text" : "password" : props.type}
      value={current.value}
      onInput={(event: Event) => {
        if (!props.disabled && !props.readOnly) {
          current.set(target<HTMLInputElement>(event).value);
        }
      }}
    />
    {props.loading || props.trailingIcon || password || props.clearable
      || props.suffix || props.slotTrailing ? <span class={style.trailing}>
        {props.loading ? <Icon class="animate-spin" name="loader" /> : null}
        {props.clearable ? <button
          aria-label="Clear input"
          class={style.action}
          disabled={props.disabled || props.readOnly || !read(current.value)}
          onClick={(event: MouseEvent) => {
            if (props.disabled || props.readOnly) return;
            current.set("");
            target<HTMLElement>(event).closest(".lui-input")
              ?.querySelector("input")?.focus();
          }}
          type="button"
        ><Icon name="x" /></button> : null}
        {password ? <button
          aria-label={data.shown ? "Hide password" : "Show password"}
          aria-pressed={data.shown}
          class={style.action}
          disabled={props.disabled}
          onClick={() => {
            if (!props.disabled) data.shown = !data.shown;
          }}
          type="button"
        >
          <span class={data.shown ? "hidden" : undefined}>
            <Icon name="eye" />
          </span>
          <span class={data.shown ? undefined : "hidden"}>
            <Icon name="eye-off" />
          </span>
        </button> : null}
        {props.slotTrailing ? props.slotTrailing() : <>
          {props.suffix ? <span>{props.suffix}</span> : null}
          {props.trailingIcon ? <Icon name={props.trailingIcon} /> : null}
        </>}
      </span> : null}
    {typeof props.error === "string" ? <small
      class={style.error} id={errorId}
    >{props.error}</small> : null}
  </span>;
};
export const style = {
  root: [
    "lui-input relative flex w-full items-center",
    "border rounded-[var(--lui-radius)] transition-colors",
    "focus-within:outline-2 focus-within:outline-offset-2",
    "focus-within:outline-[var(--lui-focus)]",
    "has-[[aria-invalid=true]]:border-[var(--lui-danger)]",
    "has-[[aria-invalid=true]]:[--lui-focus:var(--lui-danger)]",
    font, controlSkin(props), props.disabled && "opacity-50",
  ],
  leading: $("flex shrink-0 items-center gap-2 pl-3 text-sm $muted"),
  trailing: $("flex shrink-0 items-center gap-1.5 pr-3 text-sm $muted"),
  $input: [
    font, sizes[props.size],
    "w-full min-w-0 flex-1 border-0 bg-transparent",
    "rounded-[var(--lui-radius)] placeholder:text-[var(--lui-muted)]",
    "focus-visible:outline-none disabled:pointer-events-none",
  ],
  action: $(
    "rounded p-1 $muted $hoverSoft",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-[var(--lui-primary)]",
  ),
  error: $("absolute left-0 top-full mt-1 text-xs $dangerText"),
};
