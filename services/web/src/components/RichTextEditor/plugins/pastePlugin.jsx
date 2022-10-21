import {
  Modifier,
  EditorState,
  ContentState,
  ContentBlock,
  convertFromHTML,
  genKey,
} from 'draft-js';

const LIST_TYPES = ['unordered-list-item', 'ordered-list-item'];

export default function () {
  return {
    handlePastedText(text, html, editorState, { getProps }) {
      if (html) {
        let { contentBlocks, entityMap } = convertFromHTML(html);

        contentBlocks = insertLineBreak(contentBlocks);

        const pastedState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );

        const newState = Modifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          pastedState.blockMap
        );

        getProps().onChange(
          EditorState.push(editorState, newState, 'insert-fragment')
        );

        return 'handled';
      }
    },
  };
}

function insertLineBreak(blocks) {
  const result = [];
  blocks.forEach((block, i, arr) => {
    const nextBlock = arr[i + 1];
    result.push(block);
    if (isBreakable(block, nextBlock)) {
      result.push(
        new ContentBlock({
          key: genKey(),
          type: 'unstyled',
          text: '',
          depth: 1,
        })
      );
    }
  });
  return result;
}

function isBreakable(block1, block2) {
  if (isListBlock(block1) && isListBlock(block2)) {
    return false;
  }
  return !isEmptyBlock(block1) && !isEmptyBlock(block2);
}

function isListBlock(block) {
  return LIST_TYPES.includes(block?.type);
}

function isEmptyBlock(block) {
  return block?.text.trim() === '';
}
