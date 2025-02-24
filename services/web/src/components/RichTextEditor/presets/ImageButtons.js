import React from 'react';

import { isImageSelected } from '../utils';
import Button from '../Button';
import ImageButton from '../ImageButton';
import { useRichTextEditor } from '../context';

export default function RichTextEditorImageButtons() {
  const { editorState } = useRichTextEditor();
  return (
    <React.Fragment>
      {isImageSelected(editorState) ? (
        <React.Fragment>
          <Button type="image-align-left" />
          <Button type="image-align-right" />
          <Button type="image-align-center" />
          <Button type="image-align-default" />
        </React.Fragment>
      ) : (
        <ImageButton />
      )}
    </React.Fragment>
  );
}
