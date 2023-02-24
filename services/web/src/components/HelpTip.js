import React from 'react';
import { Icon, Popup } from 'semantic';

export default class HelpTip extends React.Component {
  render() {
    const { title, text, icon } = this.props;
    return (
      <div
        style={{
          display: 'inline-block',
          marginLeft: '0.5em',
          verticalAlign: 'sub',
        }}>
        <Popup
          content={text}
          header={title}
          position="top center"
          trigger={icon || this.renderIcon()}
        />
      </div>
    );
  }

  renderIcon() {
    return (
      <Icon
        name="circle-question"
        style={{ color: '#ccc', cursor: 'pointer' }}
      />
    );
  }
}
