/** @jsxImportSource @luon/act */
import { afterEach, expect, test } from "bun:test";
import { act, mount, state } from "@luon/act";
import { bindView } from "@luon/view";
import { Window } from "happy-dom";

import { cdnUrl } from "../src/loader.ts";
import { iconPath, loadIcon } from "../src/icon.tsx";

import {
  Accordion,
  Avatar,
  AvatarGroup,
  Banner,
  Button,
  Calendar,
  Card,
  Carousel,
  Chart,
  ChartSvg,
  Checkbox,
  CheckboxGroup,
  Chip,
  Collapsible,
  CommandPalette,
  ContextMenu,
  Draggable,
  DropdownMenu,
  Drawer,
  Editor,
  Empty,
  FileUpload,
  FormField,
  Icon,
  Input,
  InputNumber,
  InputRating,
  InputTags,
  Link,
  Listbox,
  Kbd,
  Marquee,
  Modal,
  NavigationMenu,
  Pagination,
  PinInput,
  Popover,
  Progress,
  ProgressGroup,
  ScrollArea,
  Select,
  SelectMenu,
  Separator,
  Slider,
  Sortable,
  Stepper,
  Switch,
  Table,
  Tabs,
  Textarea,
  Term,
  Toast,
  Tooltip,
  editorActive,
} from "../src/index.ts";
import {
  protectCodeHtml,
  protectTextHtml,
  protectTermsHtml,
  splitTerms,
  technicalTerms,
} from "../src/terms.ts";
import { protectCode } from "../src/translate.ts";
import { place } from "../src/util.ts";

const window = new Window({ url: "http://localhost" });
Object.assign(globalThis, {
  document: window.document,
  Element: window.Element,
  Event: window.Event,
  HTMLElement: window.HTMLElement,
  innerHeight: 800,
  innerWidth: 1200,
  HTMLInputElement: window.HTMLInputElement,
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  MutationObserver: window.MutationObserver,
  Node: window.Node,
  PointerEvent: window.PointerEvent,
  SVGElement: window.SVGElement,
  window,
});

afterEach(() => {
  document.body.replaceChildren();
  (document as any).elementFromPoint = undefined;
  globalThis.__LUON_CDN__ = undefined;
});

function box(top: number, height = 60): DOMRect {
  return {
    bottom: top + height,
    height,
    left: 0,
    right: 240,
    top,
    width: 240,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

test("moves Draggable with native pointer data", () => {
  const changes: Array<{ x: number; y: number }> = [];
  const close = mount(<Draggable
    onChange={(value) => changes.push(value)}
    threshold={0}
  ><span>Move me</span></Draggable>, document.body);
  const node = document.querySelector(".lui-draggable") as HTMLElement;
  node.setPointerCapture = () => {
    throw new window.DOMException("Pointer is inactive", "InvalidStateError");
  };
  node.releasePointerCapture = () => {
    throw new window.DOMException("Capture was released", "InvalidStateError");
  };
  node.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 10,
    clientY: 20,
    pointerId: 1,
  }));
  node.dispatchEvent(new PointerEvent("pointermove", {
    bubbles: true,
    clientX: 45,
    clientY: 72,
    pointerId: 1,
  }));
  expect(changes.at(-1)).toEqual({ x: 35, y: 52 });
  expect(node.classList.contains("lui-draggable-dragging")).toBeTrue();
  node.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    pointerId: 1,
  }));
  expect(node.classList.contains("lui-draggable-dragging")).toBeFalse();
  close();
});

test("cleans Draggable when a start callback replaces its View", () => {
  let close = () => {};
  close = mount(<Draggable
    onStart={() => close()}
    threshold={0}
  ><span>Move me</span></Draggable>, document.body);
  const node = document.querySelector(".lui-draggable") as HTMLElement;
  node.setPointerCapture = () => {};
  node.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 10,
    clientY: 20,
    pointerId: 11,
  }));
  expect(() => node.dispatchEvent(new PointerEvent("pointermove", {
    bubbles: true,
    clientX: 45,
    clientY: 72,
    pointerId: 11,
  }))).not.toThrow();
  expect(document.querySelector(".lui-draggable")).toBeNull();
});

test("shows a Sortable hint and commits the dropped order", () => {
  const changes: string[][] = [];
  const close = mount(<Sortable
    onChange={(value) => changes.push(value)}
    threshold={0}
    value={["Plan", "Build", "Review"]}
  >
    <div>Plan</div><div>Build</div><div>Review</div>
  </Sortable>, document.body);
  const node = document.querySelector(".lui-sortable") as HTMLElement;
  const items = [...node.children] as HTMLElement[];
  node.setPointerCapture = () => {
    throw new window.DOMException("Pointer is inactive", "InvalidStateError");
  };
  node.releasePointerCapture = () => {
    throw new window.DOMException("Capture was released", "InvalidStateError");
  };
  node.getBoundingClientRect = () => box(0, 300);
  items.forEach((item, index) => {
    item.getBoundingClientRect = () => box(index * 80);
  });
  (document as any).elementFromPoint = () => node;
  items[0]!.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 20,
    clientY: 20,
    isPrimary: true,
    pointerId: 2,
  }));
  node.dispatchEvent(new PointerEvent("pointermove", {
    bubbles: true,
    clientX: 30,
    clientY: 270,
    isPrimary: true,
    pointerId: 2,
  }));
  expect(document.querySelector(".lui-sortable-hint")).toBeTruthy();
  expect(document.querySelector(".lui-sortable-preview")).toBeTruthy();
  node.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    clientX: 30,
    clientY: 270,
    isPrimary: true,
    pointerId: 2,
  }));
  expect(changes.at(-1)).toEqual(["Build", "Review", "Plan"]);
  expect(document.querySelector(".lui-sortable-hint")).toBeNull();
  expect(document.querySelector(".lui-sortable-preview")).toBeNull();
  close();
});

test("cleans Sortable before a change callback replaces its View", () => {
  let close = () => {};
  close = mount(<Sortable
    onChange={() => close()}
    threshold={0}
    value={["Plan", "Build"]}
  ><div>Plan</div><div>Build</div></Sortable>, document.body);
  const node = document.querySelector(".lui-sortable") as HTMLElement;
  const items = [...node.children] as HTMLElement[];
  node.setPointerCapture = () => {};
  node.releasePointerCapture = () => {};
  node.getBoundingClientRect = () => box(0, 200);
  items.forEach((item, index) => {
    item.getBoundingClientRect = () => box(index * 80);
  });
  (document as any).elementFromPoint = () => node;
  items[0]!.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 20,
    clientY: 20,
    isPrimary: true,
    pointerId: 12,
  }));
  node.dispatchEvent(new PointerEvent("pointermove", {
    bubbles: true,
    clientX: 30,
    clientY: 180,
    isPrimary: true,
    pointerId: 12,
  }));
  expect(() => node.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    clientX: 30,
    clientY: 180,
    isPrimary: true,
    pointerId: 12,
  }))).not.toThrow();
  expect(document.querySelector(".lui-sortable-preview")).toBeNull();
});

test("moves Sortable data between lists in the same group", () => {
  const left: string[][] = [];
  const right: string[][] = [];
  const close = mount(<div><Sortable
    group="tasks"
    onChange={(value) => left.push(value)}
    threshold={0}
    value={["Plan", "Build"]}
  ><div>Plan</div><div>Build</div></Sortable><Sortable
    group="tasks"
    onChange={(value) => right.push(value)}
    threshold={0}
    value={["Review"]}
  ><div>Review</div></Sortable></div>, document.body);
  const lists = [...document.querySelectorAll(
    ".lui-sortable",
  )] as HTMLElement[];
  const source = lists[0]!;
  const target = lists[1]!;
  source.setPointerCapture = () => {};
  source.releasePointerCapture = () => {};
  source.getBoundingClientRect = () => box(0, 180);
  target.getBoundingClientRect = () => box(200, 180);
  [...source.children].forEach((item, index) => {
    (item as HTMLElement).getBoundingClientRect = () => box(index * 70);
  });
  [...target.children].forEach((item) => {
    (item as HTMLElement).getBoundingClientRect = () => box(200);
  });
  (document as any).elementFromPoint = () => target;
  source.children[1]!.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 20,
    clientY: 90,
    isPrimary: true,
    pointerId: 3,
  }));
  source.dispatchEvent(new PointerEvent("pointermove", {
    bubbles: true,
    clientX: 30,
    clientY: 330,
    isPrimary: true,
    pointerId: 3,
  }));
  source.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    clientX: 30,
    clientY: 330,
    isPrimary: true,
    pointerId: 3,
  }));
  expect(left.at(-1)).toEqual(["Plan"]);
  expect(right.at(-1)).toEqual(["Review", "Build"]);
  close();
});

