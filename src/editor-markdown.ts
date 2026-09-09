import { escapeText } from "./editor-syntax.ts";
const tags = new Set(
  "p br h1 h2 h3 h4 h5 h6 strong b em i u s del blockquote "
    .concat("pre code ul ol li a hr div span")
    .split(" "),
);
const blocked = new Set(
  "script style iframe object embed svg math template".split(" "),
);
export function safeUrl(value: string) {
  const url = value.trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/[^/]|\.\.?\/)/i.test(url) ||
    (!/[:\\\u0000-\u0020]/.test(url) && !url.startsWith("//"))
    ? url
    : "";
}
export function cleanHTML(value: string, doc: Document) {
  const template = doc.createElement("template");
  template.innerHTML = value;
  const clean = (parent: ParentNode) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 8) {
        node.remove();
        continue;
      }
      if (node.nodeType !== 1) continue;
      const el = node as HTMLElement;
      const name = el.localName;
      if (blocked.has(name)) {
        el.remove();
        continue;
      }
      clean(el);
      if (!tags.has(name)) {
        el.replaceWith(...el.childNodes);
        continue;
      }
      const href = name === "a" ? safeUrl(el.getAttribute("href") || "") : "";
      const align = el.style.textAlign;
      const start = name === "ol" ? el.getAttribute("start") : null;
      const language =
        name === "code" ? el.getAttribute("data-language") : null;
      for (const attr of Array.from(el.attributes))
        el.removeAttribute(attr.name);
      if (href) {
        el.setAttribute("href", href);
        el.setAttribute("rel", "noopener noreferrer");
      }
      if (/^(left|center|right|justify)$/.test(align))
        el.style.textAlign = align;
      if (start && /^\d+$/.test(start)) el.setAttribute("start", start);
      if (language && /^[\w+-]+$/.test(language)) {
        el.setAttribute("data-language", language);
      }
    }
  };
  clean(template.content);
  return template.innerHTML;
}
function inline(value: string) {
  const saved: string[] = [];
  const keep = (html: string) => `\u0000${saved.push(html) - 1}\u0000`;
  let text = value.replace(/\\([\\`*_[\]{}()#+.!>~-])/g, (_, char) =>
    keep(escapeText(char)),
  );
  text = text.replace(/(`+)([^\n]+?)\1(?!`)/g, (_, _fence, code) =>
    keep(`<code>${escapeText(code)}</code>`),
  );
  text = escapeText(text);
  text = text.replace(/\[([^\]\n]+)\]\(([^\s)]+)\)/g, (_, label, url) => {
    const safe = safeUrl(url.replaceAll("&amp;", "&"));
    return safe ? keep(`<a href="${escapeText(safe)}">${label}</a>`) : label;
  });
  text = text
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
    .replace(/~~([^~\n]+)~~/g, "<s>$1</s>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, "$1<em>$2</em>")
    .replace(/ {2}\n/g, "<br>")
    .replace(/\\([\\`*_[\]{}()#+.!>-])/g, "$1");
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => saved[+index]!);
}
export function fromMarkdown(value: string, doc: Document): string {
  const lines = value.replaceAll("\r\n", "\n").split("\n");
  const output: string[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith(fence[1]!)) {
        body.push(lines[i++]!);
      }
      if (i < lines.length) i++;
      const language = fence[2]!.trim().split(/\s/)[0] || "";
      output.push(
        `<pre><code data-language="${escapeText(language)}">` +
          `${escapeText(body.join("\n"))}</code></pre>`,
      );
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const n = heading[1]!.length;
      output.push(`<h${n}>${inline(heading[2]!)}</h${n}>`);
      i++;
      continue;
    }
    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
      output.push("<hr>");
      i++;
      continue;
    }
    if (/^>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>/.test(lines[i]!)) {
        body.push(lines[i++]!.replace(/^> ?/, ""));
      }
      output.push(
        `<blockquote>${fromMarkdown(body.join("\n"), doc)}</blockquote>`,
      );
      continue;
    }
    const list = /^(\s*)([-+*]|\d+[.)])\s+(.*)$/.exec(line);
    if (list) {
      const ordered = /^\d/.test(list[2]!);
      const tag = ordered ? "ol" : "ul";
      const start = ordered ? ` start="${parseInt(list[2]!)}"` : "";
      const items: string[] = [];
      while (i < lines.length) {
        const item = /^(\s*)([-+*]|\d+[.)])\s+(.*)$/.exec(lines[i]!);
        if (!item || /^\d/.test(item[2]!) !== ordered) break;
        const body = [item[3]!];
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]!)) {
          body.push(lines[i++]!.replace(/^ {2,4}/, ""));
        }
        items.push(`<li>${fromMarkdown(body.join("\n"), doc)}</li>`);
      }
      output.push(`<${tag}${start}>${items.join("")}</${tag}>`);
      continue;
    }
    // HTML blocks preserve alignment and supported rich formatting in Markdown.
    if (/^\s*<(?:p|div|h[1-6]|ul|ol|blockquote|pre|u|s|a|hr)\b/i.test(line)) {
      const body = [line];
      i++;
      while (i < lines.length && lines[i]!.trim()) body.push(lines[i++]!);
      output.push(cleanHTML(body.join("\n"), doc));
      continue;
    }
    const body = [line];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !/^(#{1,6}\s|>|[-+*]\s|\d+[.)]\s|`{3}|~{3})/.test(lines[i]!)
    ) {
      body.push(lines[i++]!);
    }
    output.push(`<p>${inline(body.join("\n"))}</p>`);
  }
  return cleanHTML(output.join(""), doc);
}
export function toMarkdown(html: string, doc: Document) {
  const root = doc.createElement("div");
  root.innerHTML = cleanHTML(html, doc);
  const render = (node: Node): string => {
    if (node.nodeType === 3)
      return (node.textContent || "")
        .replace(/([\\`*_[\]<>#+!~-])/g, "\\$1")
        .replace(/^(\s*\d+)\./gm, "$1\\.");
    if (node.nodeType !== 1) return "";
    const el = node as HTMLElement;
    const tag = el.localName;
    if (el.style.textAlign || ["u", "span"].includes(tag)) return el.outerHTML;
    const body = Array.from(el.childNodes).map(render).join("");
    if (/^h[1-6]$/.test(tag)) return `${"#".repeat(+tag[1]!)} ${body}\n\n`;
    if (["p", "div"].includes(tag)) return `${body}\n\n`;
    if (["b", "strong"].includes(tag)) return `**${body}**`;
    if (["i", "em"].includes(tag)) return `*${body}*`;
    if (["s", "del"].includes(tag)) return `~~${body}~~`;
    if (tag === "br") return "  \n";
    if (tag === "hr") return "---\n\n";
    if (tag === "a") return `[${body}](${el.getAttribute("href") || ""})`;
    if (tag === "pre") {
      const code = el.textContent || "";
      const longest = Math.max(
        2,
        ...Array.from(code.matchAll(/`+/g), (m) => m[0].length),
      );
      const fence = "`".repeat(longest + 1);
      const language =
        el.querySelector("code")?.getAttribute("data-language") || "";
      return `${fence}${language}\n${code}\n${fence}\n\n`;
    }
    if (tag === "code") {
      const code = el.textContent || "";
      const fence = "`".repeat(
        Math.max(0, ...Array.from(code.matchAll(/`+/g), (m) => m[0].length)) +
          1,
      );
      return `${fence}${code}${fence}`;
    }
    if (tag === "blockquote")
      return (
        body
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      );
    if (tag === "ul" || tag === "ol") {
      return (
        Array.from(el.children)
          .map((li, i) => {
            const prefix =
              tag === "ul"
                ? "- "
                : `${i + Number(el.getAttribute("start") || 1)}. `;
            return prefix + render(li).trim().replaceAll("\n", "\n  ");
          })
          .join("\n") + "\n\n"
      );
    }
    return body;
  };
  // Keep HTML-containing blocks whole for a lossless rich round trip.
  return Array.from(root.childNodes)
    .map((node) => {
      if (
        node.nodeType === 1 &&
        (node as Element).querySelector("u, [style], span")
      )
        return (node as Element).outerHTML + "\n\n";
      return render(node);
    })
    .join("")
    .trim();
}
