/** @jsxImportSource @luon/act */
import { afterEach, expect, test } from "bun:test";
import { act, mount, state } from "@luon/act";
import { Window } from "happy-dom";
import { Chart, type ChartData, type ChartHandle } from "../src/index.ts";
import {
  arcPath,
  chartData,
  linePath,
  reducePoints,
  scaleOf,
  segments,
  stackOf,
  type ChartType,
} from "../src/chart-data.ts";

const window = new Window({ url: "http://localhost" });
Object.assign(globalThis, {
  window,
  document: window.document,
  Node: window.Node,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  SVGElement: window.SVGElement,
  Event: window.Event,
  KeyboardEvent: window.KeyboardEvent,
  PointerEvent: window.PointerEvent,
});
afterEach(() => document.body.replaceChildren());

test("uses shared nice scales and explicit bounds for real values", () => {
  const scale = scaleOf([-42, 12, 187]);
  expect(scale.min).toBeLessThanOrEqual(-42);
  expect(scale.max).toBeGreaterThanOrEqual(187);
  expect(scale.at(scale.min)).toBe(0);
  expect(scale.at(scale.max)).toBe(1);
  expect(scale.ticks).toContain(0);
  const fixed = scaleOf([20, 50], { min: 10, max: 60 });
  expect(fixed.at(35)).toBe(0.5);
  expect(fixed.min).toBe(10);
  expect(fixed.max).toBe(60);
  for (const values of [[], [0], [7, 7], [-8, -8], [0.0001, 0.0004]]) {
    const scale = scaleOf(values);
    expect(scale.max).toBeGreaterThan(scale.min);
    expect(scale.ticks.every(Number.isFinite)).toBeTrue();
  }
});

test("preserves gaps and numeric coordinates without inventing samples", () => {
  expect(chartData({}).rows[0]?.points).toEqual([]);
  const { rows } = chartData({
    values: [4, null, NaN, Infinity, { x: -4, y: 120 }, { x: 500, y: null }],
  });
  expect(rows[0]!.points.map((p) => p?.y ?? null)).toEqual([
    4,
    null,
    null,
    null,
    120,
    null,
  ]);
  expect(rows[0]!.points[4]?.x).toBe(-4);
  expect(segments(rows[0]!.points)).toHaveLength(2);
  expect(segments(rows[0]!.points, true)).toHaveLength(1);
});

test("stacks positive and negative values separately", () => {
  const { rows } = chartData({
    series: [
      { values: [10, -20, 5] },
      { values: [30, -10, -8] },
      { values: [-4, 7, 10] },
    ],
  });
  expect(stackOf(rows)).toEqual([
    [
      { start: 0, end: 10 },
      { start: 0, end: -20 },
      { start: 0, end: 5 },
    ],
    [
      { start: 10, end: 40 },
      { start: -20, end: -30 },
      { start: 0, end: -8 },
    ],
    [
      { start: 0, end: -4 },
      { start: 0, end: 7 },
      { start: 5, end: 15 },
    ],
  ]);
});

test("bounds dense paths while retaining original extrema and endpoints", () => {
  const points = Array.from({ length: 10000 }, (_, i) => ({
    x: i,
    y: i === 3981 ? 9000 : i === 6910 ? -9000 : Math.sin(i),
    index: i,
    r: 3,
  }));
  const reduced = reducePoints(points, 200);
  expect(reduced.length).toBeLessThanOrEqual(200);
  expect(reduced[0]).toBe(points[0]);
  expect(reduced.at(-1)).toBe(points.at(-1));
  expect(reduced).toContain(points[3981]!);
  expect(reduced).toContain(points[6910]!);
  expect(
    reduced.every((p, i) => !i || p.index > reduced[i - 1]!.index),
  ).toBeTrue();
});

test("uses bounded curve control points and complete circular arcs", () => {
  expect(
    linePath(
      [
        { x: 0, y: 10 },
        { x: 20, y: 50 },
      ],
      false,
      1,
    ),
  ).toBe("M0,10C10,10 10,50 20,50");
  expect(
    linePath(
      [
        { x: 0, y: 10 },
        { x: 20, y: 50 },
      ],
      true,
    ),
  ).toBe("M0,10H20V50");
  const full = arcPath(100, 100, 80, 40, 0, Math.PI * 2);
  expect(full.match(/A/g)).toHaveLength(4);
  expect(full).not.toMatch(/NaN|Infinity/);
});

