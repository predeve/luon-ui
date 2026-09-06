import type { Child, Read } from "@luon/view";
export type UiProps = Record<string, any> & {
  children?: any; class?: any; className?: any;
};
export type Item = {
  group?: string;
  children?: Child; description?: string; disabled?: boolean; icon?: string;
  label: string; value: unknown;
};
export type Live<Value = unknown> = Value | Read<Value>;
