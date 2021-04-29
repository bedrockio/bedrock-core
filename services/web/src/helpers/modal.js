import React from 'react';
import { Modal } from 'semantic';

export default function modal(Component) {
  class ModalWrapper extends React.Component {
    state = {
      open: this.props.open,
      modelKey: Date.now(),
    };

    componentDidUpdate(lastProps) {
      const { open } = this.props;
      if (open && open !== lastProps.open) {
        this.setState({
          open,
        });
      }
    }

    onReset = () => {
      this.setState({ modelKey: Date.now() });
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
      const { open, modelKey } = this.state;
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
          {open && (
            <Component
              key={modelKey}
              {...rest}
              onClose={this.onClose}
              reset={this.onReset}
            />
          )}
        </Modal>
      );
    }
  }
  ModalWrapper.propTypes = Modal.propTypes;

  ModalWrapper.defaultProps = {
    closeOnDimmerClick: false,
    closeIcon: true,
    open: false,
  };

  return ModalWrapper;
}
