import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toHast } from 'mdast-util-to-hast';
import { gfm } from 'micromark-extension-gfm';
import { sanitize, defaultSchema } from 'hast-util-sanitize';
import { raw } from 'hast-util-raw';

import { hastToMarkdown } from './utils';
import { escapeMathTokens } from './math';

const HAST_BLOCKS_TO_DRAFT = {
  p: 'unstyled',
  h1: 'header-one',
  h2: 'header-two',
  h3: 'header-three',
  h4: 'header-four',
  h5: 'header-five',
  h6: 'header-six',
  blockquote: 'blockquote',
};

const HAST_INLINE_TO_DRAFT = {
  del: 'STRIKETHROUGH',
  sup: 'SUPERSCRIPT',
  sub: 'SUBSCRIPT',
  strong: 'BOLD',
  code: 'CODE',
  em: 'ITALIC',
  i: 'ITALIC',
  b: 'BOLD',
};

const BLOCK_NODES = [
  'root',
  'table',
  'thead',
  'tbody',
  'blockquote',
  'ul',
  'ol',
  'li',
  'tr',
  'p',
];

const ALIGNMENTS = ['left', 'right', 'center', 'float-left', 'float-right'];

export default function markdownToDraft(md) {
  md = escapeMathTokens(md);

  // Get trailing lines before markdown is converted.
  // These will be added to the blocks so that new
  // lines can be preserved.
  const trailingLines = getTrailingLines(md);

  let mdast = fromMarkdown(md, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  // Convert mdast to hast tree allowing HTML
  let hast = toHast(mdast, {
    allowDangerousHtml: true,
  });

  // Convert raw html into nodes
  hast = raw(hast);

  // Sanitize converted html nodes
  hast = sanitize(hast, {
    ...defaultSchema,
    tagNames: [...defaultSchema.tagNames, 'iframe'],
    attributes: {
      ...defaultSchema.attributes,
      iframe: ['src', 'allow'],
      code: ['className'],
      img: ['src', 'alt', 'style', 'className'],
      h1: ['className'],
      h2: ['className'],
      h3: ['className'],
      h4: ['className'],
      h5: ['className'],
      h6: ['className'],
      p: ['className'],
    },
  });

  return hastRootToDraft(hast, trailingLines);
}

function hastRootToDraft(root, trailingLines) {
  const blocks = [];
  const entityMap = {};

  let currentBlock;
  let currentRanges;
  let currentPosition;
  let currentBlockType;
  let openListTypes = [];
  let entityKey = 0;

  function pushBlock(type, append) {
    const block = {
      type,
      text: '',
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      ...append,
    };
    blocks.push(block);
    return block;
  }

  function openBlock(type, append) {
    const block = pushBlock(type, append);
    currentBlock = block;
    currentRanges = [];
    currentPosition = 0;
  }

  function closeBlock() {
    currentBlock = null;
  }

  function pushInlineStyleRange(style) {
    const range = {
      style,
      length: 0,
      offset: currentPosition,
    };
    currentBlock.inlineStyleRanges.push(range);
    currentRanges.push(range);
  }

  function pushEntityRange(entity) {
    const key = entityKey++;
    const { mutability } = entity;
    const isImmutable = mutability === 'IMMUTABLE';
    const range = {
      key,
      length: isImmutable ? 1 : 0,
      offset: currentPosition,
    };
    entityMap[key] = entity;
    currentBlock.entityRanges.push(range);
    currentRanges.push(range);
    if (isImmutable) {
      currentBlock.type = 'atomic';
      currentBlock.text = ' ';
    }
  }

  function pushLink(url) {
    pushEntityRange({
      data: {
        url,
      },
      mutability: 'MUTABLE',
      type: 'LINK',
    });
  }

  function pushImage(data) {
    pushEntityRange({
      data,
      mutability: 'IMMUTABLE',
      type: 'IMAGE',
    });
  }

  walkNodes(root, (node, next, depth) => {
    let { type, tagName, value } = node;
    if (type === 'text') {
      if (depth === 1) {
        pushBlock('unstyled');
      } else if (currentBlock) {
        currentBlock.text += value;
        currentPosition += value.length;
        for (let range of currentRanges) {
          range.length += value.length;
        }
      }
      next();
    } else if (type === 'element') {
      if (tagName === 'ol') {
        openListTypes.push('ordered');
        next();
        openListTypes.pop();
      } else if (tagName === 'ul') {
        openListTypes.push('unordered');
        next();
        openListTypes.pop();
      } else if (tagName === 'li') {
        const currentListType = openListTypes[openListTypes.length - 1];
        const depth = openListTypes.length - 1;
        openBlock(`${currentListType}-list-item`, {
          depth,
        });
        next();
        closeBlock();
      } else if (tagName === 'pre') {
        const [code] = node.children;
        const { className = [] } = code.properties;
        const language =
          className
            .map((str) => {
              return str.match(/language-(\w+)/)?.[1];
            })
            .find((lang) => lang) || '';
        const data = {
          language,
        };
        const text = getNodeTextContent(node).slice(0, -1);
        for (let line of text.split('\n')) {
          pushBlock('code-block', {
            text: line,
            data,
          });
        }
      } else if (tagName === 'code') {
        pushInlineStyleRange('CODE');
        next();
        currentRanges.pop();
      } else {
        const blockType = HAST_BLOCKS_TO_DRAFT[tagName];
        const inlineStyle = HAST_INLINE_TO_DRAFT[tagName];
        if (blockType) {
          if (currentBlock) {
            next();
          } else {
            openBlock(blockType, proseNodeToData(node));
            next();
            closeBlock();
          }
        } else if (inlineStyle) {
          pushInlineStyleRange(inlineStyle);
          next();
          currentRanges.pop();
        } else if (tagName === 'a') {
          pushLink(node.properties.href);
          next();
          currentRanges.pop();
        } else if (tagName === 'img') {
          if (!currentBlock) {
            openBlock('unstyled');
          }
          pushImage(imageNodeToData(node));
          next();
          currentRanges.pop();
          closeBlock();
        } else if (tagName === 'table') {
          // Tables allow flow content within cells which is simply too complex for
          // draft to handle properly, so convert the node back to raw markdown and
          // define a new type of atomic block that will render it from the raw source.
          pushBlock('atomic', {
            data: {
              type: 'markdown',
              source: hastToMarkdown(node).trim(),
            },
          });
        } else if (tagName === 'br') {
          next();
        } else if (tagName === 'li') {
          openBlock(currentBlockType);
          next();
          closeBlock();
        } else if (tagName === 'hr') {
          pushBlock('atomic', {
            data: {
              type: 'horizontal-rule',
            },
          });
        } else if (tagName === 'iframe') {
          const { src = '', allow } = node.properties || {};
          pushBlock('atomic', {
            data: {
              src,
              type: 'iframe',
              ...(allow && {
                allow,
              }),
            },
          });
        } else {
          // eslint-disable-next-line
          console.error(`Unsupported tag ${tagName}.`);
        }
      }
    } else if (type === 'root') {
      next();
    } else {
      // eslint-disable-next-line
      console.error(`Unsupported type ${type}.`);
    }
  });

  for (let i = 0; i < trailingLines - 1; i++) {
    pushBlock('unstyled');
  }

  return {
    blocks,
    entityMap,
  };
}

function getTrailingLines(md) {
  return md.match(/\s*$/)[0].split('\n').length - 1;
}

function walkNodes(node, fn, depth = 0) {
  let { children = [] } = node;

  // If the parent is block-level trim and
  // filter out text nodes at the edges.
  if (isBlockNode(node)) {
    children = children.filter((child, i, arr) => {
      if (child.type === 'text') {
        if (i === 0) {
          if (isBlockNode(arr[i + 1])) {
            child.value = child.value.trimEnd();
          }
        } else if (i === arr.length - 1) {
          if (isBlockNode(arr[i - 1])) {
            child.value = child.value.trimStart();
          }
        }
        return child.value;
      }
      return true;
    });
  }

  function next() {
    for (let child of children) {
      walkNodes(child, fn, depth + 1);
    }
  }
  fn(node, next, depth);
}

function isBlockNode(node) {
  return BLOCK_NODES.includes(node?.tagName || node?.type);
}

function imageNodeToData(node) {
  const { src, alt, style, className } = node.properties || {};
  const data = { src };
  const width = getImageWidth(style);
  const alignment = getAlignment(className);
  if (alt) {
    data.title = alt;
  }
  if (width) {
    data.width = width;
  }
  if (alignment) {
    data.alignment = alignment;
  }
  return data;
}

function proseNodeToData(node) {
  const { className } = node.properties || {};
  const alignment = getAlignment(className);
  if (alignment) {
    return {
      data: {
        alignment,
      },
    };
  }
}

function getImageWidth(style = '') {
  const match = style.match(/width:\s*(\d+)%/);
  return match ? parseInt(match[1]) : null;
}

function getAlignment(className = []) {
  return className.find((name) => {
    return ALIGNMENTS.includes(name);
  });
}

function getNodeTextContent(parent) {
  let text = '';
  walkNodes(parent, (node, next) => {
    if (node.type === 'text') {
      text += node.value;
    }
    next();
  });
  return text;
}
