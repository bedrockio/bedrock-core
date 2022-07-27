import { mdastToMarkdown } from './utils';

const DRAFT_LIST_ITEM_TYPES = ['ordered-list-item', 'unordered-list-item'];

const DRAFT_INLINE_TO_MDAST = {
  STRIKETHROUGH: 'delete',
  ITALIC: 'emphasis',
  CODE: 'inlineCode',
  BOLD: 'strong',
};

const DRAFT_INLINE_TO_HAST = {
  SUPERSCRIPT: 'sup',
  SUBSCRIPT: 'sub',
};

const DRAFT_HEADINGS = [
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
];

const DRAFT_TO_TAG = {
  unstyled: 'p',
  'header-one': 'h1',
  'header-two': 'h2',
  'header-three': 'h3',
  'header-four': 'h4',
  'header-five': 'h5',
  'header-six': 'h6',
};

const MDAST_TO_TAG = {
  delete: 'del',
  emphasis: 'em',
  strong: 'strong',
};

const COLLAPSABLE_TYPES = ['blockquote', 'code-block'];

export default function draftToMarkdown(rawObject) {
  let { blocks, entityMap } = rawObject;

  blocks = collapseAdjacentBlocks(blocks);

  let root = {
    type: 'root',
    children: [],
  };

  const nodes = [root];

  function getCurrentNode() {
    return nodes[nodes.length - 1];
  }

  function openNode(node) {
    node = {
      ...node,
      children: [],
    };
    closeTextNode();
    getCurrentNode().children.push(node);
    nodes.push(node);
  }

  function closeNode() {
    closeTextNode();
    nodes.pop();
  }

  function openTextNode() {
    const current = getCurrentNode();
    if (current.type !== 'text') {
      openNode({
        type: 'text',
        value: '',
      });
    }
  }

  function pushText(text) {
    let current = getCurrentNode();
    if (current.type === 'inlineCode') {
      current.value += text;
    } else {
      openTextNode();
      current = getCurrentNode();
      current.value += text;
    }
  }

  function closeTextNode() {
    const current = getCurrentNode();
    if (current.type === 'text') {
      nodes.pop();
    }
  }

  function findHtmlNode() {
    for (let i = nodes.length - 1; i > 0; i--) {
      const node = nodes[i];
      if (node.type === 'html') {
        return node;
      }
    }
  }

  function openRange(range) {
    const { key, style } = range;
    if (style) {
      if (style in DRAFT_INLINE_TO_MDAST) {
        openNode({
          type: DRAFT_INLINE_TO_MDAST[style],
          value: '',
        });
      } else if (style in DRAFT_INLINE_TO_HAST) {
        openNode({
          type: 'html',
          value: '',
        });
      } else {
        openNode({
          // Unknown styles will be assumed as "emphasis". This
          // includes UNDERLINE which is supported in draft but
          // not markdown.
          type: 'emphasis',
          value: '',
        });
      }
    } else if (key in entityMap) {
      const entity = entityMap[key];
      openNode({
        type: 'link',
        url: entity.data.url,
      });
    }
  }

  function closeRange(range) {
    const { style } = range;
    if (style in DRAFT_INLINE_TO_HAST) {
      const tag = DRAFT_INLINE_TO_HAST[style];
      const htmlNode = findHtmlNode();
      htmlNode.value = `<${tag}>${getNodeValue(htmlNode)}</${tag}>`;
      closeNode();
    } else {
      closeNode();
    }
  }

  function processContent(block, allowBreak = true) {
    let { text, entityRanges, inlineStyleRanges } = block;
    const ranges = [...inlineStyleRanges, ...entityRanges];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const openedRanges = ranges.filter((range) => {
        return range.offset === i;
      });
      const closedRanges = ranges.filter((range) => {
        return range.offset + range.length === i + 1;
      });
      openedRanges.forEach((range) => {
        openRange(range);
      });

      if (char === '\n' && allowBreak) {
        openNode({
          type: 'break',
        });
        closeNode();
      } else {
        pushText(char);
      }

      closedRanges.forEach((range) => {
        closeRange(range);
      });
    }
  }

  let currentDepth = 0;

  function syncListLevel(block) {
    const { type, depth } = block;
    if (isListItemType(type)) {
      if (currentDepth < depth + 1) {
        openNode({
          type: 'list',
          spread: false,
          ordered: type === 'ordered-list-item',
        });
        currentDepth++;
      } else if (currentDepth > depth + 1) {
        closeListNode();
        closeListItemNode();
        currentDepth--;
      } else {
        closeListItemNode();
      }
      openListItemNode();
    } else {
      while (currentDepth > 0) {
        closeListNode();
        currentDepth--;
      }
    }
  }

  function closeListNode() {
    closeListItemNode();
    const current = getCurrentNode();
    if (current.type === 'list') {
      nodes.pop();
    }
  }

  function closeListItemNode() {
    const current = getCurrentNode();
    if (current.type === 'listItem') {
      nodes.pop();
    }
  }

  function openListItemNode() {
    const current = getCurrentNode();
    if (current.type !== 'listItem') {
      openNode({
        type: 'listItem',
        spread: false,
      });
    }
  }

  function getAtomicEntity(block) {
    const [first] = block.entityRanges;
    const entity = entityMap[first?.key];
    if (entity?.mutability === 'IMMUTABLE') {
      return entity;
    }
  }

  for (let block of blocks) {
    let { type, text } = block;

    if (text.startsWith('$$') && text.endsWith('$$')) {
      type = 'math-block';
    }

    syncListLevel(block);

    if (type === 'atomic') {
      if (isHorizontalRule(block)) {
        openNode({
          type: 'thematicBreak',
        });
        closeNode();
      } else if (isRawMarkdown(block)) {
        openNode({
          type: 'html',
          value: block.data.source || '',
        });
        closeNode();
      } else if (isIframe(block)) {
        openNode({
          type: 'html',
          value: getIframeHtml(block),
        });
        closeNode();
      } else {
        const entity = getAtomicEntity(block);
        if (entity?.type === 'IMAGE') {
          if (canRenderImageAsMarkdown(entity)) {
            const { src, title } = entity.data || {};
            openNode({
              type: 'image',
              url: src,
              alt: title,
            });
            closeNode();
          } else {
            openNode({
              type: 'html',
              value: getImageHtml(entity),
            });
            closeNode();
          }
        } else if (entity?.type === 'TABLE') {
          const { align, rows = [] } = entity.data || {};
          openNode({
            type: 'table',
            align,
          });
          for (let row of rows) {
            openNode({
              type: 'tableRow',
            });
            for (let cell of row) {
              openNode({
                type: 'tableCell',
              });
              pushText(cell);
              openTextNode();
              closeTextNode();

              closeNode();
            }
            closeNode();
          }
          closeNode();
        }
      }
    } else if (type === 'code-block') {
      const lang = block.data?.language;
      openNode({
        type: 'code',
        lang,
        value: block.text,
      });
      closeNode();
    } else if (type === 'math-block') {
      openNode({
        type: 'paragraph',
      });
      processContent(block, false);
      closeNode();
    } else if (type === 'blockquote') {
      openNode({
        type: 'blockquote',
      });
      openNode({
        type: 'paragraph',
      });
      processContent(block, false);
      closeNode();
      closeNode();
    } else if (isListItemType(type)) {
      openNode({
        type: 'paragraph',
      });
      processContent(block);
      closeNode();
    } else if (text) {
      if (canRenderProseAsMarkdown(block)) {
        openNode(getProseAttributes(type));
        processContent(block);
        closeNode();
      } else {
        openNode({
          type: 'html',
        });
        processContent(block);
        closeTextNode();
        collapseProseHtml(block, getCurrentNode());
        closeNode();
      }
    }
  }

  let md = mdastToMarkdown(root);

  // Restore trailing lines that were lost in conversion.
  md += getTrailingLines(blocks);

  return md;
}