test("renders native elements without a React tree", () => {
  const close = mount(<Card title="Native">
    <Button color="success" label="Start" />
    <Input value="Luon" />
  </Card>, document.body);

  expect(document.querySelector("section")?.textContent)
    .toContain("Native");
  expect(document.querySelector("button")?.textContent).toBe("Start");
  expect(document.querySelector("input")?.value).toBe("Luon");
  close();
});

test("keeps loading button labels at full contrast", () => {
  const close = mount(<Button loading label="Deploying" />, document.body);
  const button = document.querySelector("button") as HTMLButtonElement;

  expect(button.disabled).toBeTrue();
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.getAttribute("class")).not.toContain("disabled:opacity-50");
  expect(button.getAttribute("class")).not.toContain("opacity-50");
  expect(button.textContent).toContain("Deploying");
  expect(button.querySelector("[data-icon=loader]")).toBeTruthy();
  close();
});

test("protects technical terms and dynamic code from translation", () => {
  const close = mount(<Term>@luon/act</Term>, document.body);
  const term = document.querySelector("span")!;
  expect(term.className).toBe("notranslate");
  expect(term.getAttribute("translate")).toBe("no");
  expect(technicalTerms).toContain("@luon/act");
  const terms: readonly string[] = technicalTerms;
  for (const term of [
    "@luon/act",
    "@luon/acts",
    "@luon/cli",
    "@luon/network",
    "@luon/provider",
    "@luon/rule",
    "@luon/runner",
    "@luon/runtime",
    "@luon/style",
    "@luon/ui",
    "@luon/view",
    "@luon/worker",
    "Network",
    "Rule",
    "Style",
    "View",
  ]) {
    expect(terms).toContain(term);
  }
  expect(splitTerms("Luon View and Rule").filter((part) => part.protected)
    .map((part) => part.value)).toEqual(["Luon View", "Rule"]);

  const code = document.createElement("code");
  code.textContent = "bun run";
  document.body.append(code);
  const editor = document.createElement("div");
  editor.className = "cm-editor";
  document.body.append(editor);
  const stop = protectCode(document.body);
  expect(code.className).toBe("notranslate");
  expect(code.getAttribute("translate")).toBe("no");
  expect(editor.classList.contains("notranslate")).toBeTrue();
  expect(editor.getAttribute("translate")).toBe("no");
  expect(protectCodeHtml("<pre><code>bun run</code></pre>"))
    .toContain('<code class="notranslate" translate="no">');
  expect(protectTermsHtml("Luon View uses Act."))
    .toContain('translate="no">Luon View</span> uses');
  const html = protectTextHtml(
    '<title>Luon API</title><p>Luon API</p><code>Luon API</code>'
      + '<script>const API = 1;</script>',
  );
  expect(html).toContain('<title>Luon API</title>');
  expect(html).toContain('translate="no">Luon</span>');
  expect(html).toContain('<code>Luon API</code>');
  expect(html).toContain('<script>const API = 1;</script>');
  stop();
  close();
});

test("updates uncontrolled form state and emits Luon values", () => {
  const changes: unknown[] = [];
  const close = mount(<>
    <Input
      defaultValue="First"
      onChange={(value: unknown) => changes.push(value)}
    />
    <Checkbox
      label="Ready"
      onChange={(value: unknown) => changes.push(value)}
    />
    <Switch
      label="Live"
      onChange={(value: unknown) => changes.push(value)}
    />
  </>, document.body);
  const input = document.querySelector(
    "input[type=text]",
  ) as HTMLInputElement;
  input.value = "Second";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  const check = document.querySelector(
    "input[type=checkbox]",
  ) as HTMLInputElement;
  check.checked = true;
  check.dispatchEvent(new Event("change", { bubbles: true }));
  const toggle = document.querySelector(
    "[role=switch]",
  ) as HTMLButtonElement;
  toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  expect(changes).toEqual(["Second", true, true]);
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  close();
});

test("keeps Input focused while a component bind updates", () => {
  const data = state({ value: "" });
  const bind = bindView(
    () => data.value,
    (value) => data.value = value,
    { tag: "component" },
  );
  const close = mount(<Input {...bind} />, document.body);
  const input = document.querySelector("input") as HTMLInputElement;
  input.focus();

  input.value = "L";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.value = "Luon";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  expect(data.value).toBe("Luon");
  expect(document.querySelector("input")).toBe(input);
  expect(document.activeElement).toBe(input);
  close();
});

test("accepts reactive model values directly from Act", () => {
  const data = state({ done: false, value: 20 });
  const close = mount(<>
    <Checkbox checked={act(() => data.done)} label="Done" />
    <Progress value={act(() => data.value)} label="Build" />
  </>, document.body);
  const input = document.querySelector("input") as HTMLInputElement;
  const bar = document.querySelector(
    "[role=progressbar] > i",
  ) as HTMLElement;

  expect(input.checked).toBeFalse();
  expect(bar.style.width).toBe("20%");
  data.done = true;
  data.value = 75;
  expect(input.checked).toBeTrue();
  expect(bar.style.width).toBe("75%");
  close();
});

test("updates password controls without rerendering Input", () => {
  const close = mount(<Input type="password" value="secret" />, document.body);
  const input = document.querySelector("input") as HTMLInputElement;
  const button = document.querySelector("button") as HTMLButtonElement;

  expect(input.type).toBe("password");
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(input.type).toBe("text");
  expect(button.getAttribute("aria-label")).toBe("Hide password");
  close();
});

test("renders compatibility details with native DOM", () => {
  const close = mount(<>
    <Input trailingIcon="i-lucide-check" value="Ready" />
    <Banner
      actions={[{ label: "Update", variant: "outline" }]}
      title="New version"
    />
    <Avatar status="online" text="LU" />
    <Progress
      circular
      color="secondary"
      label="Production build"
      value={72}
    />
    <Progress indeterminate label="Sync" status="Connecting" />
  </>, document.body);

  expect(document.querySelector(".lui-input [data-icon=check]")).toBeTruthy();
  expect(document.querySelector(".lui-banner button")?.textContent)
    .toBe("Update");
  expect(document.querySelector(".lui-avatar i")).toBeTruthy();
  const ring = document.querySelector(".lui-progress-ring") as HTMLElement;
  expect(ring.style.background).toContain("72%");
  expect(ring.textContent).toBe("72%");
  expect(ring.textContent).not.toContain("Production build");
  expect(document.querySelector(".lui-progress-label")?.textContent)
    .toBe("Production build");
  const pending = document.querySelectorAll("[role=progressbar]")[1]!;
  expect(pending.hasAttribute("aria-valuenow")).toBeFalse();
  expect(pending.parentElement?.textContent).toContain("Connecting");
  close();
});

test("embeds used Lucide paths without an icon runtime", () => {
  const close = mount(<>
    <Icon name="i-lucide-circle-check" size={32} />
    <Icon name="i-lucide-triangle-alert" />
    <Icon name="i-lucide-align-center" />
    <Icon name="i-lucide-align-justify" />
    <Icon name="i-lucide-align-right" />
    <Icon name="i-lucide-log-in" />
    <Icon name="i-lucide-megaphone" />
  </>, document.body);
  const icons = document.querySelectorAll(".lui-icon");

  expect(icons[0]?.querySelectorAll("circle, path")).toHaveLength(2);
  expect(icons[0]?.getAttribute("width")).toBe("32");
  expect(icons[1]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[2]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[3]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[4]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[5]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[6]?.querySelectorAll("path")).toHaveLength(3);
  close();
});

test("embeds marketplace template icons from Lucide", () => {
  const close = mount(<>
    <Icon name="i-lucide-shopping-basket" />
    <Icon name="i-lucide-heart" />
    <Icon name="i-lucide-camera" />
    <Icon name="i-lucide-message-circle" />
  </>, document.body);
  const icons = document.querySelectorAll(".lui-icon");

  expect(icons[0]?.querySelectorAll("path")).toHaveLength(7);
  expect(icons[1]?.querySelectorAll("path")).toHaveLength(1);
  expect(icons[2]?.querySelectorAll("path, circle")).toHaveLength(2);
  expect(icons[3]?.querySelectorAll("path")).toHaveLength(1);
  close();
});

