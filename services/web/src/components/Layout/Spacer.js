import React from 'react';
import PropTypes from 'prop-types';

import './spacer.less';

export default class Spacer extends React.Component {

  getClassNames() {
    return ['spacer', this.props.size].join(' ');
  }

  render() {
    return <div className={this.getClassNames()} />;
  }

}

Spacer.propTypes = {
  size: PropTypes.oneOf(['xs', 's', 'm', 'l', 'xl']),
};

Spacer.defaultProps = {
  size: 'm',
};