// Block Utils

function collapseAdjacentBlocks(blocks) {
  const result = [];
  let last;
  for (let block of blocks) {
    if (canCollapseBlocks(block, last)) {
      const offset = last.text.length;

      last.text += '\n' + block.text;

      for (let range of block.entityRanges) {
        last.entityRanges.push({
          ...range,
          offset: range.offset + offset + 1,
        });
      }
      for (let range of block.inlineStyleRanges) {
        last.inlineStyleRanges.push({
          ...range,
          offset: range.offset + offset + 1,
        });
      }
    } else {
      last = block;
      result.push(block);
    }
  }

  return result;
}

function canCollapseBlocks(b1, b2) {
  const { type: type1, data: data1, text: text1 = '' } = b1 || {};
  const { type: type2, data: data2, text: text2 = '' } = b2 || {};
  if (type1 !== type2) {
    return false;
  } else if (type1 === 'unstyled') {
    const { alignment: alignment1 } = data1 || {};
    const { alignment: alignment2 } = data2 || {};
    return alignment1 === alignment2 && text1.trim() && text2.trim();
  } else {
    return COLLAPSABLE_TYPES.includes(type1);
  }
}

function getTrailingLines(blocks) {
  let count = 0;
  for (let i = blocks.length - 1; i > 0; i--) {
    const { type, text } = blocks[i] || {};
    if (type === 'unstyled' && text === '') {
      count++;
    } else {
      break;
    }
  }
  return '\n'.repeat(count);
}

