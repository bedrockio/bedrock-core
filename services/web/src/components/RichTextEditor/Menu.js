import React from 'react';
import { Dropdown, Icon } from 'semantic';
import bem from 'helpers/bem';

import './menu.less';

class RichTextEditorMenu extends React.Component {
  static Item = Dropdown.Item;

  render() {
    const { trigger, children } = this.props;
    return (
      <Dropdown
        icon={<Icon name="caret-down" size="small" fitted />}
        trigger={trigger}
        className={this.getBlockClass()}>
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default bem(RichTextEditorMenu);
