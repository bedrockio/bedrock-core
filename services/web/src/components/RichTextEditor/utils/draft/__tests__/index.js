import { markdownToDraft, draftToMarkdown } from '../';
import markdownExampleRaw from '../__fixtures__/example.md';
import draftExample from '../__fixtures__/example.json';
import draftEmpty from '../__fixtures__/empty.json';

// Some mods as prettier will reformat markdown.
let tmp = markdownExampleRaw;
tmp = tmp.replace(/^- Plus/gm, '+ Plus');
tmp = tmp.replace(/^# Alternate Header 1/gm, 'Alternate Header 1\n======');
tmp = tmp.replace(/^## Alternate Header 2/gm, 'Alternate Header 2\n------');
tmp = tmp.replace(/^ {4}A tabbed code block!/gm, '\tA tabbed code block!');
tmp = tmp.replace(/^ {4}A tabbed code line./gm, '\tA tabbed code line.');
const markdownExample = tmp;

tmp = markdownExampleRaw;
tmp = tmp.replace(/ {2}$/gm, '\\');
tmp = tmp.replace(/^[-+*] (.+)/gm, '- $1');
tmp = tmp.replace(
  'width:25%;float:left;margin-right:20px;',
  'width: 25%; float: left; margin-right: 20px;'
);
tmp = tmp.replace(
  /^ +(A.+?block!)\n^ +(A.+?line.)$/gm,
  `\`\`\`\n$1\n$2\n\`\`\``
);
tmp = tmp.replace(/Paragraph 3\nwith new line/, 'Paragraph 3 with new line');
tmp = tmp.replace(/Item 3\s+with new line/, 'Item 3 with new line');
tmp = tmp.replace(
  /Item 6\s+with\s+multiple\s+new\s+lines/,
  'Item 6 with multiple new lines'
);
tmp = tmp.replace(
  'Paragraph **6**\nwith **new** [line](#line)',
  'Paragraph **6** with **new** [line](#line)'
);

const markdownNormalized = tmp;

const draftTrailing = {
  ...draftExample,
  blocks: [...draftExample.blocks, ...[draftEmpty, draftEmpty, draftEmpty]],
};

describe('markdownToDraft', () => {
  it('transform basic markdown with no whitespace', () => {
    expect(markdownToDraft(markdownExample.trim())).toEqual(draftExample);
  });

  it('transform basic markdown with trailing whitespace', () => {
    expect(markdownToDraft(markdownExample.trim() + '\n\n\n')).toEqual(
      draftTrailing
    );
  });
});

describe('draftToMarkdown', () => {
  it('transform basic markdown with no whitespace', () => {
    expect(draftToMarkdown(draftExample)).toEqual(markdownNormalized.trim());
  });

  it('transform basic markdown with trailing whitespace', () => {
    expect(draftToMarkdown(draftTrailing)).toEqual(
      markdownNormalized.trim() + '\n\\\n\\\n\\'
    );
  });
});