test("embeds sticky board template icons from Lucide", () => {
  const close = mount(<>
    <Icon name="i-lucide-grip-horizontal" />
    <Icon name="i-lucide-mouse-pointer-2" />
    <Icon name="i-lucide-pin" />
    <Icon name="i-lucide-rotate-ccw" />
    <Icon name="i-lucide-sticky-note" />
  </>, document.body);
  const icons = document.querySelectorAll(".lui-icon");

  expect(icons[0]?.querySelectorAll("circle")).toHaveLength(6);
  expect(icons[1]?.querySelectorAll("path")).toHaveLength(1);
  expect(icons[2]?.querySelectorAll("path")).toHaveLength(2);
  expect(icons[3]?.querySelectorAll("path")).toHaveLength(2);
  expect(icons[4]?.querySelectorAll("path")).toHaveLength(2);
  close();
});

test("embeds schedule calendar template icons from Lucide", () => {
  const close = mount(<>
    <Icon name="i-lucide-blocks" />
    <Icon name="i-lucide-calendar-check-2" />
    <Icon name="i-lucide-calendar-days" />
    <Icon name="i-lucide-calendar-plus" />
    <Icon name="i-lucide-save" />
    <Icon name="i-lucide-type" />
  </>, document.body);
  const icons = document.querySelectorAll(".lui-icon");

  expect(icons[0]?.querySelectorAll("path, rect")).toHaveLength(2);
  expect(icons[1]?.querySelectorAll("path")).toHaveLength(11);
  expect(icons[2]?.querySelectorAll("path, rect")).toHaveLength(10);
  expect(icons[3]?.querySelectorAll("path")).toHaveLength(6);
  expect(icons[4]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[5]?.querySelectorAll("path")).toHaveLength(3);
  close();
});

test("embeds inventory template icons from Lucide", () => {
  const close = mount(<>
    <Icon name="i-lucide-arrow-down" />
    <Icon name="i-lucide-database-zap" />
    <Icon name="i-lucide-gift" />
    <Icon name="i-lucide-package-check" />
    <Icon name="i-lucide-server" />
    <Icon name="i-lucide-shopping-bag" />
    <Icon name="i-lucide-table-properties" />
    <Icon name="i-lucide-truck" />
  </>, document.body);
  const icons = document.querySelectorAll(".lui-icon");

  expect(icons[0]?.querySelectorAll("path")).toHaveLength(2);
  expect(icons[1]?.querySelectorAll("ellipse, path")).toHaveLength(5);
  expect(icons[2]?.querySelectorAll("path, rect")).toHaveLength(4);
  expect(icons[3]?.querySelectorAll("path")).toHaveLength(5);
  expect(icons[4]?.querySelectorAll("line, rect")).toHaveLength(4);
  expect(icons[5]?.querySelectorAll("path")).toHaveLength(3);
  expect(icons[6]?.querySelectorAll("path, rect")).toHaveLength(4);
  expect(icons[7]?.querySelectorAll("circle, path")).toHaveLength(5);
  close();
});

test("loads an unbundled Lucide icon from the CDN path", async () => {
  const paths: string[] = [];
  const nodes = await loadIcon("cdn-test-icon", async (path) => {
    paths.push(path);
    return { default: [["path", { d: "M2 12h20" }]] as any };
  });

  expect(paths).toEqual(["/ui/v3/icons/cdn-test-icon.mjs"]);
  expect(nodes).toHaveLength(1);
  expect(iconPath("../circle")).toBeUndefined();

  const close = mount(<Icon name="i-lucide-cdn-test-icon" />, document.body);
  expect(document.querySelector("[data-icon=cdn-test-icon] path"))
    .toBeTruthy();
  close();
});

test("provides editor controls before its lazy engine is ready", () => {
  const close = mount(<Editor value="<p>Luon</p>" />, document.body);
  const buttons = document.querySelectorAll(".lui-editor-tools button");

  expect(buttons).toHaveLength(9);
  expect(buttons[0]?.getAttribute("aria-label")).toBe("Undo");
  expect((buttons[0] as HTMLButtonElement).disabled).toBeTrue();
  close();
});

test("uses native select and table with accessible accordion regions", () => {
  const close = mount(<>
    <Select items={["One", "Two"]} placeholder="Pick" />
    <Select items={["One", "Two"]} multiple />
    <Accordion items={[{ label: "About", content: "Act" }]} />
    <Table rows={[{ id: 1, name: "Luon" }]} />
  </>, document.body);

  expect(document.querySelectorAll("option")).toHaveLength(2);
  const select = document.querySelector("select") as HTMLSelectElement;
  const trigger = document.querySelector(".lui-select-menu > button");
  const arrow = trigger?.querySelector(".lui-icon");
  expect(select.multiple).toBeTrue();
  expect(trigger?.textContent).toContain("Pick");
  expect(arrow?.getAttribute("data-icon")).toBe("chevron-down");
  expect(arrow?.getAttribute("class")).not.toContain("mr-1");
  expect(trigger?.getAttribute("class")).toContain("px-3");
  expect(document.querySelector("[role=region]")?.textContent)
    .toContain("Act");
  expect(document.querySelector(".lui-table-wrap")?.getAttribute("class"))
    .toContain("border border-[var(--lui-line)]");
  expect(document.querySelector("table")?.textContent).toContain("Luon");
  expect([...document.querySelectorAll("th")].map((node) => node.textContent))
    .toEqual(["Id", "Name"]);
  close();
});

test("places select menus beside the trigger without covering it", () => {
  const menu = document.createElement("div");
  const trigger = document.createElement("button");
  menu.style.bottom = "0px";
  menu.style.right = "0px";
  trigger.getBoundingClientRect = () => ({
    bottom: 340,
    height: 40,
    left: 100,
    right: 300,
    top: 300,
    width: 200,
    x: 100,
    y: 300,
    toJSON: () => ({}),
  });
  Object.defineProperty(menu, "offsetWidth", { value: 200 });
  Object.defineProperty(menu, "offsetHeight", { value: 120 });
  Object.defineProperty(menu, "scrollHeight", { value: 600 });

  place(menu, trigger, "start", 200);

  expect(menu.style.top).toBe("346px");
  expect(menu.style.bottom).toBe("auto");
  expect(menu.style.height).toBe("auto");
  expect(menu.style.maxHeight).toBe("446px");
  expect(menu.style.overflowY).toBe("");
  expect(menu.style.right).toBe("auto");
});

test("places floating content on an explicit side", () => {
  const menu = document.createElement("div");
  const trigger = document.createElement("button");
  trigger.getBoundingClientRect = () => ({
    bottom: 340,
    height: 40,
    left: 100,
    right: 300,
    top: 300,
    width: 200,
    x: 100,
    y: 300,
    toJSON: () => ({}),
  });
  Object.defineProperty(menu, "offsetWidth", { value: 160 });
  Object.defineProperty(menu, "scrollHeight", { value: 80 });

  place(menu, trigger, "end", 160, "right");

  expect(menu.style.left).toBe("306px");
  expect(menu.style.top).toBe("260px");
  expect(menu.dataset.side).toBe("right");
});

test("uses table title columns as visible headers", () => {
  const close = mount(<Table
    columns={[{ key: "member", title: "Member" }]}
    rows={[{ member: "Aria Kim" }]}
  />, document.body);

  expect(document.querySelector("th")?.textContent).toBe("Member");
  expect(document.querySelector("td")?.textContent).toBe("Aria Kim");
  close();
});

test("keeps dropdown arrows away from the right edge", () => {
  const close = mount(<>
    <Button trailingIcon="chevron-down">More</Button>
    <SelectMenu items={["One", "Two"]} label="Choose" />
    <DropdownMenu items={[{ label: "Edit", value: "edit" }]} label="Actions" />
    <Accordion items={[{ label: "About", content: "Act" }]} />
    <Calendar caption="dropdown" defaultMonth={new Date(2026, 7, 1)} />
  </>, document.body);

  const button = document.querySelector(
    ".lui-button [data-icon=chevron-down]",
  );
  const selectMenu = document.querySelector(
    ".lui-select-menu > button [data-icon=chevron-down]",
  );
  const menu = document.querySelector(
    "[popovertarget^=lui-menu-] [data-icon=chevron-down]",
  );
  const accordion = document.querySelector(
    ".lui-accordion button [data-icon=chevron-down]",
  );
  const calendar = document.querySelectorAll(
    ".lui-calendar__caption [data-icon=chevron-down]",
  );

  expect(button?.getAttribute("class")).toContain("mr-1");
  expect(selectMenu?.getAttribute("class")).not.toContain("mr-1");
  expect(selectMenu?.closest("button")?.getAttribute("class"))
    .toContain("px-3");
  expect(menu?.getAttribute("class")).toContain("mr-1");
  expect(accordion?.parentElement?.getAttribute("class")).toContain("mr-1");
  expect(calendar).toHaveLength(2);
  expect([...calendar].every((icon) => (
    icon.getAttribute("class")?.includes("right-3")
  ))).toBeTrue();
  close();
});

