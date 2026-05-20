/**
 * splitWords — splits text nodes in an element into animated word spans,
 * preserving child elements like gradient <span>s intact.
 * Returns the inner word spans for GSAP to animate.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const wordEls: HTMLElement[] = [];

  const processNode = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const tokens = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();

      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else if (token.length > 0) {
          const outer = document.createElement("span");
          outer.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
          const inner = document.createElement("span");
          inner.style.cssText = "display:inline-block;";
          inner.textContent = token;
          outer.appendChild(inner);
          frag.appendChild(outer);
          wordEls.push(inner);
        }
      });

      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Wrap element child (e.g. <span class="gradient-text">) as one unit
      const outer = document.createElement("span");
      outer.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
      const inner = document.createElement("span");
      inner.style.cssText = "display:inline-block;";
      node.parentNode?.replaceChild(outer, node);
      inner.appendChild(node);
      outer.appendChild(inner);
      wordEls.push(inner);
    }
  };

  // Clone child nodes before iterating (live NodeList mutates)
  Array.from(el.childNodes).forEach(processNode);
  return wordEls;
}
