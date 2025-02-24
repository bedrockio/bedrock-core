import { Dropdown, Icon } from 'semantic';

import { useClass } from 'helpers/bem';

import './menu.less';

export default function RichTextEditorMenu(props) {
  const { trigger, children } = props;

  const { className } = useClass('rich-text-editor-menu');

  return (
    <Dropdown
      icon={<Icon name="caret-down" size="small" fitted />}
      trigger={trigger}
      className={className}>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}

RichTextEditorMenu.Item = Dropdown.Item;