test("applies link, tabs and accordion compatibility variants", () => {
  const close = mount(<>
    <Link to="#docs" variant="button">Docs</Link>
    <Tabs
      defaultValue="one"
      items={[{ content: "Panel", label: "One", value: "one" }]}
      variant="panel"
    />
    <Accordion
      items={[{ content: "Body", label: "About", value: "about" }]}
      variant="plain"
    />
  </>, document.body);

  expect(document.querySelector(".lui-link")?.className)
    .toContain("border-[var(--lui-line)]");
  expect(document.querySelector(".lui-tabs-panel")?.className)
    .toContain("min-h-28");
  expect(document.querySelector(".lui-accordion")?.className)
    .toContain("border-x-0");
  close();
});

test("keeps multiple select values and slider marks", () => {
  const close = mount(<>
    <Select
      defaultValue={["design", "ship"]}
      items={["design", "build", "ship"]}
      multiple
    />
    <Slider color="success" marks={[0, 50, 100]} value={50} />
  </>, document.body);
  const select = document.querySelector("select") as HTMLSelectElement;
  const range = document.querySelector("input[type=range]")!;

  expect([...select.selectedOptions].map((item) => item.value))
    .toEqual(["design", "ship"]);
  expect(select.closest(".lui-select-wrap")).toBeNull();
  expect(document.querySelectorAll("datalist option")).toHaveLength(3);
  expect(range.className).toContain("--lui-success");
  close();
});

test("controls single and multiple accordion values", () => {
  const single: unknown[] = [];
  const multiple: unknown[] = [];
  const items = [
    { label: "Alpha", value: "a", content: "A" },
    { label: "Beta", value: "b", content: "B" },
  ];
  const close = mount(<>
    <Accordion
      defaultValue="b"
      items={items}
      onChange={(value: unknown) => single.push(value)}
    />
    <Accordion
      defaultValue={["a"]}
      items={items}
      multiple
      onChange={(value: unknown) => multiple.push(value)}
    />
  </>, document.body);
  const accordions = [...document.querySelectorAll(".lui-accordion")];
  const firstButtons = accordions[0]!.querySelectorAll("button");
  const secondButtons = accordions[1]!.querySelectorAll("button");
  const firstPanels = accordions[0]!.querySelectorAll("[role=region]");

  expect(firstButtons[1]?.getAttribute("aria-expanded")).toBe("true");
  expect(secondButtons[0]?.getAttribute("aria-expanded")).toBe("true");
  firstButtons[1]?.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  secondButtons[1]?.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(firstButtons[1]?.getAttribute("aria-expanded")).toBe("false");
  expect(secondButtons[0]?.getAttribute("aria-expanded")).toBe("true");
  expect(secondButtons[1]?.getAttribute("aria-expanded")).toBe("true");
  expect(firstPanels[1]?.className).toContain("grid-rows-[0fr]");
  expect(single).toEqual([undefined]);
  expect(multiple).toEqual([["a", "b"]]);
  close();
});

test("switches tabs with click and keyboard navigation", () => {
  const close = mount(<Tabs items={[
    { label: "First", value: "first", content: "Alpha" },
    { label: "Second", value: "second", content: "Beta" },
  ]} />, document.body);
  const tabs = [
    ...document.querySelectorAll("[role=tab]"),
  ] as HTMLButtonElement[];

  expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
  tabs[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
  expect(tabs[0]?.tabIndex).toBe(-1);
  expect(tabs[1]?.tabIndex).toBe(0);
  expect(document.querySelector("[role=tabpanel]")?.textContent).toBe("Beta");
  tabs[1]?.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true,
    key: "ArrowLeft",
  }));
  expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
  close();
});

test("connects panel tabs to a responsive surface", () => {
  const close = mount(<Tabs
    defaultValue="runtime"
    items={[
      {
        badge: 8,
        content: "Runtime panel",
        icon: "zap",
        label: "Runtime",
        value: "runtime",
      },
      { content: "Network panel", label: "Network", value: "network" },
    ]}
    maxWidth={180}
    variant="panel"
  />, document.body);
  const nav = document.querySelector("[role=tablist]") as HTMLElement;
  const tab = document.querySelector("[role=tab]") as HTMLElement;
  const panel = document.querySelector("[role=tabpanel]") as HTMLElement;
  const root = document.querySelector(".lui-tabs") as HTMLElement;

  expect(root.className).toContain("gap-0");
  expect(root.className).not.toContain("gap-3");
  expect(nav.className).toContain("overflow-x-auto");
  expect(nav.className).toContain("-mb-px");
  expect(nav.className).toContain("px-4");
  expect(tab.style.maxWidth).toBe("180px");
  expect(tab.className).toContain("bg-[var(--lui-bg)]");
  expect(tab.className).toContain("--luon-tabs-active-text");
  expect(panel.textContent).toBe("Runtime panel");
  expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
  close();
});

