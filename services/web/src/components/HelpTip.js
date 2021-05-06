import React from 'react';
import { Icon, Modal, Button, Header } from 'semantic';

export default class HelpTip extends React.Component {
  state = { open: false };

  close = (e) => {
    e.stopPropagation();
    this.setState({ open: false });
  };
  open = (e) => {
    e.stopPropagation();
    this.setState({ open: true });
  };

  render() {
    const { icon, title, text } = this.props;

    return (
      <div style={{ display: 'inline-block', marginLeft: '0.5em' }}>
        <Icon
          name="question-circle"
          style={{ color: '#cccccc', cursor: 'pointer' }}
          onClick={this.open}
        />
        {this.state.open && (
          <Modal
            open={true}
            basic
            size="small"
            closeOnEscape={true}
            closeOnDimmerClick={true}
            onClose={this.close}>
            <Header
              icon={icon || 'info circle'}
              content={title || 'Explanation'}
            />
            <Modal.Content>
              <p>{text}</p>
            </Modal.Content>
            <Modal.Actions>
              <Button inverted onClick={this.close}>
                Close
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      </div>
    );
  }
}
