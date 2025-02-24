import { Dropdown } from 'semantic';

import { useClass } from 'helpers/bem';

import { useRichTextEditor } from '../context';

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

export default function RichTextEditorBlockDropdown() {
  const { editorState, updateEditorState } = useRichTextEditor();

  const { className } = useClass('rich-text-editor-block-dropdown');

  function onChange(evt, { value }) {
    if (value !== 'atomic') {
      updateEditorState(toggleBlockType(editorState, value));
    }
  }

  function render() {
    return (
      <Dropdown
        selection
        size="small"
        onChange={onChange}
        value={getCurrentBlockType(editorState)}
        className={className}
        options={[
          ...BLOCK_OPTIONS,
          ...(isImageSelected(editorState) ? [IMAGE_OPTION] : []),
        ]}
      />
    );
  }

  return render();
}