test("updates pagination and stepper state", () => {
  const pages: number[] = [];
  const close = mount(<>
    <Pagination
      defaultPage={5}
      itemsPerPage={10}
      onPageChange={(page: number) => pages.push(page)}
      showEdges
      total={100}
    />
    <Stepper items={["Plan", "Build", "Ship"]} />
  </>, document.body);
  const next = document.querySelector(
    "[aria-label='Next page']",
  ) as HTMLButtonElement;
  next.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const steps = [
    ...document.querySelectorAll(".lui-stepper button"),
  ] as HTMLButtonElement[];
  steps[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  expect(pages).toEqual([6]);
  expect(document.querySelector("[aria-current=page]")?.textContent).toBe("6");
  expect(steps[1]?.getAttribute("aria-current")).toBe("step");
  close();
});

test("keeps a useful page window with no requested siblings", () => {
  const close = mount(
    <Pagination siblingCount={0} total={100} />,
    document.body,
  );
  const pages = [...document.querySelectorAll(".lui-pagination button")]
    .map((button) => button.textContent)
    .filter(Boolean);

  expect(pages).toEqual(["1", "2", "3", "4", "5"]);
  close();
});

test("opens and closes a native dialog", async () => {
  const close = mount(
    <Modal label="Open modal" title="Native dialog">Body</Modal>,
    document.body,
  );
  const trigger = document.querySelector("button") as HTMLButtonElement;
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await Promise.resolve();
  const dialog = document.querySelector("dialog") as HTMLDialogElement;

  expect(dialog).toBeTruthy();
  expect(dialog.open).toBeTrue();
  expect(dialog.className).toContain("fixed inset-0 m-auto");
  const dismiss = dialog.querySelector("button") as HTMLButtonElement;
  dismiss.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(document.querySelector("dialog")).toBeNull();
  close();
});

test("does not add a trigger to a controlled dialog", () => {
  const close = mount(
    <Modal open={false} title="Controlled dialog">Body</Modal>,
    document.body,
  );

  expect(document.querySelector("button")).toBeNull();
  expect(document.querySelector("dialog")).toBeNull();
  close();
});

test("opens a fullscreen modal", async () => {
  const close = mount(
    <Modal fullscreen scrollable label="Open editor" title="Page editor">
      Editor
    </Modal>,
    document.body,
  );
  const trigger = document.querySelector("button") as HTMLButtonElement;
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await Promise.resolve();
  const dialog = document.querySelector("dialog") as HTMLDialogElement;

  expect(dialog.className).toContain("h-dvh w-full");
  expect(dialog.className).toContain("max-h-none max-w-none");
  expect(dialog.className).toContain("overflow-hidden");
  expect(dialog.firstElementChild?.className).toContain("h-full");
  close();
});

test("closes a required dialog through its footer action", async () => {
  const close = mount(
    <Modal
      dismissible={false}
      label="Review changes"
      slotFooter={(dismiss: () => void) => (
        <Button onClick={dismiss}>Keep editing</Button>
      )}
      title="Unsaved changes"
    >Choose an action.</Modal>,
    document.body,
  );
  const trigger = document.querySelector("button") as HTMLButtonElement;
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await Promise.resolve();
  const dialog = document.querySelector("dialog") as HTMLDialogElement;

  expect(dialog).toBeTruthy();
  expect(dialog.querySelector('[aria-label="Close"]')).toBeNull();
  const action = dialog.querySelector("footer button") as HTMLButtonElement;
  action.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(document.querySelector("dialog")).toBeNull();
  close();
});

test("closes a directional drawer through its footer action", async () => {
  const close = mount(
    <Drawer
      direction="right"
      label="Manage release"
      slotFooter={(dismiss: () => void) => (
        <Button onClick={dismiss}>Promote release</Button>
      )}
      title="Release actions"
    >Ready to promote.</Drawer>,
    document.body,
  );
  const trigger = document.querySelector("button") as HTMLButtonElement;
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await Promise.resolve();
  const drawer = document.querySelector("dialog") as HTMLDialogElement;

  expect(drawer).toBeTruthy();
  expect(drawer.className).toContain("ml-auto mr-0 h-full");
  expect(drawer.firstElementChild?.className).toContain("flex min-h-0");
  expect(drawer.firstElementChild?.className).toContain("h-full");
  expect(drawer.querySelector("footer")?.className).toContain("shrink-0");
  expect(drawer.querySelector("footer")?.previousElementSibling?.className)
    .toContain("flex-1 overflow-y-auto");
  const action = drawer.querySelector("footer button") as HTMLButtonElement;
  action.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(document.querySelector("dialog")).toBeNull();
  close();
});

test("uses the browser Popover API contract", () => {
  const close = mount(
    <Popover label="Help" content="Native popover" />,
    document.body,
  );
  const trigger = document.querySelector("button")!;
  const popover = document.querySelector("[popover]")!;

  expect(trigger.getAttribute("popovertarget")).toBe(popover.id);
  expect(popover.getAttribute("popover")).toBe("auto");
  close();
});

test("renders side and arrow options for floating help", () => {
  const close = mount(<>
    <Popover arrow label="Details" side="right" content="Ready" />
    <Tooltip
      arrow
      delayDuration={300}
      side="bottom"
      text="More details"
    ><Button>Help</Button></Tooltip>
  </>, document.body);
  const popover = document.querySelector(".lui-popover") as HTMLElement;
  const tooltip = document.querySelector(
    ".lui-tooltip__content",
  ) as HTMLElement;

  expect(popover.className).toContain("arrow");
  expect(tooltip.className).toContain("arrow");
  expect(tooltip.dataset.side).toBe("bottom");
  expect(tooltip.style.getPropertyValue("--lui-tip-delay")).toBe("300ms");
  close();
});

test("keeps a context menu open after releasing the secondary button", () => {
  const close = mount(
    <ContextMenu items={[{ label: "Open" }]}>
      <div class="context-target">Right click</div>
    </ContextMenu>,
    document.body,
  );
  const target = document.querySelector(".context-target")!;
  const menu = document.querySelector(".lui-context-menu") as HTMLElement;
  let open = false;
  menu.showPopover = () => open = true;
  menu.hidePopover = () => open = false;

  target.dispatchEvent(new MouseEvent("contextmenu", {
    bubbles: true,
    button: 2,
    clientX: 120,
    clientY: 80,
  }));
  target.dispatchEvent(new MouseEvent("pointerup", {
    bubbles: true,
    button: 2,
  }));

  expect(menu.getAttribute("popover")).toBe("manual");
  expect(open).toBeTrue();
  expect(menu.style.left).toBe("120px");
  expect(menu.style.top).toBe("80px");

  document.body.dispatchEvent(new MouseEvent("pointerdown", {
    bubbles: true,
  }));
  expect(open).toBeFalse();
  close();
});

test("dismisses a reactive toast", () => {
  const close = mount(
    <Toast inline title="Saved" description="Ready" />,
    document.body,
  );
  const button = document.querySelector(
    ".lui-toast button",
  ) as HTMLButtonElement;
  expect(document.querySelector("[role=status]")?.textContent)
    .toContain("Saved");
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(document.querySelector(".lui-toast")).toBeNull();
  close();
});

test("renders toast avatars and actions", () => {
  let opened = false;
  const close = mount(<Toast
    actions={[{ label: "Open", onClick: () => opened = true }]}
    avatar={{ text: "LU" }}
    inline
    title="Ready"
  />, document.body);

  expect(document.querySelector(".lui-toast")?.textContent)
    .toContain("LU");
  const button = [...document.querySelectorAll(".lui-toast button")]
    .find((item) => item.textContent === "Open") as HTMLButtonElement;
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(opened).toBeTrue();
  close();
});

test("edits native tag, rating, listbox and pin inputs", () => {
  const values: unknown[] = [];
  const close = mount(<>
    <InputTags onChange={(value: unknown) => values.push(value)} />
    <InputRating onChange={(value: unknown) => values.push(value)} />
    <Listbox
      items={["A", "B"]}
      onChange={(value: unknown) => values.push(value)}
    />
    <PinInput length={3} onChange={(value: unknown) => values.push(value)} />
  </>, document.body);
  const tag = document.querySelector(".lui-tags input") as HTMLInputElement;
  tag.value = "Act";
  tag.dispatchEvent(new Event("input", { bubbles: true }));
  tag.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Enter",
  }));
  const stars = [...document.querySelectorAll(".lui-rating button")];
  stars[3]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const options = [...document.querySelectorAll(".lui-listbox button")];
  options[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const pin = document.querySelector(".lui-pin input") as HTMLInputElement;
  pin.value = "7";
  pin.dispatchEvent(new Event("input", { bubbles: true }));

  expect(document.querySelector(".lui-tags")?.textContent).toContain("Act");
  expect(stars[3]?.getAttribute("aria-checked")).toBe("true");
  expect(options[1]?.getAttribute("aria-selected")).toBe("true");
  expect(values).toEqual([["Act"], 4, "B", "7"]);
  close();
});

