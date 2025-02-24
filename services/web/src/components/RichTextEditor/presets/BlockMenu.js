import { Icon } from 'semantic';

import Menu from '../Menu';
import { toggleBlockType } from '../utils';
import { BLOCK_OPTIONS } from '../const';
import { useRichTextEditor } from '../context';

export default function RichTextEditorAlignmentMenu() {
  const { editorState, updateEditorState } = useRichTextEditor();

  function render() {
    return (
      <Menu trigger={<Icon name="paragraph" style={{ marginRight: '4px' }} />}>
        {Object.values(BLOCK_OPTIONS).map(({ text, value }) => {
          return (
            <Menu.Item
              key={value}
              onClick={() => {
                updateEditorState(toggleBlockType(editorState, value));
              }}>
              <div style={{ padding: '10px 20px' }}>{text}</div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }

  return render();
}
