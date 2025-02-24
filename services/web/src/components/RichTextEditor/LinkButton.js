import React, { useState } from 'react';

import { addLink, toggleLink, currentBlockContainsLink } from './utils';
import { useRichTextEditor } from './context';
import AddLinkModal from './modals/AddLink';
import Button from './Button';

import './button.less';

export default function ImageButton() {
  const [selection, setSelection] = useState(null);
  const { editorState, updateEditorState } = useRichTextEditor();

  function onClick() {
    const selection = editorState.getSelection();
    if (currentBlockContainsLink(editorState)) {
      updateEditorState(toggleLink(editorState, selection, null));
    } else if (!selection.isCollapsed()) {
      setSelection(selection);
    }
  }

  function onClose() {
    setSelection(null);
  }

  function onSubmit(evt, { value }) {
    updateEditorState(
      addLink(editorState, {
        url: value,
        selection,
      })
    );
  }

  function render() {
    return (
      <React.Fragment>
        <Button
          type="link"
          onClick={onClick}
          toggled={currentBlockContainsLink(editorState)}
          disabled={editorState.getSelection().isCollapsed()}
        />
        {renderLinkModal()}
      </React.Fragment>
    );
  }

  function renderLinkModal() {
    return (
      <AddLinkModal open={!!selection} onClose={onClose} onSubmit={onSubmit} />
    );
  }

  return render();
}
