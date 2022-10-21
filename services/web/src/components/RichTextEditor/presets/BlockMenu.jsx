import React from 'react';
import { Icon } from '/semantic';

import bem from '/helpers/bem';

import { toggleBlockType } from '../utils';
import { BLOCK_OPTIONS } from '../const';
import Menu from '../Menu';

class RichTextEditorAlignmentMenu extends React.Component {
  render() {
    return (
      <Menu trigger={<Icon name="paragraph" style={{ marginRight: '4px' }} />}>
        {Object.values(BLOCK_OPTIONS).map(({ text, value }) => {
          return (
            <Menu.Item
              key={value}
              onClick={() => {
                const { editorState, updateEditorState } = this.context;
                updateEditorState(toggleBlockType(editorState, value));
              }}>
              <div style={{ padding: '10px 20px' }}>{text}</div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }
}

export default bem(RichTextEditorAlignmentMenu);
