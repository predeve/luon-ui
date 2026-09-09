import { safeUrl } from "./editor-markdown.ts";
export type SelectionMark =
  { start: number[]; end: number[]; from: number; to: number } | undefined;
export function selectionMark(root: HTMLElement): SelectionMark {
  const selection = root.ownerDocument.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  )
    return;
  const path = (node: Node) => {
    const result: number[] = [];
    while (node !== root && node.parentNode) {
      result.unshift(
        Array.from(node.parentNode.childNodes).indexOf(node as ChildNode),
      );
      node = node.parentNode;
    }
    return result;
  };
  return {
    start: path(range.startContainer),
    end: path(range.endContainer),
    from: range.startOffset,
    to: range.endOffset,
  };
}
export function restoreMark(root: HTMLElement, mark: SelectionMark) {
  if (!mark) return;
  const node = (path: number[]) =>
    path.reduce<Node>(
      (parent, i) =>
        parent.childNodes[Math.min(i, parent.childNodes.length - 1)] || parent,
      root,
    );
  const start = node(mark.start);
  const end = node(mark.end);
  const size = (item: Node) =>
    item.nodeType === 3 ? item.textContent!.length : item.childNodes.length;
  const range = root.ownerDocument.createRange();
  range.setStart(start, Math.min(mark.from, size(start)));
  range.setEnd(end, Math.min(mark.to, size(end)));
  const selection = root.ownerDocument.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
const markTags: Record<string, string> = {
  bold: "strong",
  italic: "em",
  underline: "u",
  strike: "s",
  code: "code",
};
const aliases: Record<string, string> = {
  strong: "strong,b",
  em: "em,i",
  s: "s,del",
};
function parentElement(node: Node | null) {
  return node?.nodeType === 1 ? (node as Element) : node?.parentElement;
}
export function richActive(root: HTMLElement, name: string, value?: any) {
  const node = parentElement(
    root.ownerDocument.getSelection()?.anchorNode || null,
  );
  if (!node || !root.contains(node)) return false;
  if (name === "align") {
    const block = node.closest("p,div,h1,h2,h3,h4,h5,h6,li,blockquote");
    return ((block as HTMLElement)?.style.textAlign || "left") === value;
  }
  const tag =
    markTags[name] ||
    {
      heading: `h${value?.level || 1}`,
      paragraph: "p",
      bulletList: "ul",
      orderedList: "ol",
      blockquote: "blockquote",
      codeBlock: "pre",
      link: "a",
    }[name];
  return !!tag && !!node.closest(aliases[tag] || tag);
}
export function richCommand(root: HTMLElement, name: string, value?: any) {
  const doc = root.ownerDocument;
  const selection = doc.getSelection();
  if (!selection?.rangeCount) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;
  const select = (node: Node, collapse = false) => {
    const next = doc.createRange();
    next.selectNodeContents(node);
    if (collapse) next.collapse(false);
    selection.removeAllRanges();
    selection.addRange(next);
  };
  const tag = markTags[name];
  if (tag || name === "link") {
    const target = tag || "a";
    const url = name === "link" ? safeUrl(String(value || "")) : "";
    if (name === "link" && !url) return false;
    const active = tag && richActive(root, name);
    const ancestor = parentElement(range.startContainer)?.closest(
      aliases[target] || target,
    );
    if (range.collapsed) {
      if (active && ancestor && root.contains(ancestor)) {
        const tailRange = doc.createRange();
        tailRange.selectNodeContents(ancestor);
        tailRange.setStart(range.startContainer, range.startOffset);
        const tail = ancestor.cloneNode(false) as Element;
        tail.append(tailRange.extractContents());
        const after = doc.createTextNode("\u200b");
        ancestor.after(after, ...(tail.textContent ? [tail] : []));
        range.setStart(after, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const el = doc.createElement(target);
        if (url) el.setAttribute("href", url);
        el.append(doc.createTextNode("\u200b"));
        range.insertNode(el);
        select(el, true);
      }
      return true;
    }
    // Mark each selected text separately, so a selection across paragraphs
    // never wraps block elements in an inline element.
    const walk = doc.createTreeWalker(root, 4);
    const parts: { node: Text; from: number; to: number }[] = [];
    let next: Node | null;
    while ((next = walk.nextNode())) {
      if (!range.intersectsNode(next)) continue;
      const from = next === range.startContainer ? range.startOffset : 0;
      const to =
        next === range.endContainer
          ? range.endOffset
          : next.textContent!.length;
      if (from < to) parts.push({ node: next as Text, from, to });
    }
    const selected: Text[] = [];
    for (const part of parts) {
      let node = part.node;
      if (part.to < node.length) node.splitText(part.to);
      if (part.from) node = node.splitText(part.from);
      selected.push(node);
      const existing = node.parentElement?.closest(aliases[target] || target);
      if (active && existing && root.contains(existing)) {
        // Keep other nested marks when removing only this mark.
        const ancestors: Element[] = [];
        let parent = node.parentElement;
        while (parent && parent !== existing) {
          ancestors.push(parent.cloneNode(false) as Element);
          parent = parent.parentElement;
        }
        // Split the mark around the selected text, retaining adjacent marks.
        const before = doc.createRange();
        before.selectNodeContents(existing);
        before.setEndBefore(node);
        const left = existing.cloneNode(false) as Element;
        left.append(before.extractContents());
        const after = doc.createRange();
        after.selectNodeContents(existing);
        after.setStartAfter(node);
        const right = existing.cloneNode(false) as Element;
        right.append(after.extractContents());
        let selected: Node = node;
        for (const ancestor of ancestors) {
          ancestor.append(selected);
          selected = ancestor;
        }
        existing.replaceWith(
          ...(left.textContent ? [left] : []),
          selected,
          ...(right.textContent ? [right] : []),
        );
      } else if (!existing) {
        const el = doc.createElement(target);
        if (url) el.setAttribute("href", url);
        node.replaceWith(el);
        el.append(node);
      } else if (url) existing.setAttribute("href", url);
    }
    if (selected.length) {
      const next = doc.createRange();
      next.setStart(selected[0]!, 0);
      next.setEnd(selected.at(-1)!, selected.at(-1)!.length);
      selection.removeAllRanges();
      selection.addRange(next);
    }
    return !!selected.length;
  }
  let blocks = Array.from(
    root.querySelectorAll<HTMLElement>("p,h1,h2,h3,h4,h5,h6,pre,li"),
  )
    .filter((el) => range.intersectsNode(el))
    .filter((el) => !el.parentElement?.closest("li,pre"));
  if (!blocks.length) {
    const p = doc.createElement("p");
    if (!root.childNodes.length) p.append(doc.createElement("br"));
    else p.append(...root.childNodes);
    root.append(p);
    blocks = [p];
  }
  if (name === "align") {
    if (!/^(left|center|right|justify)$/.test(value)) return false;
    blocks.forEach((el) => (el.style.textAlign = value));
  } else if (name === "bulletList" || name === "orderedList") {
    const type = name === "bulletList" ? "ul" : "ol";
    const list = blocks[0]!.closest("ul,ol");
    if (list && list.localName === type) {
      const paragraphs = Array.from(list.children).map((li) => {
        const p = doc.createElement("p");
        p.append(...li.childNodes);
        return p;
      });
      list.replaceWith(...paragraphs);
      select(paragraphs[0]!);
    } else if (list) {
      const el = doc.createElement(type);
      el.append(...list.childNodes);
      list.replaceWith(el);
      select(el);
    } else {
      const el = doc.createElement(type);
      blocks[0]!.before(el);
      for (const block of blocks) {
        const li = doc.createElement("li");
        li.append(...block.childNodes);
        el.append(li);
        block.remove();
      }
      select(el);
    }
  } else if (name === "blockquote") {
    const quote = blocks[0]!.closest("blockquote");
    if (quote) {
      const first = quote.firstChild!;
      quote.replaceWith(...quote.childNodes);
      select(first);
    } else {
      const el = doc.createElement("blockquote");
      blocks[0]!.before(el);
      el.append(...blocks);
      select(el);
    }
  } else if (["heading", "paragraph", "codeBlock"].includes(name)) {
    const kind =
      name === "heading"
        ? `h${Math.max(1, Math.min(6, value?.level || 1))}`
        : name === "codeBlock"
          ? "pre"
          : "p";
    const replacements = blocks.map((block) => {
      const el = doc.createElement(kind);
      if (kind === "pre") {
        const code = doc.createElement("code");
        code.textContent = block.textContent;
        el.append(code);
      } else el.append(...block.childNodes);
      el.style.textAlign = block.style.textAlign;
      block.replaceWith(el);
      return el;
    });
    select(replacements[0]!);
  } else return false;
  return true;
}
