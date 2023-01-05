import React from 'react';

import { isImageSelected } from '../utils';
import Button from '../Button';
import ImageButton from '../ImageButton';

export default class RichTextEditorImageButtons extends React.Component {
  render() {
    const { editorState } = this.context;
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
}
