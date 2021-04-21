import React from 'react';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutContent extends React.Component {
  getModifiers() {
    const { fixed } = this.context;
    return [fixed ? 'fixed' : null];
  }

  render() {
    return (
      <div className={this.getBlockClass()} onClick={this.context.close}>
        {this.props.children}
      </div>
    );
  }
}
