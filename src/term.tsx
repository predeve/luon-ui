/** @jsxImportSource @luon/view */
import type { UiProps } from "./types.ts";

export function Term(props: UiProps) {
  const Tag = props.as || "span";
  return <Tag {...props.$attrs} class="notranslate"
    data-luon-term="" translate="no">{props.children}</Tag>;
}
