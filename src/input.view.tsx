/** @jsxImportSource @luon/view */
import { r } from "@luon/rule";
import { Icon } from "./icon.view.js";
import { inputProps, type InputProps } from "./props.ts";
import { control, font, sizes } from "./skin.ts";
import { $, model, pick, target } from "./util.ts";

export const spec = inputProps;
export const data = r.initial({ shown: r.boolean() });
export default (props: InputProps) => {
  const current = model(props, props.defaultValue ?? "");
  const password = props.type === "password";
  return <span class={style.root}>
    {props.icon ? <Icon class={style.leading} name={props.icon} /> : null}
    <input
      {...attrs}
      aria-invalid={Boolean(props.error) || undefined}
      class={[style.$input, props.className ?? props.class]}
      type={password ? data.shown ? "text" : "password" : props.type}
      value={current.value}
      onInput={(event: Event) => current.set(
        target<HTMLInputElement>(event).value,
      )}
    />
    {props.loading ? <Icon class={style.loading} name="loader" />
      : props.trailingIcon ? <Icon class={style.trailing}
        name={props.trailingIcon} /> : password ? <button
        aria-label={data.shown ? "Hide password" : "Show password"}
        class={style.action}
        onClick={() => data.shown = !data.shown}
        type="button"
      >
        <span class={data.shown ? "hidden" : undefined}><Icon name="eye" /></span>
        <span class={data.shown ? undefined : "hidden"}><Icon name="eye-off" /></span>
      </button> : props.clearable ? <button
        aria-label="Clear input"
        class={style.action}
        disabled={pick(current.value, (value) => !value)}
        onClick={() => current.set("")}
        type="button"
      ><Icon name="x" /></button> : null}
    {typeof props.error === "string"
      ? <small class={style.error}>{props.error}</small> : null}
  </span>;
};
export const style = {
  root: ["lui-input relative flex w-full items-center", font],
  leading: $("pointer-events-none absolute left-3 $muted"),
  $input: [
    control, sizes[props.size],
    props.icon && "pl-9",
    (props.type === "password" || props.clearable || props.loading
      || props.trailingIcon) && "pr-9",
    props.error && "border-[var(--lui-danger)]",
  ],
  loading: "pointer-events-none absolute right-3 animate-spin",
  trailing: $("pointer-events-none absolute right-3 $muted"),
  action: $("absolute right-2 rounded p-1 $muted"),
  error: $("absolute top-full mt-1 text-xs $dangerText"),
};
