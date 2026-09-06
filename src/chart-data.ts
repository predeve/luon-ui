import type { Live, UiProps } from "./types.ts";
import { read } from "./util.ts";

export type ChartType =
  | "line"
  | "area"
  | "bar"
  | "horizontal"
  | "stacked"
  | "mixed"
  | "pie"
  | "donut"
  | "doughnut"
  | "radar"
  | "polarArea"
  | "scatter"
  | "bubble";
export type ChartPoint =
  | number
  | null
  | {
      x: number;
      y: number | null;
      r?: number;
    };
export type ChartDataset = {
  label?: string;
  data: ChartPoint[];
  type?: "bar" | "line" | "area";
  borderColor?: string;
  backgroundColor?: string | string[];
  borderWidth?: number;
  borderDash?: number[];
  fill?: boolean;
  hidden?: boolean;
  pointRadius?: number;
  spanGaps?: boolean;
  stepped?: boolean;
  tension?: number;
};
export type ChartData = {
  labels?: Array<string | number>;
  datasets: ChartDataset[];
};
export type ChartSeries = {
  label?: string;
  color?: string;
  values: ChartPoint[];
  type?: "bar" | "line" | "area";
};
export type ChartAxis = {
  type?: "category" | "linear";
  display?: boolean;
  min?: number;
  max?: number;
  beginAtZero?: boolean;
  stacked?: boolean;
  title?: { display?: boolean; text?: string };
  grid?: { display?: boolean };
  ticks?: {
    display?: boolean;
    maxTicksLimit?: number;
    callback?: (value: number, index: number) => string | number;
  };
};
export type ChartOptions = {
  interaction?: { intersect?: boolean; mode?: "index" | "nearest" };
  indexAxis?: "x" | "y";
  cutout?: number | `${number}%`;
  scales?: { x?: ChartAxis; y?: ChartAxis; r?: ChartAxis };
  plugins?: {
    legend?: { display?: boolean; position?: "top" | "bottom" };
    tooltip?: { enabled?: boolean };
  };
};
export type ChartSelection = {
  datasetIndex: number;
  index: number;
  label: string;
  series: string;
  x: number;
  y: number;
};
export type ChartHandle = {
  element: HTMLElement;
  toSVG(): string;
};
export type ChartProps = UiProps & {
  type?: ChartType;
  data?: Live<ChartData>;
  values?: Live<ChartPoint[]>;
  series?: Live<ChartSeries[]>;
  labels?: Array<string | number>;
  lineValues?: number[];
  label?: string;
  value?: string;
  height?: number;
  options?: ChartOptions;
  legend?: boolean;
  tooltip?: boolean;
  axes?: boolean;
  grid?: boolean;
  points?: boolean;
  maxPoints?: number;
  stacked?: boolean;
  loading?: boolean;
  empty?: string;
  formatValue?: (value: number) => string;
  onSelect?: (point: ChartSelection) => void;
  onReady?: (chart: ChartHandle) => void;
};
export type Point = { x: number; y: number; r: number; index: number };
export type Series = ChartDataset & {
  index: number;
  color: string;
  points: Array<Point | null>;
};
export const palette = [
  "var(--lui-primary)",
  "var(--lui-secondary)",
  "var(--lui-success)",
  "var(--lui-warning)",
  "var(--lui-danger)",
  "#38bdf8",
  "#e879f9",
  "#fb923c",
];
export const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function chartData(props: ChartProps) {
  const input = props.data === undefined ? undefined : read(props.data);
  const values = read(props.values) || [];
  const series = read(props.series);
  const datasets: ChartDataset[] =
    input?.datasets ||
    (series
      ? series.map((item) => ({
          data: item.values,
          label: item.label,
          borderColor: item.color,
          type: item.type,
        }))
      : [{ data: values, label: props.label }]);
  if (!input && !series && props.type === "mixed" && props.lineValues) {
    datasets[0] = { ...datasets[0]!, type: "bar" };
    datasets.push({ data: props.lineValues, label: "Trend", type: "line" });
  }
  const rows: Series[] = datasets.map((item, index) => ({
    ...item,
    index,
    color:
      item.borderColor ||
      (typeof item.backgroundColor === "string"
        ? item.backgroundColor
        : palette[index % palette.length]!),
    points: (item.data || []).map((value, at) => {
      const x = typeof value === "object" && value ? value.x : at;
      const y = typeof value === "object" && value ? value.y : value;
      if (!finite(x) || !finite(y)) return null;
      const radius = typeof value === "object" && value ? value.r : undefined;
      return { x, y, r: finite(radius) ? clamp(radius, 0, 60) : 5, index: at };
    }),
  }));
  const labels = input?.labels || props.labels || [];
  const count = rows.reduce(
    (n, row) => Math.max(n, row.points.length),
    labels.length,
  );
  return {
    rows,
    labels: Array.from({ length: count }, (_, i) => String(labels[i] ?? i + 1)),
  };
}

