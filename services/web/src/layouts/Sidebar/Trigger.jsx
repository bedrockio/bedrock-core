import React from 'react';
import bem from 'helpers/bem';

class SidebarLayoutTrigger extends React.Component {
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

export default bem(SidebarLayoutTrigger);
