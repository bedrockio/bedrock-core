import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Transition } from 'semantic';

export default class ManagedModal extends React.Component {
  state = {
    open: false,
  };

  onClose = () => {
    this.setState({ open: false });
    if (this.props.onClose) this.props.onClose();
  };

  onOpen = () => {
    this.setState({ open: true });
    if (this.props.onOpen) this.props.onOpen();
  };

  render() {
    const {
      onClose,
      onOpen,
      open = this.state.open,
      closeIcon = true,
      closeOnDimmerClick = false,
      trigger,
      content,
      ...rest
    } = this.props;

    return (
      <>
        {React.cloneElement(this.props.trigger, {
          ...rest,
          onClick: this.onOpen,
        })}

        <Transition visible={open} animation="scale" duration={500}>
          <Modal
            closeIcon={closeIcon}
            closeOnDimmerClick={closeOnDimmerClick}
            onOpen={this.onOpen}
            onClose={this.onClose}
            open={open}>
            {open &&
              React.cloneElement(this.props.content, {
                ...rest,
                close: this.onClose,
              })}
          </Modal>
        </Transition>
      </>
    );
  }
}

ManagedModal.propTypes = {
  ...Modal.propTypes,
  content: PropTypes.node.isRequired,
  trigger: PropTypes.node.isRequired,
};
