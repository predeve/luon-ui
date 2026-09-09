import { parser as css } from "@lezer/css";
import { highlightTree, tagHighlighter, tags as t } from "@lezer/highlight";
import { parser as javascript } from "@lezer/javascript";
import { parser as json } from "@lezer/json";
import type { EditorLanguage } from "./editor-data.ts";

const parsers: Partial<Record<EditorLanguage, typeof javascript>> = {
  javascript,
  typescript: javascript.configure({ dialect: "ts" }),
  jsx: javascript.configure({ dialect: "jsx" }),
  tsx: javascript.configure({ dialect: "jsx ts" }),
  css,
  json,
};
const styles = [
  { tag: t.keyword, class: "lui-syntax-keyword" },
  { tag: [t.typeName, t.className], class: "lui-syntax-type" },
  { tag: [t.atom, t.bool, t.null], class: "lui-syntax-atom" },
  { tag: [t.string, t.attributeValue], class: "lui-syntax-string" },
  { tag: [t.number, t.unit, t.color], class: "lui-syntax-number" },
  { tag: [t.tagName, t.angleBracket], class: "lui-syntax-tag" },
  { tag: t.variableName, class: "lui-syntax-variable" },
  { tag: t.propertyName, class: "lui-syntax-property" },
  {
    tag: t.attributeName,
    class: "lui-syntax-attribute",
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    class: "lui-syntax-function",
  },
  { tag: t.comment, class: "lui-syntax-comment" },
];
const codeStyle = tagHighlighter(styles);
const dataStyle = tagHighlighter([
  ...styles,
  { tag: t.labelName, class: "lui-syntax-attribute" },
]);

export const escapeText = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const keywords = new Set(
  (
    "as async await break case catch class const continue " +
    "debugger declare default delete do else enum export extends false finally " +
    "for from function get if implements import in infer instanceof interface " +
    "keyof let namespace new null of private protected public readonly return " +
    "satisfies set static super switch this throw true try type typeof undefined " +
    "var void while with yield model datasource generator provider relation"
  ).split(" "),
);
const types = new Set(
  "any boolean never number object string unknown bigint".split(" "),
);
const token =
  /<!--[\s\S]*?(?:-->|$)|\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*|"(?:\\[\s\S]|[^"\\])*(?:"|$)|'(?:\\[\s\S]|[^'\\])*(?:'|$)|`(?:\\[\s\S]|[^`\\])*(?:`|$)|\b(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|[A-Za-z_$][\w$-]*|[^\w\s]/gi;

// CodeMirror's language parsers supply tags; CSS supplies the shared palette.
export function highlight(value: string, language: EditorLanguage = "text") {
  if (language === "text" || value.length > 200_000) return escapeText(value);
  const parser = parsers[language];
  if (!parser) return lex(value, language);
  const style =
    language === "css" || language === "json" ? dataStyle : codeStyle;
  let output = "";
  let end = 0;
  highlightTree(parser.parse(value), style, (from, to, classes) => {
    output += escapeText(value.slice(end, from));
    output += `<span class="${classes}">`;
    output += `${escapeText(value.slice(from, to))}</span>`;
    end = to;
  });
  return output + escapeText(value.slice(end));
}

// Lightweight fallback for HTML, Markdown and Prisma display tokens.
function lex(value: string, language: EditorLanguage) {
  const html = language === "html";
  let output = "";
  let end = 0;
  let tag = false;
  for (const match of value.matchAll(token)) {
    const word = match[0];
    output += escapeText(value.slice(end, match.index));
    let kind = "";
    if (/^(\/\/|\/\*|<!--)/.test(word)) kind = "comment";
    else if (/^["'`]/.test(word)) kind = "string";
    else if (/^\d/.test(word)) kind = "number";
    else if (html && word === "<") tag = true;
    else if (html && word === ">") tag = false;
    else if (tag && /^[A-Za-z]/.test(word)) kind = "tag";
    else if (/^(true|false|null|undefined)$/.test(word)) kind = "atom";
    else if (keywords.has(word)) kind = "keyword";
    else if (types.has(word)) kind = "type";
    else if (
      /^[$A-Za-z]/.test(word) &&
      /^\s*\(/.test(value.slice(match.index + word.length))
    )
      kind = "function";
    output += kind
      ? `<span class="lui-syntax-${kind}">${escapeText(word)}</span>`
      : escapeText(word);
    end = match.index + word.length;
  }
  return output + escapeText(value.slice(end));
}
