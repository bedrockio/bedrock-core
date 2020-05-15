import React from 'react';
import { observer, inject } from 'mobx-react';

import { Form, Label, Message, Button, Modal } from 'semantic-ui-react';

import DateTimeField from 'components/form-fields/DateTime';
import AutoFocus from 'components/AutoFocus';

function resetState(initialValues = {}) {
  const { sellingPoints = [] } = initialValues;

  return {
    open: false,
    sellingPointsOptions: sellingPoints.map((sellingPoint) => {
      return {
        value: sellingPoint,
        text: sellingPoint
      };
    }),
    formValues: {
      sellingPoints: [],
      ...initialValues
    }
  };
}

@inject('products')
@observer
export default class EditProduct extends React.Component {
  static defaultProps = {
    onSave: () => {},
    initialValues: {
      sellingPoints: []
    }
  };

  state = resetState(this.props.initialValues);

  componentDidUpdate(prevProps) {
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setState(resetState(this.props.initialValues));
    }
  }

  handleOnClose = () => {
    this.setState(resetState(this.props.initialValues));
  };

  handleSubmit = async () => {
    const { products, initialValues } = this.props;
    this.setState({
      touched: true
    });

    const action = initialValues.id
      ? products.update.bind(products)
      : products.create.bind(products);

    try {
      await action(this.state.formValues);
      this.setState({
        formValues: this.props.initialValues,
        open: false
      });
      this.props.onSave();
    } catch(err) {
      this.setState({
        error: err
      });
    }
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
        onClose={this.handleOnClose}
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
              <Form.Dropdown
                name="sellingPoints"
                selection
                multiple
                allowAdditions
                search
                options={this.state.sellingPointsOptions}
                onAddItem={(e, { value }) => {
                  this.setState((prevState) => ({
                    sellingPointsOptions: [
                      { text: value, value },
                      ...prevState.sellingPointsOptions
                    ]
                  }));
                }}
                label="Selling Points"
                onChange={(e, { value }) =>
                  this.setField('sellingPoints', value)
                }
                value={formValues.sellingPoints}
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