test("renders every chart family locally with finite SVG geometry", () => {
  const types: ChartType[] = [
    "line",
    "area",
    "bar",
    "horizontal",
    "stacked",
    "mixed",
    "pie",
    "donut",
    "doughnut",
    "radar",
    "polarArea",
    "scatter",
    "bubble",
  ];
  for (const type of types) {
    const close = mount(
      <Chart
        type={type}
        data={{
          labels: ["A", "B", "C", "D", "E", "F"],
          datasets: [{ label: "Sales", data: [20, 30, 50, 25, 60, 42] }],
        }}
      />,
      document.body,
    );
    expect(document.querySelector("svg"), type).toBeTruthy();
    expect(document.querySelector("canvas"), type).toBeNull();
    expect(document.querySelector(".lui-chart-empty"), type).toBeNull();
    for (const node of document.querySelectorAll("svg *")) {
      for (const name of ["d", "x", "y", "width", "height", "r", "points"]) {
        expect(node.getAttribute(name) || "", `${type} ${name}`).not.toMatch(
          /NaN|Infinity/,
        );
      }
    }
    close();
  }
});

test("normalizes pie totals and never plots empty or negative-only slices", () => {
  let close = mount(
    <Chart type="pie" values={[200, 300, 500]} />,
    document.body,
  );
  expect(document.querySelectorAll(".slice")).toHaveLength(3);
  const path = document.querySelector(".slice")!.getAttribute("d")!;
  close();
  close = mount(<Chart type="pie" values={[20, 30, 50]} />, document.body);
  expect(document.querySelector(".slice")!.getAttribute("d")).toBe(path);
  close();
  close = mount(<Chart type="donut" values={[0, -4, null]} />, document.body);
  expect(document.body.textContent).toContain("No data to display");
  expect(document.querySelector(".slice")).toBeNull();
  close();
});

test("updates live data and supports legend, keyboard, tooltip and selection", () => {
  const source = state({
    data: {
      labels: ["Jan", "Feb"],
      datasets: [
        { label: "Revenue", data: [10, 20] },
        { label: "Costs", data: [4, 8] },
      ],
    } as ChartData,
  });
  const selected: unknown[] = [];
  const close = mount(
    <Chart
      type="line"
      data={act(() => source.data)}
      onSelect={(p) => selected.push(p)}
    />,
    document.body,
  );
  const key = (key: string) =>
    document
      .querySelector("svg")!
      .dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  key("Home");
  expect(document.querySelector(".lui-chart-tip")?.textContent).toContain(
    "JanRevenue10Costs4",
  );
  key("Enter");
  expect(selected).toHaveLength(1);
  key("Escape");
  expect(document.querySelector(".lui-chart-tip")).toBeNull();
  const legend = document.querySelector<HTMLButtonElement>(
    ".lui-chart-legend button",
  )!;
  legend.click();
  expect(legend.getAttribute("aria-pressed")).toBe("false");
  expect(document.querySelectorAll(".line")).toHaveLength(1);
  legend.click();
  source.data = {
    labels: ["Mar"],
    datasets: [{ label: "Revenue", data: [75] }],
  };
  expect(document.querySelectorAll(".line")).toHaveLength(1);
  key("Home");
  expect(document.querySelector(".lui-chart-tip")?.textContent).toContain(
    "MarRevenue75",
  );
  close();
});

test("exports the rendered SVG and cleans its resize observer", async () => {
  let disconnected = 0;
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {
      disconnected++;
    }
  } as any;
  let chart: ChartHandle | undefined;
  const close = mount(
    <Chart values={[1, 2]} onReady={(value) => (chart = value)} />,
    document.body,
  );
  await Promise.resolve();
  expect(chart?.toSVG()).toContain("<svg");
  close();
  expect(disconnected).toBe(1);
  globalThis.ResizeObserver = original;
});