// Prose Types

function getProseAttributes(type) {
  const depth = DRAFT_HEADINGS.indexOf(type) + 1;
  if (depth > 0) {
    return {
      type: 'heading',
      depth,
    };
  } else {
    return {
      type: 'paragraph',
    };
  }
}

function canRenderProseAsMarkdown(block) {
  const { alignment = 'left' } = block.data || {};
  return alignment === 'left';
}

function collapseProseHtml(block, node) {
  const { alignment = 'left' } = block.data || {};
  const tag = DRAFT_TO_TAG[block.type];
  const inner = getNodeValue(node);
  const value = `<${tag} class="${alignment}">${inner}</${tag}>`;
  node.value = value;
  delete node.children;
}

function getNodeValue(node) {
  const { type } = node;
  if (type === 'text') {
    return node.value;
  } else if (type === 'break') {
    return '';
  } else if (type === 'inlineCode') {
    return `<code>${node.value}</code>`;
  } else {
    const tag = MDAST_TO_TAG[type];
    let value = node.children
      .map((child) => {
        return getNodeValue(child);
      })
      .join('');
    if (type === 'link') {
      const { url } = node;
      value = `<a href="${url}">${value}</a>`;
    } else if (tag) {
      value = `<${tag}>${value}</${tag}>`;
    }
    return value;
  }
}

// Images

function canRenderImageAsMarkdown(imageEntity) {
  const { width, alignment } = imageEntity.data || {};
  return width == null && alignment == null;
}

function getImageHtml(imageEntity) {
  const { src, title, width, alignment } = imageEntity.data || {};
  const attributes = {
    src,
    alt: title,
    class: alignment,
    style: width ? `width: ${width}%` : null,
  };

  return `<img ${attributesToString(attributes)}>`;
}

// Iframes

function isIframe(block) {
  return block.data?.type === 'iframe';
}

function getIframeHtml(block) {
  const { src, allow } = block.data;
  if (!src) {
    return '';
  }
  const attributes = {
    src,
    allow,
  };
  return `<iframe ${attributesToString(attributes)}></iframe>`;
}

// Horizontal Rule

function isHorizontalRule(block) {
  return block.data?.type === 'horizontal-rule';
}

// Raw Markdown (tables)

function isRawMarkdown(block) {
  return block.data?.type === 'markdown';
}

// List Items

function isListItemType(type) {
  return DRAFT_LIST_ITEM_TYPES.includes(type);
}

// Util

function attributesToString(attr) {
  return Object.entries(attr)
    .map(([key, val]) => {
      if (val) {
        return `${key}="${val}"`;
      }
    })
    .filter((attr) => attr)
    .join(' ');
}
