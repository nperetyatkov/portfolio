export function initTypographyNoBreaks() {
  const root = document.body;
  if (!root) return;

  const TARGET_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote';
  const SKIP_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'CODE',
    'PRE'
  ]);
  const SKIP_ANCESTOR_SELECTOR = 'a, button, summary, label, input, textarea, select';
  const shortWordsRegex = /(^|[\s\u00A0([{«"'])([A-Za-zА-Яа-яЁё]{1,2}|как|или|для|над|под|при|без|через)\s+/g;

  const targets = root.querySelectorAll(TARGET_SELECTOR);
  targets.forEach((target) => {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const parentElement = node.parentElement;
      const shouldSkipNode = !parentElement
        || SKIP_TAGS.has(parentElement.tagName)
        || Boolean(parentElement.closest(SKIP_ANCESTOR_SELECTOR));

      if (!shouldSkipNode) {
        let source = node.nodeValue;
        let updated = source;

        do {
          source = updated;
          updated = updated.replace(shortWordsRegex, '$1$2\u00A0');
        } while (updated !== source);

        if (updated !== node.nodeValue) {
          node.nodeValue = updated;
        }
      }

      node = walker.nextNode();
    }
  });
}
