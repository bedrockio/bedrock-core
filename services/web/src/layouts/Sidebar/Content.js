import React from 'react';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutContent extends React.Component {
  render() {
    return (
      <div className={this.getBlockClass()} onClick={this.context.close}>
        {this.props.children}
      </div>
    );
  }
}
