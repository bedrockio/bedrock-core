import { Dropdown, Icon } from 'semantic';

import { Tabs } from '@mantine/core';

import { useClass } from 'helpers/bem';

import './menu.less';

export default function RichTextEditorMenu(props) {
  const { trigger, children } = props;

  const { className } = useClass('rich-text-editor-menu');

  return (
    <Tabs
      icon={<Icon name="caret-down" size="small" fitted />}
      trigger={trigger}
      className={className}>
      <Tabs.List>{children}</Tabs.List>
    </Tabs>
  );
}

RichTextEditorMenu.Item = Tabs.Tab;
