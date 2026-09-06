/** @jsxImportSource @luon/view */
import type { TableProps } from "./table-data.ts";
import { renderTable } from "./table-render.tsx";
import { uiProps } from "./props.ts";

export const spec = uiProps("Table");
export default (props: TableProps) => renderTable(props);
