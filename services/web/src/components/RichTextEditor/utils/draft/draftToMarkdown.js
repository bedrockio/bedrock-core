import { invert, pad, padStart, padEnd } from 'lodash';

import { DRAFT_BLOCKS, DRAFT_INLINE } from './const';

const MARKDOWN_BLOCKS = invert(DRAFT_BLOCKS);
const MARKDOWN_INLINE = invert(DRAFT_INLINE);
const COLLAPSABLE_BLOCKS = ['empty', 'unstyled', 'blockquote'];

const INLINE_HTML_MAP = {
  BOLD: 'strong',
  CODE: 'code',
  ITALIC: 'em',
};

const HTML_ALIGNMENTS = ['center', 'right', 'justify'];

const ESCAPE_REG = /([`*_])/g;

export default function draftToMarkdown(rawObject) {
  let { blocks, entityMap } = rawObject;
  let orderedIndex = 0;

  blocks = collapseCodeBlocks(blocks);

  return blocks
    .map((block) => {
      const { type, text } = block;
      if (type === 'ordered-list-item') {
        orderedIndex += 1;
      } else {
        orderedIndex = 0;
      }
      let str = type === 'atomic' ? '' : text;
      str = str.replace(ESCAPE_REG, '\\$1');
      str = processRanges(str, block, entityMap);
      str = processBlock(str, block, blocks, orderedIndex);
      return str;
    })
    .join('\n');
}

function collapseCodeBlocks(blocks) {
  const grouped = groupArray(blocks, (block) => {
    return block.type === 'code-block';
  });
  return grouped.map((group) => {
    const text = group
      .map((block) => {
        return block.text;
      })
      .join('\n');
    return {
      ...group[0],
      text,
    };
  });
}

function getBlockType(block) {
  if (block?.type == 'unstyled' && block?.text?.trim() === '') {
    return 'empty';
  } else {
    return block?.type;
  }
}

function processRanges(str, block, entityMap) {
  const { inlineStyleRanges, entityRanges } = block;
  const ranges = [...inlineStyleRanges, ...entityRanges]
    .filter((range) => {
      // Some basic filtering to ensure bad data doesn't somehow get through.
      return range.style || range.key != null;
    })
    .map((range) => {
      // Clone range as it will be modified later.
      return { ...range };
    });

  ranges.sort((a, b) => {
    return a.offset - b.offset;
  });

  ranges.forEach((range, i) => {
    const [prefix, suffix, length] = processRange(range, block, entityMap);
    const start = range.offset;
    const end = range.offset + length;
    const pLength = prefix.length;
    const sLength = suffix.length;

    str = str.slice(0, start) + prefix + str.slice(start);
    str = str.slice(0, end + pLength) + suffix + str.slice(end + pLength);

    // Shift subsequent ranges if their
    // offset is after inserted offsets.
    for (let next of ranges.slice(i + 1)) {
      let shift = 0;
      if (next.offset >= start) {
        shift += pLength;
      }
      if (next.offset >= end) {
        shift += sLength;
      }
      next.offset += shift;
    }
  });

  return str;
}

function processRange(range, block, entityMap) {
  const { style, length, key } = range;
  if (style) {
    if (style in MARKDOWN_INLINE) {
      if (HTML_ALIGNMENTS.includes(block.data?.alignment)) {
        const tag = INLINE_HTML_MAP[style];
        return [`<${tag}>`, `</${tag}>`, length];
      } else {
        const md = MARKDOWN_INLINE[style];
        return [md, md, length];
      }
    } else {
      // Unknown style so return empty prefix/suffix
      return ['', '', length];
    }
  } else if (typeof key === 'number') {
    const { type, data } = entityMap[key];
    if (type === 'LINK') {
      const { url } = data;
      if (HTML_ALIGNMENTS.includes(block.data?.alignment)) {
        return [`<a href="${url}">`, '</a>', length];
      } else {
        return ['[', `](${url})`, length];
      }
    } else if (type === 'IMAGE') {
      const { title = 'Image', src, width, alignment = 'default' } = data;
      if (width || alignment !== 'default') {
        const styles = [];
        if (width) {
          styles.push(`width: ${width}%;`);
        }
        if (alignment === 'center') {
          styles.push(`margin: 0 auto;`);
        } else if (alignment === 'left') {
          styles.push(`float: left;`);
          styles.push(`margin-right: 20px;`);
        } else if (alignment === 'right') {
          styles.push(`float: right;`);
          styles.push(`margin-left: 20px;`);
        }
        const attrs = [
          `src="${src}"`,
          `alt="${title}"`,
          `style="${styles.join(' ')}"`,
        ];
        let img = `<img ${attrs.join(' ')}>`;
        return [img, '', 0];
      } else {
        return [`![${title}]`, `(${src})`, 0];
      }
    } else if (type === 'TABLE') {
      const { head, body, align = [] } = data;
      const colLength = head.length;
      const rows = [head, new Array(colLength).fill('-'), ...body];
      const colMax = [];
      for (let i = 0; i < colLength; i++) {
        let max = 0;
        for (let row of rows) {
          max = Math.max(max, row[i].length);
        }
        colMax.push(max);
      }
      const md = rows
        .map((cols, i) => {
          const isSeparator = i === 1;
          const row = cols
            .map((str, j) => {
              let max = colMax[j];
              const colAlign = align[j] || 'default';
              const isLeft = colAlign === 'left';
              const isRight = colAlign === 'right';
              const isCenter = colAlign === 'center';
              const isDefault = colAlign === 'default';
              if (isSeparator) {
                const l = isLeft || isCenter ? ':' : '';
                const r = isRight || isCenter ? ':' : '';
                max -= l.length;
                max -= r.length;
                return ` ${l}${pad(str, max, '-')}${r} `;
              } else {
                if (isDefault || isLeft) {
                  return ` ${padEnd(str, max)} `;
                } else if (isRight) {
                  return ` ${padStart(str, max)} `;
                } else {
                  return ` ${pad(str, max)} `;
                }
              }
            })
            .join('|');
          return `|${row}|`;
        })
        .join('\n');
      return [md, '', 0];
    }
  }
}

function processBlock(str, block, blocks, orderedIndex) {
  const { type } = block;
  if (type === 'code-block') {
    return `\`\`\`\n${str}\n\`\`\``;
  } else if (type === 'atomic') {
    return str;
  } else {
    const index = blocks.indexOf(block);
    const type = getBlockType(block);
    const lastType = getBlockType(blocks[index - 1]);
    const nextType = getBlockType(blocks[index + 1]);
    if (COLLAPSABLE_BLOCKS.includes(type)) {
      if (type === nextType || (type === lastType && type === 'empty')) {
        str += '\\';
      }
    }
    let prefix = getMarkdownPrefix(block.type);
    prefix = prefix.replace(/^n\./, `${orderedIndex}.`);
    const indent = block.type.endsWith('list-item') ? '   ' : '';
    str = str.replace(/\n/g, '\\\n' + indent);
    str = prefix + str;
    str = wrapAlignment(str, block);
    return str;
  }
}

