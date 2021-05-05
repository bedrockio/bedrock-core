import React from 'react';
import { Modal } from 'semantic';

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
      if (this.props.onClose) this.props.onClose();
    };

    onOpen = () => {
      this.setState({ open: true });
      if (this.props.onOpen) this.props.onOpen();
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
          closeIcon={closeIcon}
          closeOnDimmerClick={closeOnDimmerClick}
          closeOnDocumentClick={closeOnDocumentClick}
          size={size}
          onOpen={this.onOpen}
          onClose={this.onClose}
          trigger={trigger}
          centered={centered}
          open={open}>
          <Component {...rest} onClose={this.onClose} />
        </Modal>
      );
    }
  }
  WrappedModal.propTypes = Modal.propTypes;

  WrappedModal.defaultProps = {
    closeOnDimmerClick: false,
    closeIcon: true,
    open: false,
  };

  return WrappedModal;
}
