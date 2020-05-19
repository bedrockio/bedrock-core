import React from 'react';
import { Form, Label, Message, Button, Modal } from 'semantic-ui-react';
import inject from 'stores/inject';

import DateTimeField from 'components/form-fields/DateTime';
import AutoFocus from 'components/AutoFocus';

@inject('products')
export default class EditProduct extends React.Component {
  static defaultProps = {
    onSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      touched: false,
      product: props.product || {},
      sellingPoints: props.product?.sellingPoints || [],
    };
  }

  isUpdate() {
    return !!this.props.product;
  }

  onSubmit = async () => {
    const { product } = this.state;
    try {
      this.setState({
        loading: true,
        touched: true,
      });

      if (this.isUpdate()) {
        await this.context.products.update(product);
      } else {
        await this.context.products.create(product);
      }

      this.setState({
        open: false,
        loading: false,
        touched: false,
        product: {},
      });
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  setField(name, value) {
    this.setState({
      product: {
        ...this.state.product,
        [name]: value,
      },
    });
  }

  getSellingPointsOptions() {
    const { sellingPoints } = this.state;
    return sellingPoints.map((point) => {
      return {
        text: point,
        value: point,
      };
    });
  }

  render() {
    const { trigger } = this.props;
    const { product, touched, open, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        onClose={() =>
          this.setState({
            open: false,
            touched: false,
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>{this.isUpdate() ? `Edit Product "${product.name}"` : 'New Product'}</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error} onSubmit={() => this.onSubmit()}>
              {error && <Message error content={error.message} />}

              <Form.Input
                error={touched && !(product.name || '').length}
                required
                name="name"
                label="Name"
                type="text"
                value={product.name || ''}
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <Form.TextArea
                name="description"
                label="Description"
                value={product.description || ''}
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <Form.Checkbox
                label="Is Featured?"
                name="isFeatured"
                checked={product.isFeatured || false}
                onChange={(e, { name, checked }) => this.setField(name, checked)}
              />

              <Form.Input
                labelPosition="right"
                placeholder="Amount"
                name="priceUsd"
                type="number"
                onChange={(e, { name, value }) => this.setField(name, parseInt(value, 10))}
                value={product.priceUsd || 0}>
                <Label basic>$</Label>
                <input />
                <Label>.00</Label>
              </Form.Input>

              <DateTimeField
                name="expiresAt"
                value={product.expiresAt || new Date()}
                label="Expiration Date and Time"
                onChange={(value) => this.setField('expiresAt', value)}
              />
              <Form.Dropdown
                name="sellingPoints"
                selection
                multiple
                allowAdditions
                search
                options={this.getSellingPointsOptions()}
                label="Selling Points"
                onAddItem={(e, { value }) => {
                  this.setState({
                    sellingPoints: [...this.state.sellingPoints, value],
                  });
                }}
                onChange={(e, { value }) => {
                  this.setField('sellingPoints', value);
                }}
                value={product.sellingPoints || []}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            disabled={loading}
            onClick={this.onSubmit}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
