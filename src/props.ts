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
  defaultValue: any(), size: size(),
  variant: r.enum(["outline", "soft", "subtle", "ghost", "none"])
    .default("outline"),
});
export const buttonProps = baseProps.extend({
  block: r.boolean(),
  square: r.boolean(),
  color: r.enum([
    "danger", "error", "neutral", "primary",
    "secondary", "success", "warning",
  ]).default("primary"),
  href: r.string().optional(),
  icon: r.string().optional(),
  label: any(),
  loading: r.boolean(),
  loadingIcon: r.string().optional(),
  slotLeading: any(), slotTrailing: any(),
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
  prefix: r.string().optional(), suffix: r.string().optional(),
  slotLeading: any(), slotTrailing: any(),
  type: r.string().default("text"),
});
const omit: Record<string, string[]> = {
  Badge: ["color", "count", "dot", "label", "size", "variant"],
  Card: ["description", "slotFooter", "slotHeader", "slotTitle",
    "slotDescription", "slotActions", "title", "size", "variant"],
  Checkbox: ["checked", "color", "defaultChecked", "description", "label"],
  Draggable: ["axis", "bounds", "defaultValue", "handle", "onEnd", "onMove",
    "onStart", "threshold"],
  Icon: ["name", "size"], Link: ["external", "to", "variant"],
  InputNumber: ["color", "defaultValue", "error", "id", "label", "max", "min",
    "name", "readOnly", "required", "size", "step", "variant"],
  FileUpload: ["accept", "defaultValue", "description", "icon", "label",
    "maxFiles", "maxSize", "multiple", "onReject", "readOnly", "removable"],
  FormField: ["description", "error", "help", "hint", "label",
    "orientation", "required"],
  DropdownMenu: ["align", "id", "items", "label", "side", "width"],
  ContextMenu: ["items", "label", "width"],
  Modal: ["defaultOpen", "description", "dismissible", "fullscreen",
    "initialFocus", "label", "onOpenChange", "onUpdate:open", "open",
    "restoreFocus", "scrollable", "size", "slotFooter", "slotHeader",
    "title", "width"],
  Drawer: ["defaultOpen", "description", "dismissible", "initialFocus",
    "label", "onOpenChange", "onUpdate:open", "open", "restoreFocus",
    "direction", "size", "slotFooter", "slotHeader", "title", "width"],
  Select: ["defaultValue", "items", "placeholder", "size", "variant",
    "color", "error", "readOnly"],
  SelectMenu: ["align", "clearable", "color", "defaultValue", "empty",
    "error", "filter", "icon", "ignoreFilter", "items", "loading",
    "maxVisible", "multiple", "name", "onSearchChange", "placeholder",
    "readOnly", "searchInput", "searchPlaceholder", "searchTerm", "size",
    "slotEmpty", "slotItem", "slotValue", "variant", "width"],
  Switch: ["checked", "defaultChecked", "description", "label", "size"],
  Sortable: ["animation", "defaultValue", "direction", "group", "handle",
    "onEnd", "onMove", "onSort", "onStart", "threshold"],
  Term: ["as"], Text: ["as", "color", "size", "weight"],
  Textarea: ["autoresize", "defaultValue", "size", "variant", "color",
    "error", "maxRows", "resize"],
  Table: ["caption", "columns", "data", "density", "empty", "hover",
    "loading", "rows", "slotEmpty", "slotLoading", "sticky", "striped"],
};
export function uiProps(name: string) {
  const fields: Record<string, any> = {};
  for (const key of omit[name] || []) fields[key] = any();
  return baseProps.extend(fields);
}
type Slots = {
  slotLeading?: () => any;
  slotTrailing?: () => any;
};
export type ButtonProps = UiProps & Slots
  & Partial<RuleOutput<typeof buttonProps>>;
export type InputProps = UiProps & Slots
  & Partial<RuleOutput<typeof inputProps>>;
