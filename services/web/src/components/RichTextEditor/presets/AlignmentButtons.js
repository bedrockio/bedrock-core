import React from 'react';

import Button from '../Button';
import { isImageSelected } from '../utils';
import { useRichTextEditor } from '../context';

export default function RichTextEditorAlignmentButtons() {
  const { editorState } = useRichTextEditor();

  return (
    <React.Fragment>
      {isImageSelected(editorState) ? (
        <React.Fragment>
          <Button type="image-align-left" />
          <Button type="image-align-center" />
          <Button type="image-align-right" />
          <Button type="image-align-default" />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Button type="align-left" />
          <Button type="align-center" />
          <Button type="align-right" />
          <Button type="align-justify" />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