test("uses searchable select and menu popover contracts", () => {
  const values: unknown[] = [];
  const close = mount(<>
    <SelectMenu
      items={["Alpha", "Beta"]}
      onChange={(value: unknown) => values.push(value)}
    />
    <DropdownMenu label="Actions" items={[
      { label: "Edit", value: "edit" },
    ]} />
  </>, document.body);
  const menu = document.querySelector("[role=menu]")!;
  expect(menu.className).toContain("hidden");
  expect(menu.className).toContain("open:grid");
  const select = document.querySelector(
    ".lui-select-menu [popovertarget]",
  )!;
  const popup = document.querySelector(".lui-select-menu [popover]")!;
  const trigger = document.querySelector(
    ":not(.lui-select-menu) > [popovertarget]",
  )!;

  const search = document.querySelector(
    ".lui-select-menu input",
  ) as HTMLInputElement;
  search.value = "beta";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  const options = document.querySelectorAll(
    ".lui-select-menu [role=option]",
  );
  expect(options).toHaveLength(1);
  options[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(values).toEqual(["Beta"]);
  expect(select.textContent).toContain("Beta");
  expect(select.getAttribute("popovertarget")).toBe(popup.id);
  expect(trigger.getAttribute("popovertarget")).toBe(menu.id);
  expect(menu.getAttribute("popover")).toBe("auto");
  close();
});

test("uses child triggers and native marquee options", () => {
  const close = mount(<>
    <DropdownMenu items={["Profile"]}>
      <Button>Account</Button>
    </DropdownMenu>
    <Marquee items={[{ label: "Act" }, { label: "Tailwind" }]} reverse />
  </>, document.body);
  const trigger = document.querySelector(".lui-button")!;

  expect(trigger.getAttribute("popovertarget")).toBeTruthy();
  expect(document.querySelector(".lui-marquee")?.textContent)
    .toBe("ActTailwindActTailwind");
  expect(document.querySelector(".lui-marquee > div")?.className)
    .toContain("animation-direction:reverse");
  close();
});

test("moves a native carousel without rebuilding its slides", () => {
  const close = mount(<Carousel>
    <article>One</article>
    <article>Two</article>
  </Carousel>, document.body);
  const first = document.querySelector("article");
  const next = document.querySelector(
    "[aria-label='Next slide']",
  ) as HTMLButtonElement;
  next.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  expect(document.querySelector("article")).toBe(first);
  expect(first?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  close();
});

test("starts and cleans up carousel autoplay", async () => {
  const values: number[] = [];
  const close = mount(<Carousel
    autoplay
    interval={5}
    onChange={(value: number) => values.push(value)}
  >
    <article>One</article>
    <article>Two</article>
  </Carousel>, document.body);
  await Bun.sleep(18);
  expect(values.length).toBeGreaterThan(0);
  close();
  const count = values.length;
  await Bun.sleep(12);
  expect(values).toHaveLength(count);
});

test("renders and selects planner calendar days", () => {
  const values: unknown[] = [];
  const close = mount(<Calendar
    defaultMonth={new Date(2026, 7, 1)}
    defaultValue={new Date(2026, 7, 27)}
    onChange={(value: unknown) => values.push(value)}
    renderDay={(day: { key: string }) => <em>{day.key}</em>}
    variant="planner"
  />, document.body);
  const day = [...document.querySelectorAll(".lui-calendar button")]
    .find((node) => node.textContent === "2026-08-28") as HTMLButtonElement;

  expect(document.querySelector(".lui-calendar")?.textContent)
    .toContain("2026-08-27");
  expect(document.querySelector(".lui-calendar")?.className)
    .toContain("lui-calendar--planner");
  expect(document.querySelector(".lui-calendar__week")).not.toBeNull();
  expect(day.className).toContain("lui-calendar__day");
  day.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const selected = [...document.querySelectorAll(".lui-calendar button")]
    .find((node) => node.textContent === "2026-08-28");
  expect(selected?.getAttribute("aria-pressed")).toBe("true");
  expect(values).toHaveLength(1);
  close();
});

test("shows dates inside a calendar range", () => {
  const close = mount(<Calendar
    defaultMonth={new Date(2026, 7, 1)}
    defaultValue={{
      end: new Date(2026, 7, 29),
      start: new Date(2026, 7, 25),
    }}
    range
  />, document.body);
  const days = [...document.querySelectorAll(".lui-calendar button")];
  const middle = days.find((node) => (
    node.getAttribute("aria-label") === "August 27, 2026"
  ))!;

  expect(middle.className).toContain("between");
  close();
});

test("renders compact display primitives with useful semantics", () => {
  const close = mount(<>
    <AvatarGroup max={2} items={[
      { text: "AK" }, { text: "JL" }, { text: "MS" },
    ]} />
    <Chip color="danger" text="7"><Avatar text="LU" /></Chip>
    <Kbd>⌘</Kbd>
    <Separator label="OR" />
    <ProgressGroup items={[
      { label: "Cached", value: 70 },
      { color: "warning", label: "Dynamic", value: 30 },
    ]} label="Traffic" />
    <Empty description="Create a Site to begin." title="No Sites" />
    <ScrollArea height={120}><p>Runtime log</p></ScrollArea>
  </>, document.body);

  expect(document.querySelector(".lui-avatar-group")?.textContent)
    .toContain("+1");
  expect(document.querySelector(".lui-chip")?.textContent).toContain("7");
  expect(document.querySelector("kbd")?.textContent).toBe("⌘");
  expect(document.querySelector("[role=separator]")?.textContent).toBe("OR");
  expect(document.querySelector(".lui-progress-group")?.textContent)
    .toContain("Cached70");
  expect(document.querySelector(".lui-empty")?.textContent)
    .toContain("No Sites");
  expect(document.querySelector(".lui-scroll")?.textContent)
    .toContain("Runtime log");
  close();
});

test("renders every lightweight SVG chart family", () => {
  const close = mount(<>
    <ChartSvg type="line" values={[18, 32, 28, 48]} />
    <ChartSvg type="pie" values={[52, 31, 17]} />
    <ChartSvg type="horizontal" labels={["A", "B"]} values={[72, 48]} />
    <ChartSvg type="radar" values={[86, 92, 71, 82, 77]} />
  </>, document.body);

  expect(document.querySelectorAll(".lui-chart-svg")).toHaveLength(4);
  expect(document.querySelector(".lui-chart-stage .line")).toBeTruthy();
  expect(document.querySelectorAll(".lui-chart-stage .slice"))
    .toHaveLength(3);
  expect(document.querySelectorAll(".lui-chart-stage .bar"))
    .toHaveLength(2);
  expect(document.querySelector(".lui-chart-stage .radar-area")).toBeTruthy();
  close();
});

test("supports range sliders and array pin values", () => {
  const ranges: unknown[] = [];
  const pins: unknown[] = [];
  const close = mount(<>
    <Slider
      defaultValue={[25, 75]}
      onChange={(value: unknown) => ranges.push(value)}
    />
    <PinInput
      defaultValue={["L", "U", "O", "N"]}
      onChange={(value: unknown) => pins.push(value)}
    />
  </>, document.body);
  const range = document.querySelectorAll(
    ".lui-slider input",
  )[0] as HTMLInputElement;
  range.value = "35";
  range.dispatchEvent(new Event("input", { bubbles: true }));
  const pin = document.querySelectorAll(
    ".lui-pin input",
  )[3] as HTMLInputElement;
  pin.value = "X";
  pin.dispatchEvent(new Event("input", { bubbles: true }));

  expect(ranges).toEqual([[35, 75]]);
  expect(pins).toEqual([["L", "U", "O", "X"]]);
  close();
});

test("updates grouped checks and bounded number input", () => {
  const checks: unknown[] = [];
  const numbers: unknown[] = [];
  const close = mount(<>
    <CheckboxGroup
      defaultValue={["preview"]}
      items={["preview", "production"]}
      onChange={(value: unknown) => checks.push(value)}
    />
    <InputNumber
      defaultValue={2}
      max={3}
      min={1}
      onChange={(value: unknown) => numbers.push(value)}
    />
  </>, document.body);
  const check = document.querySelectorAll(
    ".lui-check-group input",
  )[1] as HTMLInputElement;
  check.dispatchEvent(new Event("change", { bubbles: true }));
  const increase = document.querySelector(
    ".lui-number [aria-label=Increase]",
  ) as HTMLButtonElement;
  increase.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  expect(checks).toEqual([["preview", "production"]]);
  expect(numbers).toEqual([3]);
  expect(increase.disabled).toBeTrue();
  close();
});

test("navigates collapsible and command surfaces", () => {
  const commands: unknown[] = [];
  const close = mount(<>
    <Collapsible label="Build details">Ready</Collapsible>
    <CommandPalette
      items={[
        { label: "Create Site", value: "create" },
        { label: "Deploy", value: "deploy" },
      ]}
      onChange={(value: unknown) => commands.push(value)}
    />
    <NavigationMenu items={[
      { active: true, label: "Overview" },
      { children: [{ label: "Act" }], label: "Products" },
    ]} />
  </>, document.body);
  const trigger = document.querySelector(
    ".lui-collapse button",
  ) as HTMLButtonElement;
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const deploy = [...document.querySelectorAll(
    ".lui-command [role=option]",
  )].find((item) => item.textContent?.includes("Deploy"))!;
  deploy.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(commands).toEqual(["deploy"]);
  expect(document.querySelector(".lui-nav [aria-current=page]")?.textContent)
    .toContain("Overview");
  expect(document.querySelector(".lui-nav__menu")?.textContent)
    .toContain("Act");
  close();
});

test("ships compiled Tailwind utilities inside the package", async () => {
  const file = new URL("../src/style.css", import.meta.url);
  const css = await Bun.file(file).text();

  expect(css).toContain("--lui-primary");
  expect(css).toContain(".inline-flex");
  expect(css).toContain(".lui-editor-body .tiptap");
  expect(css).toContain(".lui-editor-toolbar");
  expect(css).toContain(".lui-data-table .dt-layout-table");
  expect(css).toContain("--luon-scroll-size:0px");
  expect(css).toContain("--luon-scroll-thumb:transparent");
  expect(css).toContain("--luon-scroll-width:none");
  expect(css).toContain("scrollbar-width:var(--luon-scroll-width)");
  expect(css).toContain("::-webkit-scrollbar");
  expect(css.length).toBeGreaterThan(1000);
});

test("keeps external engines behind the Luon CDN boundary", () => {
  expect(typeof editorActive).toBe("function");
  expect(cdnUrl("/ui/v2/chart.mjs"))
    .toBe("https://cdn.luon.dev/ui/v2/chart.mjs");
  globalThis.__LUON_CDN__ = "http://localhost:6010";
  expect(cdnUrl("/ui/v2/chart.mjs"))
    .toBe("http://localhost:6010/ui/v2/chart.mjs");

  const close = mount(
    <Chart data={{ datasets: [] }} type="line" />,
    document.body,
  );
  expect(document.querySelector(".lui-chart")).toBeInstanceOf(HTMLElement);
  close();
});

test("combines input addons and clears without losing focus", () => {
  const changes: unknown[] = [];
  const close = mount(<Input
    clearable defaultValue="luon" icon="globe" id="domain"
    error="Use a complete domain" prefix="https://" suffix=".dev"
    trailingIcon="check" variant="soft"
    onChange={(value: unknown) => changes.push(value)}
  />, document.body);
  const input = document.querySelector("input")!;
  const clear = document.querySelector<HTMLButtonElement>(
    '[aria-label="Clear input"]',
  )!;
  expect(document.body.textContent).toContain("https://");
  expect(document.body.textContent).toContain(".dev");
  expect(document.querySelector('[data-icon="check"]')).toBeTruthy();
  expect(input.getAttribute("aria-describedby")).toBe("domain-error");
  expect(document.getElementById("domain-error")?.textContent)
    .toBe("Use a complete domain");
  clear.click();
  expect(changes).toEqual([""]);
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(clear.disabled).toBeTrue();
  close();
});

test("keeps disabled and read-only input values intact", () => {
  const changes: unknown[] = [];
  const close = mount(<>
    <Input clearable defaultValue="Locked" readOnly
      onChange={(value: unknown) => changes.push(value)} />
    <Input clearable defaultValue="Secret" disabled type="password"
      onChange={(value: unknown) => changes.push(value)} />
    <Checkbox disabled label="Unavailable" />
    <Switch disabled label="Unavailable" />
  </>, document.body);
  const inputs = document.querySelectorAll(".lui-input input");
  expect((inputs[0] as HTMLInputElement).readOnly).toBeTrue();
  expect((inputs[1] as HTMLInputElement).disabled).toBeTrue();
  for (const button of document.querySelectorAll(".lui-input button")) {
    expect((button as HTMLButtonElement).disabled).toBeTrue();
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  expect((inputs[1] as HTMLInputElement).type).toBe("password");
  expect(document.querySelector<HTMLInputElement>('[type="checkbox"]')
    ?.disabled).toBeTrue();
  expect(document.querySelector<HTMLButtonElement>('[role="switch"]')
    ?.disabled).toBeTrue();
  expect(changes).toEqual([]);
  close();
});

test("blocks disabled link actions including synthetic clicks", () => {
  let count = 0;
  const close = mount(<>
    <Button disabled href="/settings" onClick={() => count++}>Settings</Button>
    <Button loading href="/deploy" onClick={() => count++}>Deploying</Button>
    <Button href="/help" onClick={() => count++}>Help</Button>
  </>, document.body);
  const links = document.querySelectorAll("a");
  for (const link of links) link.dispatchEvent(new MouseEvent("click", {
    bubbles: true, cancelable: true,
  }));
  expect(links[0]?.hasAttribute("href")).toBeFalse();
  expect(links[1]?.hasAttribute("href")).toBeFalse();
  expect(links[0]?.tabIndex).toBe(-1);
  expect(links[2]?.getAttribute("href")).toBe("/help");
  expect(count).toBe(1);
  close();
});

test("navigates filtered options and restores select focus", () => {
  const changes: unknown[] = [];
  const close = mount(<SelectMenu
    items={["Alpha", { label: "Beta", value: "beta", disabled: true },
      "Gamma"]}
    onChange={(value: unknown) => changes.push(value)}
  />, document.body);
  const trigger = document.querySelector<HTMLButtonElement>(
    ".lui-select-menu > button",
  )!;
  const search = document.querySelector<HTMLInputElement>(
    '[role="combobox"]',
  )!;
  const key = (node: Element, value: string) => node.dispatchEvent(
    new KeyboardEvent("keydown", { key: value, bubbles: true }),
  );
  key(trigger, "ArrowDown");
  expect(document.activeElement).toBe(search);
  key(search, "ArrowDown");
  const active = document.getElementById(
    search.getAttribute("aria-activedescendant")!,
  );
  expect(active?.textContent).toContain("Gamma");
  key(search, "Enter");
  expect(changes).toEqual(["Gamma"]);
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  key(trigger, "ArrowDown");
  search.value = "missing";
  search.dispatchEvent(new Event("input", { bubbles: true }));
  key(search, "Enter");
  expect(changes).toEqual(["Gamma"]);
  expect(document.querySelector('[role="status"]')?.textContent)
    .toBe("No results");
  key(search, "Escape");
  expect(document.activeElement).toBe(trigger);
  close();
});

test("submits grouped multiple choices and clears the entire value", () => {
  const changes: unknown[] = [];
  const close = mount(<SelectMenu
    clearable defaultValue={["read", "write"]} maxVisible={1}
    items={[{ group: "Permissions", items: ["read", "write", "admin"] }]}
    multiple name="roles" onChange={(value: unknown) => changes.push(value)}
  />, document.body);
  expect(document.querySelector('[role="listbox"]')?.textContent)
    .toContain("Permissions");
  expect(document.querySelector('[role="listbox"]')
    ?.getAttribute("aria-multiselectable")).toBe("true");
  expect(document.querySelector(".lui-select-menu > button")?.textContent)
    .toContain("+1");
  expect([...document.querySelectorAll<HTMLInputElement>(
    'input[type="hidden"][name="roles"]',
  )].map((input) => input.value)).toEqual(["read", "write"]);
  document.querySelector<HTMLButtonElement>(
    '[aria-label="Clear selection"]',
  )!.click();
  expect(changes).toEqual([[]]);
  expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  close();
});

test("keeps a read-only select out of its popup and change callbacks", () => {
  let count = 0;
  const close = mount(<SelectMenu
    clearable defaultValue="One" items={["One", "Two"]} readOnly
    onChange={() => count++}
  />, document.body);
  const trigger = document.querySelector<HTMLButtonElement>(
    ".lui-select-menu > button",
  )!;
  expect(trigger.hasAttribute("popovertarget")).toBeFalse();
  trigger.dispatchEvent(new KeyboardEvent("keydown", {
    key: "ArrowDown", bubbles: true,
  }));
  for (const node of document.querySelectorAll("button")) {
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(count).toBe(0);
  close();
});

test("caps textarea growth while preserving its value", () => {
  const close = mount(<Textarea autoresize maxRows={4} rows={2}
    style={{ boxSizing: "border-box", lineHeight: "20px",
      paddingTop: "8px", paddingBottom: "8px" }}
  />, document.body);
  const input = document.querySelector("textarea")!;
  Object.defineProperty(input, "scrollHeight", { value: 216 });
  input.value = "A long note";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  expect(input.style.height).toBe("96px");
  expect(input.style.overflowY).toBe("auto");
  expect(input.value).toBe("A long note");
  close();
});

test("keeps default solid colors readable in both palettes", async () => {
  const source = await Bun.file(new URL("../src/theme.css", import.meta.url))
    .text();
  const luminance = (hex: string) => {
    const rgb = hex.match(/[\da-f]{2}/gi)!.map((value) => {
      const channel = parseInt(value, 16) / 255;
      return channel <= .04045 ? channel / 12.92
        : ((channel + .055) / 1.055) ** 2.4;
    });
    return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
  };
  const palettes = [...source.matchAll(/\{([^{}]*--lui-base-on:[^{}]*)\}/g)];
  expect(palettes).toHaveLength(2);
  for (const palette of palettes) {
    const colors = Object.fromEntries([...palette[1]!.matchAll(
      /--lui-base-([a-z]+): (#[\da-f]{6});/g,
    )].map((match) => [match[1]!, luminance(match[2]!)]));
    for (const name of ["primary", "secondary", "danger", "warning",
      "success"]) {
      const high = Math.max(colors[name]!, colors.on!);
      const low = Math.min(colors[name]!, colors.on!);
      expect((high + .05) / (low + .05), name).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("links fields to native input labels, errors and requirements", async () => {
  const close = mount(<FormField label="Email" error="Email is required"
    required orientation="horizontal">
    <Input aria-describedby="external-help" />
  </FormField>, document.body);
  await Promise.resolve();
  const input = document.querySelector("input")!;
  const label = document.querySelector<HTMLLabelElement>("label[data-field]")!;
  const error = document.querySelector('[role="alert"]')!;
  expect(label.htmlFor).toBe(input.id);
  expect(input.id).not.toBe("");
  expect(input.getAttribute("aria-describedby"))
    .toBe(`external-help ${error.id}`);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.required).toBeTrue();
  expect(document.querySelector("label label")).toBeNull();
  close();
});

test("preserves empty numbers and precise bounded steps", () => {
  const values: unknown[] = [];
  const close = mount(<InputNumber defaultValue={0.2} step={0.1} max={0.4}
    onChange={(value: unknown) => values.push(value)} />, document.body);
  const input = document.querySelector("input")!;
  const plus = document.querySelector<HTMLButtonElement>(
    '[aria-label="Increase"]',
  )!;
  plus.click();
  expect(values.at(-1)).toBe(0.3);
  plus.click();
  expect(values.at(-1)).toBe(0.4);
  expect(plus.disabled).toBeTrue();
  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  expect(values.at(-1)).toBeUndefined();
  expect(input.value).toBe("");
  close();
});

test("validates dropped files and removes accepted selections", () => {
  const values: any[] = [];
  const rejected: any[] = [];
  const close = mount(<FileUpload multiple accept=".txt" maxSize={4}
    maxFiles={1} onChange={(value: unknown) => values.push(value)}
    onReject={(files) => rejected.push(...files)} />, document.body);
  const drop = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(drop, "dataTransfer", { value: { files: [
    new File(["ok"], "one.txt"), new File(["x"], "image.png"),
    new File(["large"], "big.txt"), new File(["ok"], "two.txt"),
  ] } });
  document.querySelector(".lui-upload > div")!.dispatchEvent(drop);
  expect(values[0].map((file: File) => file.name)).toEqual(["one.txt"]);
  expect(rejected.map((item) => item.reason)).toEqual(["type", "size", "count"]);
  expect(document.querySelector('[role="alert"]')?.textContent)
    .toContain("File is too large.");
  document.querySelector<HTMLButtonElement>('[aria-label="Remove one.txt"]')!
    .click();
  expect(values.at(-1)).toEqual([]);
  close();
});

test("blocks disabled and read-only uploads including drops", () => {
  const values: unknown[] = [];
  const close = mount(<>
    <FileUpload disabled onChange={(value: unknown) => values.push(value)} />
    <FileUpload readOnly onChange={(value: unknown) => values.push(value)} />
  </>, document.body);
  for (const zone of document.querySelectorAll(".lui-upload > div")) {
    const event = new Event("drop", { bubbles: true });
    Object.defineProperty(event, "dataTransfer", { value: {
      files: [new File(["ok"], "one.txt")],
    } });
    zone.dispatchEvent(event);
    expect(zone.querySelector("button")!.disabled).toBeTrue();
  }
  expect(values).toEqual([]);
  close();
});

test("navigates menus past disabled links and restores trigger focus", () => {
  const values: string[] = [];
  const close = mount(<DropdownMenu label="Actions" items={[
    { label: "Blocked", href: "/blocked", disabled: true,
      onSelect: () => values.push("blocked") },
    { label: "Edit", onSelect: () => values.push("edit") },
    { label: "Save", onSelect: () => values.push("save") },
  ]} />, document.body);
  const trigger = document.querySelector<HTMLButtonElement>("[popovertarget]")!;
  const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
  let open = false;
  menu.showPopover = () => { open = true; };
  menu.hidePopover = () => { open = false; };
  trigger.focus();
  trigger.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, cancelable: true, key: "ArrowDown",
  }));
  expect(open).toBeTrue();
  expect(document.activeElement?.textContent).toBe("Edit");
  const link = menu.querySelector("a")!;
  expect(link.hasAttribute("href")).toBeFalse();
  link.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(values).toEqual([]);
  document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, cancelable: true, key: "End",
  }));
  expect(document.activeElement?.textContent).toBe("Save");
  document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, cancelable: true, key: " ",
  }));
  expect(values).toEqual(["save"]);
  expect(open).toBeFalse();
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  close();
});

