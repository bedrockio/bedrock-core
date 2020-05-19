import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button, Message } from 'semantic-ui-react';
import AutoFocus from 'components/AutoFocus';

export default class EditModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }

  reset = () => {
    this.setState(this.getDefaultState());
  }

  getDefaultState() {
    return {
      open: false,
      touched: false,
      loading: false,
      error: null,
    };
  }

  onSubmit = async () => {
    try {
      this.setState({
        loading: true,
        touched: true,
      });
      await this.props.onSubmit();
      this.setState(this.getDefaultState());
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };
  render() {
    const { onSave, onSubmit, submitText, submitDisabled, header, children, ...rest } = this.props;
    const { open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        onClose={this.reset}
        onOpen={() => this.setState({ open: true })}
        open={open}
        {...rest}>
        <Modal.Header>
          {header}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              {children}
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading || submitDisabled}
            content={submitText}
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }

}

EditModal.propTypes = {
  ...Modal.propTypes,
  onSave: PropTypes.func,
  submitText: PropTypes.string,
  submitDisabled: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  header: PropTypes.string,
};

EditModal.defaultProps = {
  header: 'Edit',
  submitText: 'Save',
  submitDisabled: false,
  onSave: () => {},
};
