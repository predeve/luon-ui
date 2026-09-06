/** @jsxImportSource @luon/view */
import { liveView as live, state, type Child } from "@luon/view";
import {
  arcPath,
  chartData,
  clamp,
  finite,
  linePath,
  palette,
  reducePoints,
  scaleOf,
  segments,
  stackOf,
  type ChartProps,
  type ChartSelection,
  type Point,
  type Series,
} from "./chart-data.ts";

let chartId = 0;
const numbers = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const short = (text: string, size = 14) =>
  text.length > size ? `${text.slice(0, size - 1)}…` : text;

export function renderChart(props: ChartProps) {
  const id = `lui-chart-${++chartId}`;
  const local = state({
    width: 560,
    hidden: [] as number[],
    active: null as ChartSelection | null,
  });
  let observer: ResizeObserver | undefined;
  const format = (n: number) => props.formatValue?.(n) ?? numbers.format(n);
  const root = (node: Element | null) => {
    observer?.disconnect();
    observer = undefined;
    if (!node) return;
    const el = node as HTMLElement;
    const resize = () => {
      const css = el.ownerDocument.defaultView?.getComputedStyle(el);
      const padding =
        parseFloat(css?.paddingLeft || "0") +
        parseFloat(css?.paddingRight || "0");
      if (el.clientWidth > 0)
        local.width = clamp(el.clientWidth - padding, 200, 1600);
    };
    resize();
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resize);
      observer.observe(el);
    }
    queueMicrotask(() => {
      if (el.isConnected)
        props.onReady?.({
          element: el,
          toSVG: () => el.querySelector("svg")?.outerHTML || "",
        });
    });
  };
  const choose = (row: Series, point: Point, labels: string[]) => {
    if (
      local.active?.datasetIndex === row.index &&
      local.active.index === point.index &&
      local.active.y === point.y &&
      local.active.x === point.x
    )
      return;
    local.active = {
      datasetIndex: row.index,
      index: point.index,
      x: point.x,
      y: point.y,
      label:
        ["scatter", "bubble"].includes(props.type || "line") ||
        props.options?.scales?.x?.type === "linear"
          ? format(point.x)
          : labels[point.index] || String(point.x),
      series: row.label || `Series ${row.index + 1}`,
    };
  };
  const clear = () => {
    local.active = null;
  };
  const canvas = live(() => {
    const { rows, labels } = chartData(props);
    const type = props.type || "line";
    const opts = props.options || {};
    const radial = ["pie", "donut", "doughnut", "polarArea"].includes(type);
    const radar = type === "radar";
    const numeric = type === "scatter" || type === "bubble";
    const numericX = numeric || opts.scales?.x?.type === "linear";
    const horizontal = type === "horizontal" || opts.indexAxis === "y";
    const stacked =
      props.stacked ||
      type === "stacked" ||
      opts.scales?.x?.stacked ||
      opts.scales?.y?.stacked;
    const hidden = local.hidden;
    const visible = rows.filter(
      (row) => !row.hidden && (radial || !hidden.includes(row.index)),
    );
    const sliced =
      visible[0]?.points.filter((p): p is Point =>
        Boolean(p && p.y > 0 && !hidden.includes(p.index)),
      ) || [];
    const all = visible.flatMap((row) =>
      row.points.filter((p): p is Point => Boolean(p)),
    );
    const total = sliced.reduce((sum, point) => sum + point.y, 0);
    const width = local.width;
    const height = finite(props.height) ? clamp(props.height, 120, 1200) : 300;
    const xAxis = opts.scales?.x || {};
    const yAxis = opts.scales?.y || {};
    const axes = props.axes !== false && !radial && !radar;
    const xShown = axes && xAxis.display !== false;
    const yShown = axes && yAxis.display !== false;
    const left = yShown ? (horizontal ? 96 : 60) : 12;
    const right = width - 18;
    const top = 18;
    const bottom = height - (xShown ? 44 : 14);
    const pw = right - left;
    const ph = bottom - top;
    const barRows = visible.filter(
      (row) =>
        (row.type || type) === "bar" ||
        (!row.type && ["horizontal", "stacked", "mixed"].includes(type)),
    );
    const stacks = stackOf(barRows);
    const bounds = stacked
      ? [
          ...stacks.flatMap((row) =>
            row.flatMap((p) => (p ? [p.start, p.end] : [])),
          ),
          ...visible
            .filter((row) => !barRows.includes(row))
            .flatMap((row) => row.points.flatMap((p) => (p ? [p.y] : []))),
        ]
      : all.map((point) => point.y);
    const valueAxis = horizontal ? xAxis : yAxis;
    const scale = scaleOf(bounds, valueAxis);
    const xScale = scaleOf(
      all.map((p) => p.x),
      xAxis,
      false,
    );
    const x = (p: Point) =>
      numericX
        ? left + xScale.at(p.x) * pw
        : left + ((p.index + 0.5) / Math.max(1, labels.length)) * pw;
    const y = (value: number) => bottom - scale.at(value) * ph;
    const vx = (value: number) => left + scale.at(value) * pw;
    const cy = (p: Point) =>
      top + ((p.index + 0.5) / Math.max(1, labels.length)) * ph;
    const text = (n: number, i: number, axis = valueAxis) =>
      String(
        axis.ticks?.callback?.(n, i) ??
          props.formatValue?.(n) ??
          (Math.abs(n) >= 10000 ? compact.format(n) : format(n)),
      );
    const marks: Child[] = [];
    const grid: Child[] = [];
    const targets: Array<{ row: Series; point: Point; x: number; y: number }> =
      [];
    const target = (row: Series, point: Point, px: number, py: number) => {
      targets.push({ row, point, x: px, y: py });
      return {
        onPointerEnter: () => choose(row, point, labels),
        onClick: (event: MouseEvent) => {
          event.stopPropagation();
          choose(row, point, labels);
          props.onSelect?.(local.active!);
        },
      };
    };
    const title = (row: Series, p: Point) => (
      <title>
        {`${labels[p.index]} · ${row.label || "Value"}: ${format(p.y)}`}
      </title>
    );
    if (axes) {
      scale.ticks.forEach((tick, i) => {
        const pos = horizontal ? vx(tick) : y(tick);
        if (props.grid !== false && valueAxis.grid?.display !== false) {
          grid.push(
            <path
              class={tick === 0 ? "zero" : ""}
              d={
                horizontal
                  ? `M${pos},${top}V${bottom}`
                  : `M${left},${pos}H${right}`
              }
            />,
          );
        }
        if (
          (horizontal ? xShown : yShown) &&
          valueAxis.ticks?.display !== false
        ) {
          grid.push(
            <text
              x={horizontal ? pos : left - 9}
              y={horizontal ? bottom + 19 : pos + 4}
              text-anchor={horizontal ? "middle" : "end"}
            >
              {short(text(tick, i), 12)}
            </text>,
          );
        }
      });
      const labelAxis = horizontal ? yAxis : xAxis;
      const limit = Math.max(
        2,
        Math.floor((horizontal ? ph : pw) / (horizontal ? 28 : 75)),
      );
      const every = Math.max(1, Math.ceil(labels.length / limit));
      if (
        (horizontal ? yShown : xShown) &&
        labelAxis.ticks?.display !== false
      ) {
        if (numericX)
          xScale.ticks.forEach((tick, i) =>
            grid.push(
              <text
                x={left + xScale.at(tick) * pw}
                y={bottom + 19}
                text-anchor="middle"
              >
                {short(text(tick, i, xAxis), 10)}
              </text>,
            ),
          );
        else
          labels.forEach((label, i) => {
            if (i % every) return;
            grid.push(
              <text
                x={
                  horizontal
                    ? left - 9
                    : left + ((i + 0.5) / labels.length) * pw
                }
                y={
                  horizontal
                    ? top + ((i + 0.5) / labels.length) * ph + 4
                    : bottom + 19
                }
                text-anchor={horizontal ? "end" : "middle"}
              >
                <title>{label}</title>
                {short(label, horizontal ? 12 : 10)}
              </text>,
            );
          });
      }
      if (xShown && xAxis.title?.display && xAxis.title.text) {
        grid.push(
          <text x={(left + right) / 2} y={height - 4} text-anchor="middle">
            {xAxis.title.text}
          </text>,
        );
      }
      if (yShown && yAxis.title?.display && yAxis.title.text) {
        grid.push(
          <text
            transform={`translate(13 ${(top + bottom) / 2}) rotate(-90)`}
            text-anchor="middle"
          >
            {yAxis.title.text}
          </text>,
        );
      }
    }
    if (radial) {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2 - 20;
      const cut = opts.cutout ?? "66%";
      const inner = ["donut", "doughnut"].includes(type)
        ? clamp(
            (typeof cut === "string"
              ? (parseFloat(cut) / 100) * radius
              : cut) || 0,
            0,
            radius * 0.95,
          )
        : 0;
      const maximum = sliced.reduce((n, p) => Math.max(n, p.y), 1);
      let angle = -Math.PI / 2;
      marks.push(<circle cx={cx} cy={cy} r={radius} fill="var(--lui-soft)" />);
      if (total > 0)
        sliced.forEach((p) => {
          const sweep =
            type === "polarArea"
              ? (Math.PI * 2) / sliced.length
              : (p.y / total) * Math.PI * 2;
          const row = visible[0]!;
          const color = Array.isArray(row.backgroundColor)
            ? row.backgroundColor[p.index % row.backgroundColor.length]
            : palette[p.index % palette.length];
          const r =
            type === "polarArea" ? radius * Math.sqrt(p.y / maximum) : radius;
          marks.push(
            <path
              class="slice"
              fill={color}
              d={arcPath(cx, cy, r, inner, angle, sweep)}
              stroke="var(--lui-bg)"
              stroke-width="2"
              {...target(
                row,
                p,
                cx + Math.cos(angle + sweep / 2) * r * 0.7,
                cy + Math.sin(angle + sweep / 2) * r * 0.7,
              )}
            >
              {title(row, p)}
            </path>,
          );
          angle += sweep;
        });
      if (inner > 0) {
        marks.push(<circle cx={cx} cy={cy} r={inner} fill="var(--lui-bg)" />);
        marks.push(
          <text class="total" x={cx} y={cy + 6} text-anchor="middle">
            {format(total)}
          </text>,
        );
      }
    } else if (radar) {
      const n = Math.max(3, labels.length);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width - 110, height - 70) / 2;
      const scale = scaleOf(
        all.map((p) => Math.max(0, p.y)),
        { ...opts.scales?.r, min: 0 },
      );
      const pointAt = (i: number, ratio: number) => {
        const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
        return {
          x: cx + Math.cos(angle) * radius * ratio,
          y: cy + Math.sin(angle) * radius * ratio,
        };
      };
      for (let ring = 1; ring <= 4; ring++) {
        grid.push(
          <polygon
            points={Array.from({ length: n }, (_, i) => {
              const p = pointAt(i, ring / 4);
              return `${p.x},${p.y}`;
            }).join(" ")}
          />,
        );
      }
      labels.forEach((label, i) => {
        const p = pointAt(i, 1.18);
        const end = pointAt(i, 1);
        grid.push(<path d={`M${cx},${cy}L${end.x},${end.y}`} />);
        grid.push(
          <text x={p.x} y={p.y + 4} text-anchor="middle">
            <title>{label}</title>
            {short(label, 12)}
          </text>,
        );
      });
      visible.forEach((row) => {
        const points = row.points.map(
          (p) =>
            p && {
              ...p,
              ...pointAt(p.index, clamp(scale.at(Math.max(0, p.y)), 0, 1)),
            },
        );
        if (points.length === n && points.every(Boolean)) {
          marks.push(
            <polygon
              class="radar-area"
              fill={row.color}
              stroke={row.color}
              points={points.map((p) => `${p!.x},${p!.y}`).join(" ")}
            />,
          );
        }
        row.points.forEach((p) => {
          if (!p) return;
          const at = pointAt(p.index, clamp(scale.at(Math.max(0, p.y)), 0, 1));
          marks.push(
            <circle
              cx={at.x}
              cy={at.y}
              r="4"
              fill={row.color}
              {...target(row, p, at.x, at.y)}
            >
              {title(row, p)}
            </circle>,
          );
        });
      });
    } else {
      visible.forEach((row) => {
        const kind = row.type || (type === "mixed" ? "bar" : type);
        const bars = barRows.includes(row);
        const rowAt = barRows.indexOf(row);
        if (bars)
          row.points.forEach((p) => {
            if (!p) return;
            const interval =
              (horizontal ? ph : pw) / Math.max(1, labels.length);
            const band = interval * 0.75;
            const size = band / (stacked ? 1 : barRows.length);
            const offset = -band / 2 + (stacked ? 0 : rowAt * size);
            const pair = stacked ? stacks[rowAt]?.[p.index] : undefined;
            const start = pair?.start ?? 0;
            const end = pair?.end ?? p.y;
            const a = horizontal ? vx(start) : y(start);
            const b = horizontal ? vx(end) : y(end);
            const px = horizontal ? Math.min(a, b) : x(p) + offset;
            const py = horizontal ? cy(p) + offset : Math.min(a, b);
            marks.push(
              <rect
                class="bar"
                x={px}
                y={py}
                width={horizontal ? Math.abs(a - b) : Math.max(0.1, size - 1)}
                height={horizontal ? Math.max(0.1, size - 1) : Math.abs(a - b)}
                rx={stacked ? 0 : 3}
                fill={row.color}
                {...target(
                  row,
                  p,
                  horizontal ? b : x(p),
                  horizontal ? cy(p) : b,
                )}
              >
                {title(row, p)}
              </rect>,
            );
          });
        else if (!numeric) {
          segments(row.points, row.spanGaps).forEach((segment) => {
            const reduced = reducePoints(segment, props.maxPoints);
            const path = linePath(
              reduced.map((p) => ({ x: x(p), y: y(p.y) })),
              row.stepped,
              row.tension,
            );
            if (kind === "area" || row.fill) {
              marks.push(
                <path
                  class="area"
                  fill={row.color}
                  d={
                    `${path}L${x(segment.at(-1)!)},${y(0)}` +
                    `L${x(segment[0]!)},${y(0)}Z`
                  }
                />,
              );
            }
            marks.push(
              <path
                class="line"
                d={path}
                fill="none"
                stroke={row.color}
                stroke-width={row.borderWidth ?? 2}
                stroke-dasharray={row.borderDash?.join(" ")}
              />,
            );
          });
        }
        if (!bars)
          row.points.forEach((p) => {
            if (!p) return;
            const px = x(p);
            const py = y(p.y);
            const hit = target(row, p, px, py);
            const radius =
              type === "bubble"
                ? p.r
                : (row.pointRadius ??
                  (props.points === false || row.points.length > 150 ? 0 : 3));
            if (radius > 0 || numeric)
              marks.push(
                <circle
                  class="point"
                  cx={px}
                  cy={py}
                  r={numeric && type !== "bubble" ? 4 : radius}
                  fill={row.color}
                  {...hit}
                >
                  {title(row, p)}
                </circle>,
              );
          });
      });
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.isComposing || !targets.length) return;
      const current = targets.findIndex(
        (t) =>
          t.row.index === local.active?.datasetIndex &&
          t.point.index === local.active?.index,
      );
      let next: number;
      if (event.key === "Escape") {
        clear();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        if (current >= 0) {
          event.preventDefault();
          const t = targets[current]!;
          choose(t.row, t.point, labels);
          props.onSelect?.(local.active!);
        }
        return;
      }
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = targets.length - 1;
      else if (["ArrowRight", "ArrowDown"].includes(event.key)) {
        next = (current + 1) % targets.length;
      } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
        next = (current - 1 + targets.length) % targets.length;
      } else return;
      event.preventDefault();
      const t = targets[next]!;
      choose(t.row, t.point, labels);
    };
    const hover = (event: PointerEvent) => {
      if (radial || radar || !targets.length) return;
      const rect = (
        event.currentTarget as SVGSVGElement
      ).getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = ((event.clientX - rect.left) / rect.width) * width;
      const py = ((event.clientY - rect.top) / rect.height) * height;
      if (px < left || px > right || py < top || py > bottom) {
        clear();
        return;
      }
      let nearest = targets[0]!;
      let distance = Infinity;
      for (const t of targets) {
        const d =
          numeric || opts.interaction?.mode === "nearest"
            ? Math.hypot(t.x - px, t.y - py)
            : Math.abs(horizontal ? t.y - py : t.x - px);
        if (d < distance) {
          nearest = t;
          distance = d;
        }
      }
      if (
        opts.interaction?.intersect &&
        Math.hypot(nearest.x - px, nearest.y - py) >
          Math.max(8, nearest.point.r)
      ) {
        clear();
        return;
      }
      choose(nearest.row, nearest.point, labels);
    };
    const empty = props.loading || (radial ? total <= 0 : !all.length);
    return (
      <div class="lui-chart-stage" style={{ height: `${height}px` }}>
        {empty ? (
          <div class="lui-chart-empty" role="status">
            {props.loading
              ? "Loading chart…"
              : props.empty || "No data to display"}
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            tabindex="0"
            aria-label={
              props["aria-label"] ||
              props.ariaLabel ||
              props.label ||
              `${type} chart`
            }
            aria-describedby={`${id}-help`}
            onKeyDown={keyboard}
            onClick={() => {
              if (local.active) props.onSelect?.(local.active);
            }}
            onPointerMove={hover}
            onPointerLeave={clear}
            onBlur={clear}
          >
            <title>{props.label || `${type} chart`}</title>
            <defs>
              <clipPath id={`${id}-clip`}>
                <rect x={left} y={top} width={pw} height={ph} />
              </clipPath>
            </defs>
            <g class="lui-chart-grid">{grid}</g>
            <g clip-path={radial || radar ? undefined : `url(#${id}-clip)`}>
              {marks}
            </g>
            {live(() => {
              const a = local.active;
              const t = targets.find(
                (t) =>
                  t.row.index === a?.datasetIndex && t.point.index === a?.index,
              );
              return t ? (
                <circle
                  class="lui-chart-cursor"
                  cx={t.x}
                  cy={t.y}
                  r="6"
                  fill="none"
                  stroke={t.row.color}
                  stroke-width="2"
                />
              ) : null;
            })}
          </svg>
        )}
      </div>
    );
  });
  const legend = live(() => {
    const { rows, labels } = chartData(props);
    if (
      props.legend === false ||
      props.options?.plugins?.legend?.display === false
    ) {
      return null;
    }
    const radial = ["pie", "donut", "doughnut", "polarArea"].includes(
      props.type || "line",
    );
    const items = radial
      ? labels.map((label, i) => ({
          label,
          index: i,
          color: Array.isArray(rows[0]?.backgroundColor)
            ? rows[0].backgroundColor[i % rows[0].backgroundColor.length]
            : palette[i % palette.length],
          hidden: false,
        }))
      : rows.map((row) => ({
          label: row.label || `Series ${row.index + 1}`,
          index: row.index,
          color: row.color,
          hidden: Boolean(row.hidden),
        }));
    return (
      <div class="lui-chart-legend" aria-label="Chart legend">
        {items.map((item) => (
          <button
            type="button"
            disabled={item.hidden}
            aria-pressed={live(
              () => !item.hidden && !local.hidden.includes(item.index),
            )}
            onClick={() => {
              clear();
              local.hidden = local.hidden.includes(item.index)
                ? local.hidden.filter((i) => i !== item.index)
                : [...local.hidden, item.index];
            }}
          >
            <i style={{ background: item.color }} />
            {item.label}
          </button>
        ))}
      </div>
    );
  });
  return (
    <section
      class="lui-chart lui-chart-svg"
      id={props.id}
      style={props.style}
      ref={root}
      aria-busy={live(() => Boolean(props.loading))}
    >
      {props.label || props.value ? (
        <header>
          <span>{props.label}</span>
          <b>{props.value}</b>
        </header>
      ) : null}
      <span class="sr-only" id={`${id}-help`}>
        Use arrow keys to explore values. Enter selects a value. Escape clears
        it.
      </span>
      {props.options?.plugins?.legend?.position === "top" ? legend : null}
      {canvas}
      {props.options?.plugins?.legend?.position !== "top" ? legend : null}
      <div class="lui-chart-readout" role="status" aria-live="polite">
        {live(() => {
          const active = local.active;
          if (
            !active ||
            props.tooltip === false ||
            props.options?.plugins?.tooltip?.enabled === false
          )
            return null;
          const { rows } = chartData(props);
          const isPoint = ["scatter", "bubble"].includes(props.type || "line");
          const radial = ["pie", "donut", "doughnut", "polarArea"].includes(
            props.type || "line",
          );
          const nearest =
            isPoint || props.options?.interaction?.mode === "nearest";
          const visible = rows.filter(
            (row) =>
              !row.hidden &&
              !local.hidden.includes(radial ? active.index : row.index) &&
              (!nearest || row.index === active.datasetIndex),
          );
          return (
            <div class="lui-chart-tip">
              <b>{active.label}</b>
              {visible.map((row) => {
                const point = row.points[active.index];
                const color = radial
                  ? Array.isArray(row.backgroundColor)
                    ? row.backgroundColor[
                        active.index % row.backgroundColor.length
                      ]
                    : palette[active.index % palette.length]
                  : row.color;
                return point ? (
                  <span>
                    <i style={{ background: color }} />
                    {row.label || "Value"}
                    <strong>
                      {isPoint ? `${format(point.x)}, ` : ""}
                      {format(point.y)}
                    </strong>
                  </span>
                ) : null;
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
