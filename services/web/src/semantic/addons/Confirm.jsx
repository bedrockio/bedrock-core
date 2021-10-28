// Semantic UI's Confirm component is very dumb with the cancel
// button not working out of the box, this version extends it to
// add better defaults and allow a negative button.

import React from 'react';
import PropTypes from 'prop-types';
import { Confirm as SemanticConfirm, Button } from 'semantic-ui-react';

export default class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  onOpen = () => {
    this.setState({
      open: true,
    });
  };

  onCancel = () => {
    this.setState({
      open: false,
    });
    this.props.onCancel();
  };

  onConfirm = () => {
    this.setState({
      open: false,
    });
    this.props.onConfirm();
  };

  render() {
    const { size, negative, confirmButton, ...rest } = this.props;
    return (
      <SemanticConfirm
        {...rest}
        size={size}
        open={this.state.open}
        onOpen={this.onOpen}
        onCancel={this.onCancel}
        onConfirm={this.onConfirm}
        confirmButton={
          negative ? <Button content={confirmButton} negative /> : confirmButton
        }
      />
    );
  }
}

Confirm.propTypes = {
  ...Confirm.propTypes,
  size: PropTypes.string,
  negative: PropTypes.bool,
};

Confirm.defaultProps = {
  size: 'tiny',
  confirmButton: 'OK',
  negative: false,
  onCancel: () => {},
  onConfirm: () => {},
};
