import React from 'react';
import { Modal, Button, Message, Confirm } from 'semantic';

import modal from '../helpers/modal';
import PropTypes from 'prop-types';

@modal
export default class ConfirmComponent extends React.Component {
  state = {
    loading: false,
    error: null,
  };

  onClick = async () => {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      await this.props.onConfirm();
      this.setState({
        loading: false,
      });
      this.props.close();
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      });
      return;
    }
  };

  render() {
    const { loading, error } = this.state;
    const { header, content, confirmButton, negative } = this.props;

    return (
      <>
        <Modal.Header>{header}</Modal.Header>

        <Modal.Content>
          <>
            {content}
            {error && (
              <Message
                style={{
                  borderRadius: 0,
                  marginTop: '1em',
                }}
                icon="triangle-exclamation"
                header={'Something went wrong'}
                error
                content={error.message}
              />
            )}
          </>
        </Modal.Content>

        <Modal.Actions>
          <Button basic onClick={this.props.close}>
            Cancel
          </Button>
          <Button
            content={confirmButton || 'Confirm'}
            primary
            negative={negative}
            loading={loading}
            onClick={this.onClick}
          />
        </Modal.Actions>
      </>
    );
  }
}

ConfirmComponent.propTypes = {
  ...Confirm.propTypes,
  negative: PropTypes.bool,
};

ConfirmComponent.defaultProps = {
  confirmButton: 'OK',
  negative: false,
  onConfirm: () => {},
};