test("distinguishes dialog padding from backdrop and restores focus", async () => {
  const values: boolean[] = [];
  const close = mount(<Modal label="Open" title="Details"
    initialFocus="#dialog-input" onOpenChange={(value: boolean) => values.push(value)}>
    <input id="dialog-input" />
  </Modal>, document.body);
  const trigger = document.querySelector<HTMLButtonElement>("button")!;
  trigger.focus();
  trigger.click();
  await Promise.resolve();
  const dialog = document.querySelector("dialog")!;
  dialog.getBoundingClientRect = () => box(100, 200);
  expect(document.activeElement?.id).toBe("dialog-input");
  for (const type of ["pointerdown", "click"]) {
    dialog.dispatchEvent(new MouseEvent(type, {
      bubbles: true, clientX: 20, clientY: 120,
    }));
  }
  expect(document.querySelector("dialog")).toBe(dialog);
  for (const type of ["pointerdown", "click"]) {
    dialog.dispatchEvent(new MouseEvent(type, {
      bubbles: true, clientX: 500, clientY: 500,
    }));
  }
  expect(document.querySelector("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(values).toEqual([true, false]);
  close();
});

test("keeps keyboard commands on enabled choices during IME input", () => {
  const values: unknown[] = [];
  const close = mount(<CommandPalette items={[
    { label: "Blocked", value: "blocked", disabled: true },
    { label: "Edit", value: "edit" }, { label: "Save", value: "save" },
  ]} onChange={(value: unknown) => values.push(value)} />, document.body);
  const input = document.querySelector("input")!;
  input.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, key: "Enter", isComposing: true,
  }));
  expect(values).toEqual([]);
  for (const key of ["ArrowUp", "Enter"]) {
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  }
  expect(values).toEqual(["save"]);
  expect(document.getElementById(input.getAttribute("aria-activedescendant")!)
    ?.textContent).toContain("Save");
  close();
});

