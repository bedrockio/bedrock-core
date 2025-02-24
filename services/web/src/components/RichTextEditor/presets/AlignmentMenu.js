import React from 'react';
import { Icon } from 'semantic';

import { isImageSelected, getSelectedAlignment } from '../utils';
import { useRichTextEditor } from '../context';
import { BUTTON_STYLES } from '../const';
import Menu from '../Menu';
import Button from '../Button';

export default function RichTextEditorAlignmentMenu() {
  const { editorState } = useRichTextEditor();

  function render() {
    const imageSelected = isImageSelected(editorState);
    const alignment = getSelectedAlignment(editorState);
    const name = `align-${alignment}`;
    const { icon } = BUTTON_STYLES[`${imageSelected ? 'image-' : ''}${name}`];
    return (
      <Menu
        trigger={<Icon name={icon} style={{ marginRight: '4px' }} fitted />}>
        {imageSelected ? (
          <React.Fragment>
            {renderItem('image-align-left')}
            {renderItem('image-align-center')}
            {renderItem('image-align-right')}
            {renderItem('image-align-default')}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {renderItem('align-left')}
            {renderItem('align-center')}
            {renderItem('align-right')}
            {renderItem('align-justify')}
          </React.Fragment>
        )}
      </Menu>
    );
  }

  function renderItem(type) {
    return (
      <Menu.Item>
        <Button type={type} />
      </Menu.Item>
    );
  }

  return render();
}
