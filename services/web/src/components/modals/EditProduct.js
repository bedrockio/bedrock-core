import React from 'react';
import { observer, inject } from 'mobx-react';

import { Form, Label, Message, Button, Modal } from 'semantic-ui-react';

import DateTimeField from 'components/form-fields/DateTime';
import ListField from 'components/form-fields/List';
import AutoFocus from 'components/AutoFocus';

@inject('products')
@observer
export default class EditProduct extends React.Component {
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
    const { products, initialValues } = this.props;
    this.setState({
      touched: true
    });

    const action = initialValues.id
      ? products.update.bind(products)
      : products.create.bind(products);

    return action(this.state.formValues).then((err) => {
      if (err instanceof Error) return;
      this.setState({
        formValues: this.props.initialValues,
        open: false
      });
    });
  };

  setField(name, value) {
    this.setState({
      touched: false,
      formValues: {
        ...this.state.formValues,
        [name]: value
      }
    });
  }

  render() {
    const { products, initialValues, trigger } = this.props;
    const { formValues = {}, touched, open } = this.state;

    const isUpdate = !!initialValues.id;
    const status = isUpdate
      ? products.getStatus('update')
      : products.getStatus('create');

    return (
      <Modal
        closeIcon
        trigger={trigger}
        onClose={() =>
          this.setState({
            open: false,
            formValues: this.props.initialValues,
            touched: false
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
      >
        <Modal.Header>
          {isUpdate ? `Edit Product "${initialValues.name}"` : 'New Product'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              error={touched && Boolean(status.error)}
              onSubmit={() => this.handleSubmit()}
            >
              {status.error && <Message error content={status.error.message} />}

              <Form.Input
                error={touched && !(formValues.name || '').length}
                required
                name="name"
                label="Name"
                type="text"
                value={formValues.name || ''}
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <Form.TextArea
                name="description"
                label="Description"
                value={formValues.description || ''}
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <Form.Checkbox
                label="Is Featured?"
                name="isFeatured"
                checked={formValues.isFeatured || false}
                onChange={(e, { name, checked }) =>
                  this.setField(name, checked)
                }
              />

              <Form.Input
                labelPosition="right"
                placeholder="Amount"
                name="priceUsd"
                type="number"
                onChange={(e, { name, value }) =>
                  this.setField(name, parseInt(value, 10))
                }
                value={formValues.priceUsd || 0}
              >
                <Label basic>$</Label>
                <input />
                <Label>.00</Label>
              </Form.Input>

              <DateTimeField
                name="expiresAt"
                value={formValues.expiresAt || new Date()}
                label="Expiration Date and Time"
                onChange={(value) => this.setField('expiresAt', value)}
              />
              <ListField
                type="text"
                name="sellingPoints"
                label="Selling Points"
                value={formValues.sellingPoints || []}
                onChange={(value) => this.setField('sellingPoints', value)}
              />
            </Form>
          </AutoFocus>
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