// Use a common domain for every visible dataset; never scale series apart.
export function scaleOf(values: number[], axis: ChartAxis = {}, zero = true) {
  let low = Infinity;
  let high = -Infinity;
  for (const value of values) {
    if (!finite(value)) continue;
    low = Math.min(low, value);
    high = Math.max(high, value);
  }
  if (!finite(low)) {
    low = 0;
    high = 1;
  }
  if (axis.beginAtZero ?? zero) {
    low = Math.min(0, low);
    high = Math.max(0, high);
  }
  if (finite(axis.min)) low = axis.min;
  if (finite(axis.max)) high = axis.max;
  if (high < low) [low, high] = [high, low];
  if (high === low) {
    const pad = Math.abs(low) * 0.1 || 1;
    if (!finite(axis.min)) low -= pad;
    if (!finite(axis.max) || high === low) high += pad;
  }
  const limit = clamp(axis.ticks?.maxTicksLimit || 5, 2, 12);
  const rough = (high - low) / (limit - 1);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].find((n) => n * power >= rough)! * power;
  if (!finite(axis.min)) low = Math.floor(low / step) * step;
  if (!finite(axis.max)) high = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  const first = Math.ceil(low / step) * step;
  for (let i = 0; i < 24; i++) {
    const value = Number((first + i * step).toPrecision(12));
    if (value > high + step * 1e-8) break;
    ticks.push(Object.is(value, -0) ? 0 : value);
  }
  return {
    min: low,
    max: high,
    ticks,
    at: (value: number) => (value - low) / (high - low),
  };
}

export function stackOf(rows: Series[]) {
  const positive: number[] = [];
  const negative: number[] = [];
  return rows.map((row) =>
    row.points.map((point) => {
      if (!point) return null;
      const sums = point.y < 0 ? negative : positive;
      const start = sums[point.index] || 0;
      const end = start + point.y;
      sums[point.index] = end;
      return { start, end };
    }),
  );
}

export function segments(points: Array<Point | null>, span = false) {
  const result: Point[][] = [];
  let group: Point[] = [];
  for (const point of points) {
    if (point) group.push(point);
    else if (!span && group.length) {
      result.push(group);
      group = [];
    }
  }
  if (group.length) result.push(group);
  return result;
}

// Preserve extrema and endpoints while bounding the size of dense SVG paths.
export function reducePoints(points: Point[], limit = 1000) {
  limit = finite(limit) ? Math.max(4, Math.floor(limit)) : 1000;
  if (points.length <= limit) return points;
  const buckets = Math.max(1, Math.floor((limit - 2) / 2));
  const result = [points[0]!];
  const span = (points.length - 2) / buckets;
  for (let i = 0; i < buckets; i++) {
    const start = 1 + Math.floor(i * span);
    const end = 1 + Math.floor((i + 1) * span);
    let min = start;
    let max = start;
    for (let j = start + 1; j < end; j++) {
      if (points[j]!.y < points[min]!.y) min = j;
      if (points[j]!.y > points[max]!.y) max = j;
    }
    for (const at of [...new Set([min, max])].sort((a, b) => a - b)) {
      result.push(points[at]!);
    }
  }
  result.push(points.at(-1)!);
  return result;
}

export function linePath(
  points: Array<{ x: number; y: number }>,
  stepped = false,
  tension = 0,
) {
  if (!points.length) return "";
  let path = `M${points[0]!.x},${points[0]!.y}`;
  const smooth = clamp(tension, 0, 1);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    // Horizontal endpoint tangents stay inside each pair's value range.
    if (stepped) path += `H${b.x}V${b.y}`;
    else if (smooth) {
      const gap = ((b.x - a.x) * smooth) / 2;
      path += `C${a.x + gap},${a.y} ${b.x - gap},${b.y} ${b.x},${b.y}`;
    } else path += `L${b.x},${b.y}`;
  }
  return path;
}

export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  inner: number,
  start: number,
  sweep: number,
) {
  // Two arcs also represent a complete circle without a degenerate SVG arc.
  const point = (r: number, angle: number) =>
    `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  const middle = start + sweep / 2;
  const end = start + sweep;
  const outer =
    `M${point(radius, start)}A${radius},${radius} 0 0 1 ` +
    `${point(radius, middle)}A${radius},${radius} 0 0 1 ${point(radius, end)}`;
  return inner > 0
    ? outer +
        `L${point(inner, end)}` +
        `A${inner},${inner} 0 0 0 ${point(inner, middle)}` +
        `A${inner},${inner} 0 0 0 ${point(inner, start)}Z`
    : outer + `L${cx},${cy}Z`;
}
