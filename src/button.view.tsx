/** @jsxImportSource @luon/view */
import { Icon } from "./icon.view.js";
import { buttonProps, type ButtonProps } from "./props.ts";
import { buttonKinds, focus, font, sizes, squareSizes, tones } from "./skin.ts";

export const spec = buttonProps;
export default (props: ButtonProps) => {
  const marker = props.loading
    ? <Icon name={props.loadingIcon || "loader"} class="animate-spin" />
    : props.slotLeading ? props.slotLeading()
      : props.icon ? <Icon name={props.icon} /> : null;
  const tail = props.trailingIcon ? <Icon
    class={/(?:arrow|caret|chevron)-down/.test(props.trailingIcon) ? "mr-1"
      : undefined}
    name={props.trailingIcon}
  /> : null;
  const content = props.label ?? props.children;
  const end = props.slotTrailing ? props.slotTrailing() : tail;
  const body = props.trailing ? <>{content}{marker}{end}</>
    : <>{marker}{content}{end}</>;
  if (props.to || props.href) {
    return <a {...attrs}
      aria-busy={props.loading || undefined}
      aria-disabled={props.disabled || props.loading || undefined}
      href={props.disabled || props.loading
        ? undefined : props.to || props.href}
      role="link"
      tabindex={props.disabled || props.loading ? -1
        : attrs.tabindex ?? attrs.tabIndex}
      onClick={(event: MouseEvent) => {
        if (props.disabled || props.loading) {
          event.preventDefault();
          return;
        }
        props.onClick?.(event);
      }}
      class={[style.root, props.className ?? props.class]}
    >{body}</a>;
  }
  return <button {...attrs}
    aria-busy={props.loading || undefined}
    class={[style.root, props.className ?? props.class]}
    disabled={props.disabled || props.loading}
    type={props.type}
  >{body}</button>;
};
export const style = {
  $radius: "rounded-[var(--lui-radius)]",
  $button: [
    "lui-button inline-flex items-center justify-center gap-2",
    "$radius border font-semibold no-underline",
    "transition-colors disabled:pointer-events-none",
    "aria-disabled:pointer-events-none",
  ],
  root: [
    "$button", font, focus, tones[props.color],
    buttonKinds[props.variant],
    props.square || (props.icon && !props.label && !props.children)
      ? squareSizes[props.size] : props.variant === "link"
        ? props.size === "xs" ? "text-xs" : props.size === "xl"
          ? "text-lg" : props.size === "lg" ? "text-base" : "text-sm"
        : sizes[props.size],
    props.block && "flex w-full",
    props.disabled && "opacity-50",
  ],
};
