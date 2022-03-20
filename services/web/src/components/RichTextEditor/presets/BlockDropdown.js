import React from 'react';
import { Dropdown } from 'semantic';
import bem from 'helpers/bem';
import {
  getCurrentBlockType,
  toggleBlockType,
  isImageSelected,
} from '../utils';
import { BLOCK_OPTIONS } from '../const';

import './block-dropdown.less';

const IMAGE_OPTION = {
  text: 'Image',
  value: 'atomic',
};

@bem
export default class RichTextEditorBlockDropdown extends React.Component {
  onChange = (evt, { value }) => {
    if (value !== 'atomic') {
      const { editorState, updateState } = this.context;
      updateState(toggleBlockType(editorState, value));
    }
  };

  render() {
    const { editorState } = this.context;
    return (
      <Dropdown
        selection
        size="small"
        onChange={this.onChange}
        value={getCurrentBlockType(editorState)}
        className={this.getBlockClass()}
        options={[
          ...BLOCK_OPTIONS,
          ...(isImageSelected(editorState) ? [IMAGE_OPTION] : []),
        ]}
      />
    );
  }
}
