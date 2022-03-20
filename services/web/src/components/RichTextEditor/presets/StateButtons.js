import React from 'react';
import Button from '../Button';

export default class RichTextEditorStateButtons extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Button type="undo" />
        <Button type="redo" />
      </React.Fragment>
    );
  }
}
