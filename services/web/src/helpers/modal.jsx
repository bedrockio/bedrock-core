import React from 'react';
import { Modal } from '/semantic';

export default function modal(Component) {
  class WrappedModal extends React.Component {
    state = {
      open: this.props.open,
    };

    componentDidUpdate(lastProps) {
      const { open } = this.props;
      if (open !== lastProps.open) {
        this.setState({
          open,
        });
      }
    }

    onClose = () => {
      this.setState({ open: false });
      if (this.props.onClose) {
        this.props.onClose();
      }
    };

    onOpen = () => {
      this.setState({ open: true });
      if (this.props.onOpen) {
        this.props.onOpen();
      }
    };

    trapNativeEvents = (evt) => {
      // Due to react event delegation semantic can bug out by
      // catching events outside modals event though they are not
      // DOM children, so stop propagation on all events to prevent this.
      evt.stopPropagation();
    };

    render() {
      const { open } = this.state;
      const {
        onClose,
        onOpen,
        closeIcon,
        closeOnDimmerClick,
        closeOnDocumentClick,
        trigger,
        centered,
        size,
        ...rest
      } = this.props;

      return (
        <Modal
          onClick={this.trapNativeEvents}
          onFocus={this.trapNativeEvents}
          onBlur={this.trapNativeEvents}
          onMouseDown={this.trapNativeEvents}
          onMouseUp={this.trapNativeEvents}
          onKeyDown={this.trapNativeEvents}
          closeIcon={closeIcon}
          closeOnDimmerClick={closeOnDimmerClick}
          closeOnDocumentClick={closeOnDocumentClick}
          size={size}
          onOpen={this.onOpen}
          onClose={this.onClose}
          trigger={trigger}
          centered={centered}
          open={open}>
          <Component {...rest} close={this.onClose} />
        </Modal>
      );
    }
  }
  WrappedModal.propTypes = Modal.propTypes;

  WrappedModal.defaultProps = {
    ...Modal.defaultProps,
    closeOnDimmerClick: false,
    closeIcon: true,
    open: false,
  };

  return WrappedModal;
}
