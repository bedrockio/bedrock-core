import { RichUtils, Modifier, EditorState, AtomicBlockUtils } from 'draft-js';

import { INLINE_STYLES } from '../const';

export const {
  getCurrentBlockType,
  currentBlockContainsLink,
  toggleBlockType,
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

export function handleKeyCommand(editorState, command) {
  const style = command.toUpperCase();
  if (INLINE_STYLES.includes(style)) {
    return toggleInlineStyle(editorState, style);
  }
  return RichUtils.handleKeyCommand(editorState, command);
}

export function toggleInlineStyle(editorState, style) {
  if (!hasOverlappingRanges(editorState, style)) {
    return RichUtils.toggleInlineStyle(editorState, style);
  }
}

// Returns true if the current selection range is entirely
// contained by the given style.
export function hasCurrentInlineStyle(editorState, style) {
  return editorState.getCurrentInlineStyle().has(style);
}

export function canToggleInlineStyle(editorState, style) {
  return !hasOverlappingRanges(editorState, style);
}

// Returns true if the current selection range has any style
// ranges that are not completely contained by it.
function hasOverlappingRanges(editorState, style) {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    return false;
  } else {
    const edges = getSelectionEdges(editorState, selection);
    return edges.some((edge) => {
      const { block, start: edgeStart, end: edgeEnd } = edge;
      const styledRanges = getBlockStyledRanges(block, (styleMap) => {
        return styleMap.size > 0 && !styleMap.has(style);
      });

      return styledRanges.some((styledRange) => {
        const { start, end } = styledRange;
        const isBefore = start <= edgeStart && end <= edgeStart;
        const isAfter = start >= edgeEnd && end >= edgeEnd;
        const isSurrounding = start <= edgeStart && end >= edgeEnd;
        const isContained = start >= edgeStart && end <= edgeEnd;
        return !isBefore && !isAfter && !isSurrounding && !isContained;
      });
    });
  }
}

function getBlockStyledRanges(block, fn) {
  const ranges = [];
  block.findStyleRanges(
    (metadata) => {
      const styleMap = metadata.getStyle();
      if (styleMap.size === 0) {
        return false;
      }
      return fn(styleMap);
    },
    (start, end) => {
      ranges.push({ start, end });
    }
  );
  return ranges;
}

function getSelectionEdges(editorState, selection) {
  const content = editorState.getCurrentContent();
  const startBlock = content.getBlockForKey(selection.getStartKey());
  const endBlock = content.getBlockForKey(selection.getEndKey());
  const start = selection.getStartOffset();
  const end = selection.getEndOffset();
  if (startBlock === endBlock) {
    return [{ block: startBlock, start, end }];
  } else {
    return [
      {
        start,
        end: startBlock.getLength(),
        block: startBlock,
      },
      {
        start: 0,
        end,
        block: endBlock,
      },
    ];
  }
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
