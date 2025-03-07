import { Icon } from 'semantic';

import { BUTTON_STYLES } from '../const';
import { useRichTextEditor } from '../context';
import Menu from '../Menu';

export default function RichTextEditorModeMenu() {
  const { mode: docsMode, setMode } = useRichTextEditor();

  function getStyles(mode = docsMode) {
    return BUTTON_STYLES[`mode-${mode}`];
  }

  function renderItem(mode) {
    const { icon, title, label } = getStyles(mode);
    const active = mode === docsMode;
    return (
      <Menu.Item
        onClick={() => {
          setMode(mode);
        }}
        active={active}
        title={title}>
        <div style={{ padding: '10px 20px' }}>
          <Icon name={icon} /> {label}
        </div>
      </Menu.Item>
    );
  }

  const styles = getStyles();

  return (
    <Menu
      trigger={
        <Icon name={styles?.icon} style={{ marginRight: '4px' }} fitted />
      }>
      {renderItem('inline')}
      {renderItem('markdown')}
      {renderItem('preview')}
    </Menu>
  );
}
