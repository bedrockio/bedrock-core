import React from 'react';
import { Icon } from 'semantic';
import { BUTTON_STYLES } from '../const';

import Menu from '../Menu';

export default class RichTextEditorModeMenu extends React.Component {
  getStyles(mode = this.context.mode) {
    return BUTTON_STYLES[`mode-${mode}`];
  }

  render() {
    const { icon } = this.getStyles();
    return (
      <Menu
        trigger={<Icon name={icon} style={{ marginRight: '4px' }} fitted />}>
        {this.renderItem('inline')}
        {this.renderItem('markdown')}
        {this.renderItem('preview')}
      </Menu>
    );
  }

  renderItem(mode) {
    const { icon, title, label } = this.getStyles(mode);
    const active = mode === this.context.mode;
    return (
      <Menu.Item
        onClick={() => {
          this.context.setMode(mode);
        }}
        active={active}
        title={title}>
        <div style={{ padding: '10px 20px' }}>
          <Icon name={icon} /> {label}
        </div>
      </Menu.Item>
    );
  }
}
