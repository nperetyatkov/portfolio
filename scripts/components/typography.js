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
  const SHORT_CONNECTOR_WORDS = [
    'а',
    'без',
    'в',
    'во',
    'для',
    'до',
    'и',
    'из',
    'изо',
    'или',
    'к',
    'как',
    'ко',
    'на',
    'над',
    'не',
    'но',
    'о',
    'об',
    'обо',
    'от',
    'по',
    'под',
    'при',
    'про',
    'с',
    'со',
    'у',
    'через'
  ];
  const shortWordPattern = `(?:${SHORT_CONNECTOR_WORDS.join('|')}|[A-Za-zА-Яа-яЁё]{1,2})`;
  const shortWordChainRegex = new RegExp(
    `(^|[\\s\\u00A0(\\[{«"'])((?:(?:${shortWordPattern})\\s+){1,3})([\\p{L}\\p{N}][\\p{L}\\p{N}-]*)`,
    'giu'
  );
  const shortConnectorRegex = new RegExp(
    `(^|[\\s\\u00A0(\\[{«"'])(${shortWordPattern})\\s+`,
    'giu'
  );
  const trailingShortWordRegex = /(\S+)\s+([A-Za-zА-Яа-яЁё]{1,3}[.!?…»"]?)$/u;

  const applyTypographyRules = (value) => {
    let updated = value;

    do {
      value = updated;
      updated = updated.replace(shortWordChainRegex, (match, prefix, shortChain, nextWord) => {
        const normalizedShortChain = shortChain.trim().split(/\s+/u).join('\u00A0');
        return `${prefix}${normalizedShortChain}\u00A0${nextWord}`;
      });
      updated = updated.replace(shortConnectorRegex, '$1$2\u00A0');
    } while (updated !== value);

    return updated.replace(trailingShortWordRegex, '$1\u00A0$2');
  };

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
        const updated = applyTypographyRules(node.nodeValue || '');

        if (updated !== node.nodeValue) {
          node.nodeValue = updated;
        }
      }

      node = walker.nextNode();
    }
  });
}
