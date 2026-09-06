import { $ } from "./util.ts";
export const font = "lui-font";
export const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 "
  + "focus-visible:outline-[var(--lui-focus,var(--lui-primary))]";

export const sizes: Record<string, string> = {
  xs: "min-h-7 px-2 py-1 text-xs", sm: "min-h-8 px-2.5 py-1.5 text-sm",
  md: "min-h-10 px-3 py-2 text-sm", lg: "min-h-11 px-4 py-2.5 text-base",
  xl: "min-h-13 px-5 py-3 text-lg",
};
export const squareSizes: Record<string, string> = {
  xs: "size-7 p-0 text-xs", sm: "size-8 p-0 text-sm",
  md: "size-10 p-0 text-sm", lg: "size-11 p-0 text-base",
  xl: "size-13 p-0 text-lg",
};
export const tones: Record<string, string> = {
  danger: "[--lui-action:var(--lui-danger)] "
    + "[--lui-on-action:var(--lui-on-danger)]",
  error: "[--lui-action:var(--lui-danger)] "
    + "[--lui-on-action:var(--lui-on-danger)]",
  neutral: "[--lui-action:var(--lui-text)] "
    + "[--lui-on-action:var(--lui-bg)]",
  primary: "[--lui-action:var(--lui-primary)] "
    + "[--lui-on-action:var(--lui-on-primary)]",
  secondary: "[--lui-action:var(--lui-secondary)] "
    + "[--lui-on-action:var(--lui-on-secondary)]",
  success: "[--lui-action:var(--lui-success)] "
    + "[--lui-on-action:var(--lui-on-success)]",
  warning: "[--lui-action:var(--lui-warning)] "
    + "[--lui-on-action:var(--lui-on-warning)]",
};
export const buttonKinds: Record<string, string> = {
  ghost: $("border-transparent bg-transparent $actionText $hoverSoft"),
  link: $("min-h-auto border-transparent bg-transparent p-0",
    "$actionText underline-offset-4 hover:underline"),
  outline: $("border-[color-mix(in_srgb,var(--lui-action)_35%,var(--lui-line))]",
    "bg-transparent $actionText $hoverSoft"),
  soft: $("border-transparent $actionSoft $actionText",
    "hover:bg-[color-mix(in_srgb,var(--lui-action)_20%,var(--lui-bg))]"),
  solid: $("border-transparent $actionBg",
    "text-[var(--lui-on-action)] hover:brightness-95"),
};
export const controlKinds: Record<string, string> = {
  outline: "$bg",
  soft: "$soft",
  subtle: "$soft",
  ghost: "bg-transparent",
  none: "bg-transparent border-0 shadow-none",
};
export function controlSkin(props: Record<string, any>) {
  const variant = props.variant || "outline";
  return $(
    tones[props.color || "primary"] || tones.primary,
    controlKinds[variant] || controlKinds.outline,
    props.error ? "border-[var(--lui-danger)]"
      : ["soft", "ghost", "none"].includes(variant)
        ? "border-transparent" : "$line",
    props.error ? "[--lui-focus:var(--lui-danger)]"
      : "[--lui-focus:var(--lui-action)]",
  );
}
export const control = $(
  "w-full $radius border",
  "$text",
  "$placeholderMuted disabled:pointer-events-none",
  "aria-invalid:border-[var(--lui-danger)]",
  "aria-invalid:[--lui-focus:var(--lui-danger)]",
  "disabled:opacity-50 read-only:cursor-default",
  "transition-colors", font, focus,
);
