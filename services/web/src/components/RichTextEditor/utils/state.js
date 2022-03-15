import { RichUtils, Modifier, EditorState, AtomicBlockUtils } from 'draft-js';

export const {
  getCurrentBlockType,
  currentBlockContainsLink,
  toggleBlockType,
  toggleInlineStyle,
  toggleLink,
} = RichUtils;

export const { undo, redo, forceSelection } = EditorState;

export function isImageSelected(editorState) {
  return !!getSelectedImage(editorState).key;
}

export function addImage(editorState, options) {
  const { url } = options;
  const entity = createEntity(editorState, {
    type: 'IMAGE',
    mutability: 'IMMUTABLE',
    src: url,
  });
  const entityKey = entity.getLastCreatedEntityKey();
  editorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
  return forceSelection(
    editorState,
    editorState.getCurrentContent().getSelectionAfter()
  );
}

export function addLink(editorState, options) {
  const { selection, url } = options;
  const entity = createEntity(editorState, {
    type: 'LINK',
    mutability: 'MUTABLE',
    url,
  });
  const entityKey = entity.getLastCreatedEntityKey();
  return toggleLink(editorState, selection, entityKey);
}

export function canUndo(editorState) {
  return !editorState.getUndoStack().isEmpty();
}

export function getSelectedAlignment(editorState) {
  const { entity } = getSelectedImage(editorState);
  if (entity) {
    return entity.getData().alignment || 'default';
  } else {
    const block = getSelectedBlock(editorState);
    return block.getData().get('alignment') || 'left';
  }
}

export function setAlignment(editorState, alignment) {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  const { key } = getSelectedImage(editorState);
  if (key) {
    content.mergeEntityData(key, { alignment });
    return forceSelection(editorState, selection);
  } else {
    const aligned = Modifier.mergeBlockData(content, selection, {
      alignment,
    });
    return EditorState.push(editorState, aligned, 'change-block-data');
  }
}

export function canRedo(editorState) {
  return !editorState.getRedoStack().isEmpty();
}

function createEntity(editorState, options) {
  const { type, mutability, ...data } = options;
  return editorState.getCurrentContent().createEntity(type, mutability, data);
}

function getSelectedImage(editorState) {
  const key = getSelectedEntityKey(editorState);
  if (key) {
    const content = editorState.getCurrentContent();
    const entity = content.getEntity(key);
    if (entity?.getType() === 'IMAGE') {
      return { entity, key };
    }
  }
  return {};
}

function getSelectedEntityKey(editorState) {
  const block = getSelectedBlock(editorState);
  if (block) {
    return block.getEntityAt(editorState.getSelection().getAnchorOffset());
  }
}

function getSelectedBlock(editorState) {
  const selection = editorState.getSelection();
  const blockKey = selection.getAnchorKey();
  if (blockKey) {
    const content = editorState.getCurrentContent();
    return content.getBlockForKey(blockKey);
  }
}
