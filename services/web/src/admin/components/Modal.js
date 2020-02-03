import React from 'react';
import { observer } from 'mobx-react';

import { Modal, Button } from 'semantic-ui-react';

@observer
export default class ModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: props.open || false
    };
  }

  componentDidUpdate(prevProps) {
    const status = this.props.status;
    const prevStatus = prevProps.status;
    if (status !== prevStatus && status.success) {
      this.close();
    }
  }

  handleCloseDialog = () => {
    this.setState({
      showDialog: false
    });
    this.props.onClose && this.props.onClose();
  };

  handleOpenDialog = () => {
    this.setState({
      showDialog: true
    });
    this.props.onOpen && this.props.onOpen();
  };

  open = () => {
    this.handleOpenDialog();
  };

  close = () => {
    this.handleCloseDialog();
  };

  render() {
    const { children, trigger, title, action, actions = [], open } = this.props;
    const triggerComponet =
      trigger &&
      React.cloneElement(trigger, {
        onClick: this.handleOpenDialog
      });

    return (
      <Modal
        closeIcon
        open={open || this.state.showDialog}
        onClose={this.handleCloseDialog}
        closeOnEscape
        size="small"
        trigger={triggerComponet}
      >
        {title && <Modal.Header>{title}</Modal.Header>}
        <Modal.Content>{children}</Modal.Content>

        <Modal.Actions>
          {action && <Button primary {...action} />}
          {actions.length > 0 &&
            actions.map((action) => {
              return <Button key={action.content} {...action} />;
            })}
        </Modal.Actions>
      </Modal>
    );
  }
}
