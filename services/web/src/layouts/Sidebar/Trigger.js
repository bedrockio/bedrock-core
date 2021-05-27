import React from 'react';
import bem from 'helpers/bem';

@bem
export default class SidebarLayoutTrigger extends React.Component {
  onClick = (evt) => {
    evt.stopPropagation();
    this.context.toggle();
  };

  render() {
    return (
      <div className={this.getBlockClass()} onClick={this.onClick}>
        {this.props.children}
      </div>
    );
  }
}
