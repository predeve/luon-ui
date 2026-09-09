const codeSelector = "code,pre,kbd,samp,[data-luon-code]";

function markCode(root: ParentNode) {
  if (root instanceof Element && root.matches(codeSelector)) {
    root.classList.add("notranslate");
    root.setAttribute("translate", "no");
  }
  root.querySelectorAll(codeSelector).forEach((element) => {
    element.classList.add("notranslate");
    element.setAttribute("translate", "no");
  });
}

export function protectCode(root: ParentNode = document) {
  markCode(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) markCode(node);
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
