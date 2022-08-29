import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMdast } from 'hast-util-to-mdast';

import { unescapeMathTokens } from './math';

export function mdastToMarkdown(mdast) {
  let md = toMarkdown(mdast, {
    extensions: [gfmToMarkdown()],
    // Use - for unordered lists.
    bullet: '-',
    // Indent list items with one space.
    listItemIndent: 'one',
    // Use _ for italic emphasis.
    emphasis: '_',
    // Always use ``` fences for code blocks whether
    // or not a language has been defined.
    fences: true,
    // Use --- for thematic breaks, ie horizontal rule.
    rule: '-',
  });

  return unescapeMathTokens(md);
}

export function hastToMarkdown(hast) {
  const mdast = toMdast(hast, {
    handlers: {
      br(h, node) {
        // Allow <br> tags in table cells, etc.
        // These are being allowed as a special case.
        return h.wrapText ? h(node, 'break') : h(node, 'html', '<br>');
      },
    },
  });
  return mdastToMarkdown(mdast);
}
