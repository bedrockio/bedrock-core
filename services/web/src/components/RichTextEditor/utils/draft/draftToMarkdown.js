import { invert } from 'lodash';

import { DRAFT_BLOCKS, DRAFT_INLINE } from './const';

const MARKDOWN_BLOCKS = invert(DRAFT_BLOCKS);
const MARKDOWN_INLINE = invert(DRAFT_INLINE);
const COLLAPSABLE_BLOCKS = ['empty', 'unstyled', 'blockquote'];

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
  const inserts = [...inlineStyleRanges, ...entityRanges]
    .filter((range) => {
      // Some basic filtering to ensure bad data doesn't somehow get through.
      return range.style || range.key != null;
    })
    .flatMap((range) => {
      const { offset } = range;
      const [prefix, suffix, length] = processRange(range, entityMap);
      return [
        {
          index: offset,
          text: prefix,
        },
        {
          index: offset + length,
          text: suffix,
        },
      ];
    })
    .sort((a, b) => {
      return a.index - b.index;
    });

  let offset = 0;
  for (let insert of inserts) {
    let { index, text } = insert;
    index += offset;
    str = str.slice(0, index) + text + str.slice(index);
    offset += text.length;
  }
  return str;
}

function processRange(range, entityMap) {
  const { style, length, key } = range;
  if (style) {
    if (style in MARKDOWN_INLINE) {
      const md = MARKDOWN_INLINE[style];
      return [md, md, length];
    } else {
      // Unknown style so return empty prefix/suffix
      return ['', '', length];
    }
  } else if (typeof key === 'number') {
    const { type, data } = entityMap[key];
    if (type === 'LINK') {
      const { url } = data;
      return ['[', `](${url})`, length];
    } else if (type === 'IMAGE') {
      const { title = 'Image', src, width, alignment } = data;
      if (width || alignment) {
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
      const { head, body } = data;
      const colLength = head.length;
      const rows = [head, new Array(colLength).fill('---'), ...body];
      const colMax = [];
      for (let i = 0; i < colLength; i++) {
        let max = 0;
        for (let row of rows) {
          max = Math.max(length, row[i].length);
        }
        colMax.push(max);
      }
      const md = rows
        .map((cols, i) => {
          const row = cols
            .map((str, j) => {
              const max = colMax[j];
              const fill = i === 1 ? '-' : ' ';
              return str.padEnd(max, fill);
            })
            .join(' | ');
          return `| ${row} |`;
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
    let prefix = getMarkdownBlock(block.type);
    prefix = prefix.replace(/^n\./, `${orderedIndex}.`);
    const indent = block.type.endsWith('list-item') ? '   ' : '';
    str = str.replace(/\n/g, '\\\n' + indent);
    return prefix + str;
  }
}

function getMarkdownBlock(type) {
  const header = MARKDOWN_BLOCKS[type];
  return header ? header + ' ' : '';
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
