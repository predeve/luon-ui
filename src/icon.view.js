// Generated from src/icon.tsx.
import { jsx as _jsx } from "@luon/view/jsx-runtime";
import { liveView as live } from "@luon/view";
import { icons } from "./icons.ts";
import { loadModule } from "./loader.ts";
import { isRead } from "./util.ts";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
const ns = "http://www.w3.org/2000/svg";
const iconNames = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const iconTags = new Set([
    "circle", "ellipse", "line", "path", "polygon", "polyline", "rect",
]);
const iconAttrs = new Set([
    "$", "cy", "d", "fill", "height", "points", "r", "rx", "ry",
    "width", "x", "x1", "x2", "y", "y1", "y2",
]);
const remote = new Map();
const github = [
    "M12 .7A11.5 11.5 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2",
    "c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7",
    ".1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2",
    ".9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.3-5.1-5.6 0-1.2",
    ".4-2.3 1.1-3.1-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3.2 1.2",
    "a10.8 10.8 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2",
    ".6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3.1 0 4.3-2.6",
    "5.3-5.1 5.6.4.3.7.9.7 1.8v2.7c0 .4.2.8.8.6A11.5 11.5",
    "0 0 0 12 .7Z",
].join("");
function keyOf(value = "circle") {
    return value.replace(/^i-lucide-/, "").replace(/^lucide-/, "");
}
function shape([tag, attrs]) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) {
        if (value !== undefined)
            node.setAttribute(name, String(value));
    }
    return node;
}
function validNode(value) {
    return Array.isArray(value) && value.length > 0 && value.every((item) => {
        if (!Array.isArray(item) || item.length < 2)
            return false;
        if (typeof item[0] !== "string" || !iconTags.has(item[0]))
            return false;
        if (!item[1] || typeof item[1] !== "object")
            return false;
        return Object.entries(item[1]).every(([name, content]) => (iconAttrs.has(name)
            && (typeof content === "string" || typeof content === "number")));
    });
}
export function iconPath(name) {
    return iconNames.test(name) ? `/ui/v3/icons/${name}.mjs` : undefined;
}
export function loadIcon(name, load = (path) => loadModule(path)) {
    const local = icons[name];
    if (local)
        return Promise.resolve(local);
    let job = remote.get(name);
    if (job)
        return job;
    const path = iconPath(name);
    if (!path)
        return Promise.reject(new Error(`Invalid Lucide icon: ${name}`));
    job = load(path).then((module) => {
        if (!validNode(module.default)) {
            throw new Error(`Invalid Lucide icon data: ${name}`);
        }
        icons[name] = module.default;
        return module.default;
    }).catch((error) => {
        remote.delete(name);
        throw error;
    });
    remote.set(name, job);
    return job;
}
const __specs = {
    Icon: uiProps("Icon"),
};
export const { Icon, } = __namedViews({
    Icon: function Icon(props) {
        if (isRead(props.name)) {
            return live(() => Icon({ ...props, name: props.name.read() }));
        }
        const name = keyOf(props.name);
        const local = icons[name];
        const nodes = name === "github"
            ? [["path", { d: github, fill: "currentColor" }]]
            : local || icons.circle;
        const size = props.size || "1em";
        const svg = (_jsx("svg", { ...props.$attrs, "aria-hidden": props["aria-label"] ? undefined : "true", class: "lui-icon shrink-0", "data-icon": name, fill: "none", height: size, stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", viewBox: "0 0 24 24", width: size, children: nodes.map(shape) }));
        if (!local && name !== "github" && iconPath(name)) {
            void loadIcon(name).then((loaded) => {
                if (svg.parentNode)
                    svg.replaceChildren(...loaded.map(shape));
            }).catch(() => undefined);
        }
        return svg;
    },
}, (name) => __specs[name]);
