import React from 'react';
import bem from '/helpers/bem';
import { Icon } from '/semantic';
import { isImageSelected, getSelectedAlignment } from '../utils';
import { BUTTON_STYLES } from '../const';

import Menu from '../Menu';
import Button from '../Button';

class RichTextEditorAlignmentMenu extends React.Component {
  render() {
    const { editorState } = this.context;
    const imageSelected = isImageSelected(editorState);
    const alignment = getSelectedAlignment(editorState);
    const name = `align-${alignment}`;
    const { icon } = BUTTON_STYLES[`${imageSelected ? 'image-' : ''}${name}`];
    return (
      <Menu
        trigger={<Icon name={icon} style={{ marginRight: '4px' }} fitted />}>
        {imageSelected ? (
          <React.Fragment>
            {this.renderItem('image-align-left')}
            {this.renderItem('image-align-center')}
            {this.renderItem('image-align-right')}
            {this.renderItem('image-align-default')}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {this.renderItem('align-left')}
            {this.renderItem('align-center')}
            {this.renderItem('align-right')}
            {this.renderItem('align-justify')}
          </React.Fragment>
        )}
      </Menu>
    );
  }

  renderItem(type) {
    return (
      <Menu.Item>
        <Button type={type} />
      </Menu.Item>
    );
  }
}

export default bem(RichTextEditorAlignmentMenu);
