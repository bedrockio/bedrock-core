import React from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Message, Modal, Button } from 'semantic-ui-react';
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';

@inject('shops')
@observer
export default class EditShop extends React.Component {
  static defaultProps = {
    initialValues: {}
  };

  state = {
    open: false,
    formValues: { ...this.props.initialValues }
  };

  componentDidUpdate(prevProps) {
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setState({
        touched: false,
        formValues: { ...this.props.initialValues }
      });
    }
  }

  handleSubmit = () => {
    const { shops, initialValues } = this.props;
    this.setState({
      touched: true
    });

    const action = initialValues.id
      ? shops.update.bind(shops)
      : shops.create.bind(shops);

    return action(this.state.formValues).then((err) => {
      if (err instanceof Error) return;
      this.setState({
        formValues: this.props.initialValues,
        open: false,
        touched: false
      });
    });
  };

  setField(name, value) {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [name]: value
      }
    });
  }

  render() {
    const { shops, initialValues, trigger } = this.props;
    const { formValues = {}, touched, open } = this.state;

    const isUpdate = !!initialValues.id;
    const status = isUpdate
      ? shops.getStatus('update')
      : shops.getStatus('create');

    return (
      <Modal
        closeIcon
        onClose={() =>
          this.setState({
            open: false,
            formValues: this.props.initialValues,
            touched: false
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}
      >
        <Modal.Header>
          {isUpdate ? `Edit "${initialValues.name}"` : 'New Shop'}
        </Modal.Header>
        <Modal.Content>
          <Form
            error={touched && Boolean(status.error)}
            onSubmit={() => this.handleSubmit()}
          >
            {status.error && <Message error content={status.error.message} />}
            <Form.Input
              value={formValues.name || ''}
              name="name"
              label="Name"
              required
              type="text"
              onChange={(e, { name, value }) => this.setField(name, value)}
            />

            <Form.TextArea
              value={formValues.description || ''}
              name="description"
              label="Description"
              type="text"
              onChange={(e, { name, value }) => this.setField(name, value)}
            />

            <CountriesField
              label="Country"
              name="country"
              value={formValues.country || 'United States'}
              onChange={(value) => this.setField('country', value)}
            />

            <UploadsField
              label="Images"
              name="images"
              value={formValues.images || []}
              onChange={(value) => this.setField('images', value)}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            loading={status.request === true}
            primary
            content={isUpdate ? 'Update' : 'Create'}
            onClick={this.handleSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
