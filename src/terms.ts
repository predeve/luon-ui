export const technicalTerms = [
  "@luon/act",
  "@luon/acts",
  "@luon/cdn",
  "@luon/cli",
  "@luon/docs",
  "@luon/editor",
  "@luon/network",
  "@luon/provider",
  "@luon/rule",
  "@luon/runner",
  "@luon/runtime",
  "@luon/style",
  "@luon/ui",
  "@luon/ux",
  "@luon/view",
  "@luon/views",
  "@luon/worker",
  "Luon Act",
  "Luon CDN",
  "Luon CLI",
  "Luon Core",
  "Luon Docs",
  "Luon Editor",
  "Luon Gateway",
  "Luon Hub",
  "Luon Network",
  "Luon Provider",
  "Luon Rule",
  "Luon Runner",
  "Luon Runtime",
  "Luon Site",
  "Luon Sites",
  "Luon Style",
  "Luon UI",
  "Luon UX",
  "Luon View",
  "Luon Views",
  "Luon Worker",
  "Luon Workers",
  "Tailwind CSS",
  "JavaScript",
  "PostgreSQL",
  "TypeScript",
  "WebSocket",
  "shadcn/ui",
  "Network",
  "Gateway",
  "Templates",
  "Provider",
  "Runtime",
  "Template",
  "Workers",
  "Worker",
  "Prisma",
  "Runner",
  "Style",
  "React",
  "Preact",
  "Redis",
  "Nuxt",
  "Vue",
  "OAuth",
  "Sites",
  "Core",
  "Hub",
  "Site",
  "Views",
  "View",
  "Rules",
  "Rule",
  "Editor",
  "Docs",
  "Luon",
  "Act",
  "APIs",
  "Bun",
  "API",
  "CLI",
  "CDN",
  "CSR",
  "CSS",
  "DOM",
  "DB",
  "HMR",
  "HTML",
  "HTTP",
  "JSON",
  "MCP",
  "PM2",
  "SSE",
  "SSR",
  "TSX",
  "URL",
  "UX",
] as const;

const termPattern = new RegExp(
  `(^|[^A-Za-z0-9_])(${[...technicalTerms]
    .sort((left, right) => right.length - left.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})(?=$|[^A-Za-z0-9_])`,
  "g",
);

export type TermPart = {
  protected: boolean;
  value: string;
};

export function splitTerms(value: string) {
  const parts: TermPart[] = [];
  let cursor = 0;
  value.replace(termPattern, (match, prefix, term, offset) => {
    const start = Number(offset) + String(prefix).length;
    if (start > cursor) {
      parts.push({ protected: false, value: value.slice(cursor, start) });
    }
    parts.push({ protected: true, value: String(term) });
    cursor = start + String(term).length;
    return String(match);
  });
  if (cursor < value.length) {
    parts.push({ protected: false, value: value.slice(cursor) });
  }
  return parts;
}

export function protectTermsHtml(value: string) {
  return splitTerms(value).map((part) => part.protected
    ? `<span class="notranslate" data-luon-term="" translate="no">${
      part.value}</span>`
    : part.value).join("");
}

const rawTags = new Set([
  "code",
  "kbd",
  "pre",
  "samp",
  "script",
  "style",
  "textarea",
  "title",
]);

export function protectTextHtml(html: string) {
  let rawDepth = 0;
  return html.replace(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g, (part) => {
    if (!part.startsWith("<")) {
      return rawDepth ? part : protectTermsHtml(part);
    }
    const close = part.match(/^<\s*\/\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
    if (close && rawTags.has(close)) rawDepth = Math.max(0, rawDepth - 1);
    const open = part.match(/^<\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
    if (open && rawTags.has(open) && !part.endsWith("/>")) rawDepth += 1;
    return part;
  });
}

export function protectCodeHtml(html: string) {
  return html.replace(
    /<(code|kbd|pre|samp)(?=[\s>])/g,
    '<$1 class="notranslate" translate="no"',
  );
}
