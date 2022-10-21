export default function () {
  return {
    blockStyleFn(contentBlock, { getEditorState }) {
      if (contentBlock.getType() === 'atomic') {
        const editorState = getEditorState();
        const entityKey = contentBlock.getEntityAt(0);
        if (entityKey) {
          const entity = editorState.getCurrentContent().getEntity(entityKey);
          const alignment = entity?.getData().alignment || 'default';
          return `atomic--${alignment}`;
        }
      }
    },
  };
}