test("uses calendar day boundaries and guards footer actions", () => {
  const values: unknown[] = [];
  const close = mount(<Calendar defaultMonth="2026-09-01"
    min={new Date(2026, 8, 5, 12)} max="2026-09-05" showToday showClear
    showOutside={false} onChange={(value: unknown) => values.push(value)} />,
  document.body);
  const day = document.querySelector<HTMLButtonElement>(
    '[aria-label="September 5, 2026"]',
  )!;
  expect(day.disabled).toBeFalse();
  day.click();
  expect((values[0] as Date).getDate()).toBe(5);
  const hidden = document.querySelector<HTMLButtonElement>(
    '.lui-calendar__day[aria-hidden="true"]',
  )!;
  expect(hidden.disabled).toBeTrue();
  const today = [...document.querySelectorAll("footer button")]
    .find((node) => node.textContent === "Today") as HTMLButtonElement;
  const now = new Date();
  expect(today.disabled).toBe(!(now.getFullYear() === 2026
    && now.getMonth() === 8 && now.getDate() === 5));
  close();
  const stop = mount(<Calendar disabled showToday showClear
    onChange={(value: unknown) => values.push(value)} />, document.body);
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "footer button",
  )) {
    expect(button.disabled).toBeTrue();
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  expect(values).toHaveLength(1);
  stop();
});

test("opens context actions by keyboard and dismisses with Escape", () => {
  const close = mount(<ContextMenu items={["Open", "Archive"]}>
    <span>Project</span>
  </ContextMenu>, document.body);
  const root = document.querySelector<HTMLElement>(".lui-context")!;
  const menu = root.querySelector<HTMLElement>('[role="menu"]')!;
  let open = false;
  menu.showPopover = () => { open = true; };
  menu.hidePopover = () => { open = false; };
  root.focus();
  root.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, cancelable: true, key: "F10", shiftKey: true,
  }));
  expect(open).toBeTrue();
  expect(document.activeElement?.textContent).toBe("Open");
  document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true, cancelable: true, key: "Escape",
  }));
  expect(open).toBeFalse();
  expect(document.activeElement).toBe(root);
  close();
});

test("moves rating and listbox selection from the keyboard", () => {
  const values: unknown[] = [];
  const close = mount(<>
    <InputRating onChange={(value: unknown) => values.push(value)} />
    <Listbox items={[
      { label: "One", value: 1 },
      { label: "Two", value: 2, disabled: true },
      { label: "Three", value: 3 },
    ]} onChange={(value: unknown) => values.push(value)} />
  </>, document.body);
  for (const selector of ['[role="radio"]', '[role="option"]']) {
    const first = document.querySelector<HTMLElement>(selector)!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true, cancelable: true, key: "ArrowRight",
    }));
  }
  expect(values).toEqual([2, 3]);
  expect(document.activeElement?.textContent).toBe("Three");
  close();
});
