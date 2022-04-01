import React from 'react';

import Button from '../Button';
import { isImageSelected } from '../utils';

export default class RichTextEditorAlignmentButtons extends React.Component {
  render() {
    const { editorState } = this.context;
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
}
