import React from 'react';
import PropTypes from 'prop-types';

export default class IconGroup extends React.Component {

  getClassName() {
    const { size, className } = this.props;
    const classes = ['ui icons'];
    if (size) {
      classes.push(size);
    }
    if (className) {
      classes.push(className);
    }
    return classes.join(' ');
  }

  render() {
    const { content, children } = this.props;
    return (
      <div className={this.getClassName()}>
        {content || children}
      </div>
    );
  }

}

IconGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  content: PropTypes.node,
  size: PropTypes.oneOf(['mini', 'tiny', 'small', 'large', 'big', 'huge', 'massive']),
};
