import React from 'react';
import { Icon, Popup } from 'semantic';

export default class HelpTip extends React.Component {
  render() {
    const { title, text } = this.props;

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
          trigger={
            <Icon
              name="circle-question"
              style={{ color: '#ccc', cursor: 'pointer' }}
            />
          }
        />
      </div>
    );
  }
}
