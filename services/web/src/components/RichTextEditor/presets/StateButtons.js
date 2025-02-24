import React from 'react';

import Button from '../Button';

export default function RichTextEditorStateButtons() {
  return (
    <React.Fragment>
      <Button type="undo" />
      <Button type="redo" />
    </React.Fragment>
  );
}
