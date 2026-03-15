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
  const SHORT_WORD_MAX_LENGTH = 3;
  const shortWordPattern = `[\\p{L}]{1,${SHORT_WORD_MAX_LENGTH}}`;
  const WORD_BOUNDARY_PREFIX = `(^|[\\s\\u00A0(\\[{«"'.,!?;:—–])`;
  const shortWordChainRegex = new RegExp(
    `${WORD_BOUNDARY_PREFIX}((?:(?:${shortWordPattern})\\s+){1,3})([\\p{L}\\p{N}][\\p{L}\\p{N}-]*)`,
    'giu'
  );
  const shortConnectorRegex = new RegExp(
    `${WORD_BOUNDARY_PREFIX}(${shortWordPattern})\\s+`,
    'giu'
  );
  const numberWithNextWordRegex = new RegExp(
    `${WORD_BOUNDARY_PREFIX}((?:№\\s*)?\\d[\\d.,\\-–—/]*)\\s+([\\p{L}][\\p{L}\\p{N}-]*)`,
    'giu'
  );
  const numberWithPunctuationAndNextWordRegex = new RegExp(
    `${WORD_BOUNDARY_PREFIX}((?:№\\s*)?\\d[\\d.,\\-–—/]*[,:;])\\s+([\\p{L}][\\p{L}\\p{N}-]*)`,
    'giu'
  );
  const postfixParticleRegex = /([\p{L}\p{N}]+)-(то|либо|нибудь)(?=$|[^\p{L}\p{N}_])/giu;
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
      updated = updated.replace(numberWithNextWordRegex, '$1$2\u00A0$3');
      updated = updated.replace(numberWithPunctuationAndNextWordRegex, '$1$2\u00A0$3');
      updated = updated.replace(postfixParticleRegex, '$1\u2060-\u2060$2');
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
