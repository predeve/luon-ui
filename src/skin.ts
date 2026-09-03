import { $ } from "./util.ts";
export const font = $("font-[family-name:var(--lui-font)] $text");
export const focus = "focus-visible:outline-3 focus-visible:outline-offset-1 "
  + "focus-visible:outline-[color-mix(in_srgb,var(--lui-primary)_25%,transparent)]";

export const sizes: Record<string, string> = {
  xs: "min-h-7 px-2 py-1 text-xs", sm: "min-h-8 px-2.5 py-1.5 text-sm",
  md: "min-h-10 px-3 py-2 text-sm", lg: "min-h-11 px-4 py-2.5 text-base",
  xl: "min-h-13 px-5 py-3 text-lg",
};
export const tones: Record<string, string> = {
  danger: "[--lui-action:var(--lui-danger)]",
  error: "[--lui-action:var(--lui-danger)]", neutral: "[--lui-action:var(--lui-text)]",
  primary: "[--lui-action:var(--lui-primary)]",
  secondary: "[--lui-action:var(--lui-secondary)]",
  success: "[--lui-action:var(--lui-success)]",
  warning: "[--lui-action:var(--lui-warning)]",
};
export const buttonKinds: Record<string, string> = {
  ghost: $("border-transparent bg-transparent $actionText $hoverSoft"),
  link: $("min-h-auto border-transparent bg-transparent p-0",
    "$actionText underline-offset-4 hover:underline"),
  outline: $("border-[color-mix(in_srgb,var(--lui-action)_35%,var(--lui-line))]",
    "bg-transparent $actionText $hoverSoft"),
  soft: $("border-transparent $actionSoft $actionText",
    "hover:bg-[color-mix(in_srgb,var(--lui-action)_20%,var(--lui-bg))]"),
  solid: $("border-transparent $actionBg text-white hover:brightness-90"),
};
export const control = $(
  "w-full $radius border $line",
  "$bg px-3 py-2 text-sm $text",
  "$placeholderMuted disabled:pointer-events-none",
  "disabled:opacity-50", font, focus,
);
