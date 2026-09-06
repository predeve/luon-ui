/** @jsxImportSource @luon/view */
import type { ChartProps } from "./chart-data.ts";
import { renderChart } from "./chart-svg.tsx";
import { uiProps } from "./props.ts";

export const spec = uiProps("Chart");
export default (props: ChartProps) => renderChart(props);
