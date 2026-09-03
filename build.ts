import tailwind from "@tailwindcss/postcss";
import { compileView } from "@luon/view/compiler";
import postcss from "postcss";

const groups = [
  "base",
  "drag",
  "engine",
  "form",
  "icon",
  "interact",
  "more",
  "term",
];
let namedCount = 0;

for (const group of groups) {
  const input = new URL(`src/${group}.tsx`, import.meta.url);
  const source = await Bun.file(input).text();
  const names = [...source.matchAll(
    /^export function ([A-Z][A-Za-z0-9]*)/gm,
  )].map((match) => match[1]!);
  namedCount += names.length;
  const specs = names.map((name) => (
    `  ${name}: uiProps(${JSON.stringify(name)}),`
  )).join("\n");
  const view = `${source}\nimport { uiProps } from "./props.ts";\n`
    + `export const specs = {\n${specs}\n};\n`;
  const result = compileView(view, {
    batch: true,
    id: input.pathname,
    reactive: false,
  });
  const output = new URL(`src/${group}.view.js`, import.meta.url);
  await Bun.write(
    output,
    `// Generated from src/${group}.tsx.\n${result.code}`,
  );
  const types = new URL(`src/${group}.view.d.ts`, import.meta.url);
  await Bun.write(types, `export * from "./${group}.tsx";\n`);
}

if (namedCount !== 66) {
  throw new Error(`UI needs 66 named Views, found ${namedCount}.`);
}

const views = new Bun.Glob("src/*.view.tsx");
for await (const file of views.scan({ cwd: import.meta.dir, onlyFiles: true })) {
  const input = new URL(file, `${import.meta.url}/../`);
  const source = await Bun.file(input).text();
  const result = compileView(source, { id: input.pathname });
  const output = new URL(file.replace(/\.tsx$/, ".js"), `${import.meta.url}/../`);
  await Bun.write(output, `// Generated from ${file}.\n${result.code}`);
}

const input = new URL("src/theme.css", import.meta.url);
const output = new URL("src/style.css", import.meta.url);
const source = await Bun.file(input).text();
const result = await postcss([
  tailwind({
    base: import.meta.dir,
    optimize: { minify: true },
  }),
]).process(source, {
  from: input.pathname,
  to: output.pathname,
});

await Bun.write(output, result.css);
