import { r, type RuleOutput } from "@luon/rule";
import type { UiProps } from "./types.ts";
const any = () => r.any().optional();
const size = () => r.enum(["xs", "sm", "md", "lg", "xl"]).default("md");
export const baseProps = r.object({
  children: any(), class: any(), className: any(),
  disabled: r.boolean(),
  modelValue: any(), "model-value": any(),
  onChange: any(), onValueChange: any(), "onUpdate:model-value": any(),
  style: any(), ui: any(), value: any(),
}).passthrough();
export const controlProps = baseProps.extend({
  defaultValue: any(), size: size(), variant: r.string().optional(),
});
export const buttonProps = baseProps.extend({
  block: r.boolean(),
  color: r.enum([
    "danger", "error", "neutral", "primary",
    "secondary", "success", "warning",
  ]).default("primary"),
  href: r.string().optional(),
  icon: r.string().optional(),
  label: any(),
  loading: r.boolean(),
  size: size(),
  to: r.string().optional(),
  trailing: r.boolean(),
  trailingIcon: r.string().optional(),
  type: r.enum(["button", "reset", "submit"]).default("button"),
  variant: r.enum(["ghost", "link", "outline", "soft", "solid"])
    .default("solid"),
});
export const inputProps = controlProps.extend({
  clearable: r.boolean(), color: r.string().optional(), error: any(),
  icon: r.string().optional(), loading: r.boolean(),
  trailingIcon: r.string().optional(),
  type: r.string().default("text"),
});
const omit: Record<string, string[]> = {
  Badge: ["color", "count", "dot", "label", "size", "variant"],
  Card: ["description", "slotFooter", "slotHeader", "title"],
  Checkbox: ["checked", "color", "defaultChecked", "description", "label"],
  Draggable: ["axis", "bounds", "defaultValue", "handle", "onEnd", "onMove",
    "onStart", "threshold"],
  Icon: ["name", "size"], Link: ["external", "to", "variant"],
  Select: ["defaultValue", "items", "placeholder", "size", "variant"],
  Switch: ["checked", "defaultChecked", "description", "label", "size"],
  Sortable: ["animation", "defaultValue", "direction", "group", "handle",
    "onEnd", "onMove", "onSort", "onStart", "threshold"],
  Term: ["as"], Text: ["as", "color", "size", "weight"],
  Textarea: ["autoresize", "defaultValue", "size", "variant"],
};
export function uiProps(name: string) {
  const fields: Record<string, any> = {};
  for (const key of omit[name] || []) fields[key] = any();
  return baseProps.extend(fields);
}
export type ButtonProps = UiProps & Partial<RuleOutput<typeof buttonProps>>;
export type InputProps = UiProps & Partial<RuleOutput<typeof inputProps>>;
