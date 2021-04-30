import React from 'react';
import { Modal } from 'semantic';

export default function modal(Component) {
  class WrappedModal extends React.Component {
    state = {
      open: this.props.open,
      modalKey: Date.now(),
    };

    componentDidUpdate(lastProps) {
      const { open } = this.props;
      if (open !== lastProps.open) {
        this.setState({
          open,
        });
      }
    }

    onReset = () => {
      this.setState({ modalKey: Date.now() });
      if (this.props.onReset) this.props.onReset();
    };

    onClose = (success) => {
      this.setState({ open: false });
      if (this.props.onClose) this.props.onClose(success);
      if (this.props.onSave && success) {
        this.props.onSave(success);
      }
    };

    onOpen = () => {
      this.setState({ open: true });
      if (this.props.onOpen) this.props.onOpen();
    };

    render() {
      const { open, modalKey } = this.state;
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
          onClose={() => this.onClose()}
          trigger={trigger}
          centered={centered}
          open={open}>
          <Component
            key={modalKey}
            {...rest}
            onClose={this.onClose}
            reset={this.onReset}
          />
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
