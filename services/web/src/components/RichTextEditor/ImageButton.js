import React, { useState } from 'react';

import { addImage } from './utils';
import AddImageModal from './modals/AddImage';
import Button from './Button';
import { useRichTextEditor } from './context';

import './button.less';

export default function ImageButton() {
  const [showModal, setShowModal] = useState(false);
  const { editorState, updateEditorState } = useRichTextEditor();

  function onClick() {
    setShowModal(true);
  }

  function onClose() {
    setShowModal(false);
  }

  function onSubmit(evt, { url, title }) {
    updateEditorState(addImage(editorState, { url, title }));
  }

  function render() {
    return (
      <React.Fragment>
        <Button type="image" onClick={onClick} />
        {renderImageModal()}
      </React.Fragment>
    );
  }

  function renderImageModal() {
    return (
      <AddImageModal open={showModal} onClose={onClose} onSubmit={onSubmit} />
    );
  }

  return render();
}
