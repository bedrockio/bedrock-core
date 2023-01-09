import { markdownToDraft, draftToMarkdown } from '../';
import markdownBasic from '../__fixtures__/basic.md';
import markdownTables from '../__fixtures__/tables.md';
import markdownSpecial from '../__fixtures__/special.md';
import markdownEscaped from '../__fixtures__/escaped.md';
import markdownMath from '../__fixtures__/math.md';
import markdownExtended from '../__fixtures__/extended.md';
import markdownCollapse from '../__fixtures__/collapse.md';
import draftBasic from '../__fixtures__/basic.json';
import draftTables from '../__fixtures__/tables.json';
import draftSpecial from '../__fixtures__/special.json';
import draftEscaped from '../__fixtures__/escaped.json';
import draftMath from '../__fixtures__/math.json';
import draftExtended from '../__fixtures__/extended.json';
import draftCollapse from '../__fixtures__/collapse.json';

describe('markdownToDraft', () => {
  it('should transform basic markdown', () => {
    expect(markdownToDraft(markdownBasic)).toEqual(draftBasic);
  });

  it('should transform extended markdown', () => {
    expect(markdownToDraft(markdownExtended)).toEqual(draftExtended);
  });

  it('should transform tables markdown', () => {
    expect(markdownToDraft(markdownTables)).toEqual(draftTables);
  });

  it('should transform escaped markdown', () => {
    expect(markdownToDraft(markdownEscaped)).toEqual(draftEscaped);
  });

  it('should transform math markdown', () => {
    expect(markdownToDraft(markdownMath)).toEqual(draftMath);
  });

  it('should transform special markdown', () => {
    const normalized = {
      ...draftSpecial,
      blocks: draftSpecial.blocks.map((block) => {
        return {
          ...block,
          inlineStyleRanges: block.inlineStyleRanges.map((range) => {
            let { style } = range;
            if (style === 'UNDERLINE' || style === 'UNKNOWN') {
              style = 'ITALIC';
            }
            return {
              ...range,
              style,
            };
          }),
        };
      }),
    };
    normalized.blocks.splice(5, 0, {
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      text: '',
      type: 'unstyled',
    });
    expect(markdownToDraft(markdownSpecial)).toEqual(normalized);
  });
});

describe('draftToMarkdown', () => {
  it('should transform basic draft', () => {
    // Normalize intentionally incorrect markdown.
    let tmp = markdownBasic;

    tmp = tmp.replace('_overlapping**_ text', '\\_overlapping**\\_ text');
    tmp = tmp.replace('invalid bold**:**', 'invalid bold\\*\\*:\\*\\*');
    tmp = tmp.replace(
      '**Bold** and ne**:**ed bold',
      '**Bold** and ne\\*\\*:\\*\\*ed bold'
    );
    tmp = tmp.replace(
      'a formula: 1 * 2 * 3 * 4 * 5',
      'a formula: 1 \\* 2 \\* 3 \\* 4 \\* 5'
    );
    tmp = tmp.replace('Paragraph 3\n', 'Paragraph 3\\\n');
    tmp = tmp.replace('Paragraph 4  \n', 'Paragraph 4\\\n');
    tmp = tmp.replace(/^\* Star/gm, '- Star');
    tmp = tmp.replace('3. Item 3\n', '3. Item 3\\\n');
    tmp = tmp.replace('4. Item 4  \n', '4. Item 4\\\n');
    tmp = tmp.replace('1000. Item 1000', '2. Item 1000');
    const normalized = tmp;

    expect(draftToMarkdown(draftBasic)).toEqual(normalized);
  });

  it('should transform extended draft', () => {
    let tmp = markdownExtended;
    tmp = tmp.replace('<b>bold</b>', '<strong>bold</strong>');
    tmp = tmp.replace('<i>italic</i>', '<em>italic</em>');
    const normalized = tmp;

    expect(draftToMarkdown(draftExtended)).toEqual(normalized);
  });

  it('should transform escaped draft', () => {
    expect(draftToMarkdown(draftEscaped)).toEqual(markdownEscaped);
  });

  it('should transform math markdown', () => {
    expect(draftToMarkdown(draftMath)).toEqual(markdownMath);
  });

  it('should transform table draft', () => {
    expect(draftToMarkdown(draftTables)).toEqual(markdownTables);
  });

  it('should transform special draft', () => {
    let tmp = markdownSpecial;
    tmp = tmp.replace(
      '<iframe src="javascript:alert(\'hax0red!\')"></iframe>\n',
      ''
    );
    tmp = tmp.replace("<script>alert('hax0red!')</script>\n", '');
    tmp = tmp.replace(
      '<sup>[1](#footnotes)</sup>',
      '<sup><a href="#footnotes">1</a></sup>'
    );
    tmp = tmp.replace(
      '[<sup>1</sup>](#footnotes)',
      '<sup><a href="#footnotes">1</a></sup>'
    );
    tmp = tmp.replace(/ allowfullscreen style=".*"/, '');
    const normalized = tmp;

    expect(draftToMarkdown(draftSpecial)).toEqual(normalized);
  });

  it('should transform collapse draft', () => {
    expect(draftToMarkdown(draftCollapse)).toEqual(markdownCollapse);
  });
});
