import { DRAFT_BLOCKS, DRAFT_INLINE } from './const';

// Block matching
const CODE_REG = /^( {4,}|\t+)/g;
const IMAGE_REG = /!\[(.+)\]\((.+)\)|<img ([^>]+?)>/g;
const BLOCK_REG = /^(#{1,6}|\d+\.|[-*+>]) /g;
const LINE_BREAK_REG = / {2}|\\$/g;

// Inline matching
const INLINE_REG = /(_+|\*+|`)(.+?)(?:\1)|\[([^\]]+)\]\(([^)]+)\)/g;

// HTML helpers
const HTML_INLINE_REG = /(<\/?(i|b|em|strong|code)>)/g;
const HTML_LINK_REG = /<a.*?href="(.+?)">(.+?)<\/a>/gm;

const HTML_INLINE_MAP = {
  b: '**',
  i: '_',
  em: '_',
  code: '`',
  strong: '**',
};

// Escape matching
const ESCAPE_CHAR_REG = /\\([`*_])/g;
const ESCAPE_PLACEHOLDER_REG = /%%ESCAPE\((\d+)\)%%/g;

// Alternate block matching
const ALTERNATE_HEADER_REG = /^(.+)\n^([=-])+$/gm;
const FENCED_CODE_BLOCK_REG = /^```$([^`]+?)^```$/gm;

// Tables
const TABLE_REG = /(\n?)(\|.+?\|)($|\n[^|])/gs;
const TABLE_PLACEHOLDER_REG = /^%%TABLE%%$/;

// Alignment

const ALIGN_REG = /^<p style="text-align:(center|right)">(.+?)<\/p>$/gms;

export default function markdownToDraft(str) {
  let entityKey = 0;
  const tables = [];
  const entityMap = {};

  function addLink(block, options) {
    const { url, ...rest } = options;
    addEntity(block, {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url,
      },
      ...rest,
    });
  }

  function addImage(block, options) {
    const { offset, data } = options;
    block.type = 'atomic';
    addEntity(block, {
      type: 'IMAGE',
      mutability: 'IMMUTABLE',
      length: 1,
      offset,
      data,
    });
  }

  function addEntity(block, options) {
    const { type, mutability, data, offset, length } = options;
    const key = entityKey++;
    entityMap[key] = {
      type,
      mutability,
      data,
    };
    block.entityRanges.push({
      key,
      offset,
      length,
    });
  }

  // Normalize alternate formats

  str = replaceMarkdown(str, ALTERNATE_HEADER_REG, ([line, char]) => {
    const prefix = char === '=' ? '#' : '##';
    return `${prefix} ${line}`;
  });

  str = replaceMarkdown(str, FENCED_CODE_BLOCK_REG, ([content]) => {
    return content
      .trim()
      .split('\n')
      .map((line) => {
        return `    ${line}`;
      })
      .join('\n');
  });

  str = replaceMarkdown(str, HTML_INLINE_REG, ([all, tag]) => {
    return HTML_INLINE_MAP[tag] || all;
  });

  str = replaceMarkdown(str, HTML_LINK_REG, ([href, text]) => {
    return `[${text}](${href})`;
  });

  // Parse multiline table syntax up front and stores table data.
  // Replace with a placeholder so that the text is not processed.

  str = replaceMarkdown(str, TABLE_REG, ([prev, content, next]) => {
    const lines = content.split('\n');
    const rows = lines.map((line) => {
      line = line.replace(/^\|(.+)\|/, '$1');
      return line.split(/\s*\|\s*/).map((str) => {
        return str.trim();
      });
    });
    let align = [];
    if (rows.length > 2) {
      const colLength = rows[0].length;
      const even = rows.every((cols) => {
        return cols.length === colLength;
      });
      const separator = rows[1].every((col) => {
        const match = col.trim().match(/^(:)?-{1,}(:)?$/);
        if (match) {
          const [, l, r] = match;
          if (l && r) {
            align.push('center');
          } else if (r) {
            align.push('right');
          } else if (l) {
            align.push('left');
          } else {
            align.push('default');
          }
          return true;
        }
      });
      const hasAlignment = align.some((a) => {
        return a !== 'default';
      });
      if (even && separator) {
        tables.push({
          head: rows[0],
          body: rows.slice(2),
          ...(hasAlignment && { align }),
        });
        if (next.trim() !== '') {
          next = '\n' + next;
        }
        return prev + '%%TABLE%%' + next;
      }
    }
    return prev + content + next;
  });

  const blocks = getBlocks(str);

  for (let block of blocks) {
    let { text } = block;
    block.depth = 0;
    block.entityRanges = [];
    block.inlineStyleRanges = [];

    // Replace escaped chars with a special syntax before
    // processing text so they don't match. They will be
    // restored below.

    text = replaceMarkdown(text, ESCAPE_CHAR_REG, (groups) => {
      const [char] = groups;
      return `%%ESCAPE(${char.codePointAt(0)})%%`;
    });

    // Replace html paragraphs next so that text can be
    // procesed as unstyled.

    text = replaceMarkdown(text, ALIGN_REG, ([alignment, content]) => {
      block.data = {
        alignment,
      };
      return content.trim();
    });

    // Replace markdown images with syntax ![alt](src).
    // Do this before parsing inline ranges as links have a
    // similar syntax that may cause false positives.

    text = replaceMarkdown(text, IMAGE_REG, (groups, offset) => {
      let [title, src, attrs] = groups;
      let style = {};
      if (attrs) {
        const parsed = getAttrs(attrs);
        src = parsed.src;
        title = parsed.alt;
        style = parsed.style;
      }
      const { width, float, margin } = style;
      const data = {
        src,
        title,
      };
      if (width) {
        data.width = parseInt(width);
      }
      if (float) {
        data.alignment = float;
      } else {
        data.alignment = margin === '0 auto' ? 'center' : 'default';
      }
      addImage(block, {
        offset,
        data,
      });
      return ' ';
    });

    text = replaceInlineRanges(text, {
      block,
      addLink,
    });

    // Restore placeholders for escaped chars.

    text = replaceMarkdown(text, ESCAPE_PLACEHOLDER_REG, (groups) => {
      const [code] = groups;
      return String.fromCodePoint(code);
    });

    // Restore placeholders for tables.

    text = replaceMarkdown(text, TABLE_PLACEHOLDER_REG, () => {
      block.type = 'atomic';
      addEntity(block, {
        type: 'TABLE',
        mutability: 'IMMUTABLE',
        length: 1,
        offset: 0,
        data: tables.shift(),
      });
      return ' ';
    });

    block.text = text;
  }

  return {
    blocks,
    entityMap,
  };
}

// Block helpers

function getBlocks(str) {
  const blocks = [];
  const lines = str.split('\n');
  let current;
  for (let line of lines) {
    const meta = getBlockMeta(line);
    let { type, text, isEmpty } = meta;
    const isUnstyled = type === 'unstyled';
    if (isUnstyled && !isEmpty && current?.isCollapsable) {
      current.block.text += current.spacer + meta.text.trimStart();
    } else {
      current = {
        ...meta,
        block: {
          type,
          text,
        },
      };
      blocks.push(current.block);
    }
  }
  return blocks;
}

function getBlockMeta(text) {
  let type = 'unstyled';
  let hasLineBreak = false;
  text = text.replace(BLOCK_REG, (all, prefix) => {
    prefix = prefix.replace(/^\d\./, 'n.');
    type = DRAFT_BLOCKS[prefix];
    return '';
  });
  text = text.replace(CODE_REG, () => {
    type = 'code-block';
    return '';
  });
  text = text.replace(TABLE_PLACEHOLDER_REG, (str) => {
    type = 'atomic';
    return str;
  });
  text = text.replace(LINE_BREAK_REG, () => {
    hasLineBreak = true;
    return '';
  });
  const isEmpty = !text.trim();
  const isImage = !!text.match(IMAGE_REG);
  const spacer = hasLineBreak ? '\n' : ' ';

  const isCollapsable =
    !isEmpty &&
    !isImage &&
    (isListType(type) || (isParagraphType(type) && !hasLineBreak));

  return {
    type,
    text,
    spacer,
    isEmpty,
    isCollapsable,
  };
}

function isListType(type) {
  return type === 'unordered-list-item' || type === 'ordered-list-item';
}

function isParagraphType(type) {
  return type === 'unstyled' || type === 'blockquote';
}

// Inline helpers

const ATTR_REG = /(\w+)="(.+?)"/g;

function getAttrs(str) {
  const map = {};
  for (let match of str.matchAll(ATTR_REG)) {
    let [, attr, value] = match;
    if (attr === 'style') {
      map[attr] = getStyles(value);
    } else {
      map[attr] = value;
    }
  }
  return map;
}

function getStyles(str) {
  const styles = {};
  for (let dec of str.trim().split(';')) {
    const [prop, value] = dec.trim().split(/:\s?/);
    if (prop && value) {
      styles[prop] = value;
    }
  }
  return styles;
}

// Replace helpers

// Any combination of nested ranges may be possible
// so this needs to be done in one go and must be
// recursive. Examples:
//
// _**italic and bold**_
// **_bold and italic_**
// [**bold link**](https://foo.com)
// **[link bold](https://foo.com)**

function replaceInlineRanges(str, options) {
  let { block, addLink, inlineRanges, entityRanges, index = 0 } = options;

  inlineRanges ||= block.inlineStyleRanges;
  entityRanges ||= block.entityRanges;

  return replaceMarkdown(str, INLINE_REG, (groups, offset) => {
    const nestedInlineRanges = [];
    const nestedEntityRanges = [];
    let [style, text, alt, url] = groups;
    let str = text || alt;

    offset += index;
    str = replaceInlineRanges(str, {
      ...options,
      index: offset,
      inlineRanges: nestedInlineRanges,
      entityRanges: nestedEntityRanges,
    });

    if (style) {
      inlineRanges.push({
        style: DRAFT_INLINE[style.replace(/_/g, '*')],
        offset,
        length: str.length,
      });
    } else if (url) {
      addLink(block, {
        url,
        offset,
        length: str.length,
      });
    }
    for (let range of nestedInlineRanges) {
      inlineRanges.push(range);
    }
    for (let range of nestedEntityRanges) {
      entityRanges.push(range);
    }
    return str;
  });
}

function replaceMarkdown(str, reg, fn) {
  let shift = 0;
  return str.replace(reg, (match, ...args) => {
    const groups = args.slice(0, -2);
    const [offset] = args.slice(-2);
    const str = fn(groups, offset - shift);
    shift += match.length - str.length;
    return str;
  });
}
