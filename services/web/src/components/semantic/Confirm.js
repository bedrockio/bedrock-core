// A more versatile, simple confirm modal.
// It will show a cancel action and a single confirm action.
// Can be declared "negative" to show a red button for
// destructive actions.

import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic';

export default class Confirm extends React.Component {

  render() {
    const { negative, confirmText, onCancel, onConfirm, ...rest } = this.props;
    return (
      <Modal
        {...rest}
        actions={[
          {
            key: 'cancel',
            content: 'Cancel',
            onClick: onCancel,
          },
          {
            key: confirmText,
            primary: !negative,
            negative,
            content: confirmText,
            onClick: onConfirm,
          },
        ]}
      />
    );
  }

}

Confirm.propTypes = {
  ...Modal.propTypes,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  negative: PropTypes.bool,
};

Confirm.defaultProps = {
  confirmText: 'OK',
  negative: false,
};