function getMarkdownPrefix(type) {
  const header = MARKDOWN_BLOCKS[type];
  return header ? header + ' ' : '';
}

function wrapAlignment(str, block) {
  const { type, data } = block;
  if (type === 'unstyled' && data?.alignment) {
    const { alignment } = data;
    if (HTML_ALIGNMENTS.includes(alignment)) {
      str = `<p style="text-align:${alignment}">${indentParagraph(str)}</p>`;
    }
  }
  return str;
}

const COLS = 80;

function indentParagraph(str) {
  if (str.length > COLS) {
    const lines = [];
    let buffer = '';
    const words = str.split(' ');
    while (words.length) {
      const word = words.shift();
      if (buffer.length + word.length > COLS) {
        lines.push(buffer);
        buffer = word;
      } else {
        if (buffer) {
          buffer += ' ';
        }
        buffer += word;
      }
    }
    if (buffer) {
      lines.push(buffer);
    }
    const indented = lines.map((line) => `  ${line}`).join('\n');
    str = `\n${indented}\n`;
  }
  return str;
}

function groupArray(arr, fn) {
  arr = [...arr];
  const groups = [];
  while (arr.length) {
    const group = [];
    let match = true;
    do {
      match = fn(arr[0]);
      group.push(arr.shift());
    } while (arr.length && match && fn(arr[0]));
    groups.push(group);
  }

  return groups;
}
