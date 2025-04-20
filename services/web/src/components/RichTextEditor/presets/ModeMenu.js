import { Icon, Tab } from 'semantic';

import { BUTTON_STYLES } from '../const';
import { useRichTextEditor } from '../context';
import Menu from '../Menu';
import { IconPhoto } from '@tabler/icons-react';
import { SegmentedControl } from '@mantine/core';

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
        leftSection={<IconPhoto size={12} />}
        active={active}
        title={title}>
        {label}
      </Menu.Item>
    );
  }

  const styles = getStyles();

  return <SegmentedControl data={['inline', 'markdown', 'preview']} />;

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
