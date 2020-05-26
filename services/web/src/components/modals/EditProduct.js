import React from 'react';
import { Modal, Form, Label, Button, Message } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import DateTimeField from 'components/form-fields/DateTime';

export default class EditProduct extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      touched: false,
      loading: false,
      error: null,
      product: {
        ...props.product,
        shop: props.shopId,
      },
      sellingPoints: props.product?.sellingPoints || [],
    };
  }

  isUpdate() {
    return !!this.props.product;
  }

  setProductField(name, value) {
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

  onSubmit = async () => {
    try {
      const { product } = this.state;
      this.setState({
        loading: true,
        touched: true,
      });
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/products/${product.id}`,
          body: product,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/products',
          body: product
        });
        this.setState({
          product: {},
          touched: false,
        });
      }
      this.setState({
        open: false,
        loading: false,
      });
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { trigger } = this.props;
    const { product, open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${product.name}"` : 'New Product'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                name="name"
                label="Name"
                type="text"
                value={product.name || ''}
                onChange={(e, { value }) => this.setProductField('name', value)}
              />
              <Form.TextArea
                name="description"
                label="Description"
                value={product.description || ''}
                onChange={(e, { value }) => this.setProductField('description', value)}
              />
              <Form.Checkbox
                label="Is Featured?"
                name="isFeatured"
                checked={product.isFeatured || false}
                onChange={(e, { checked }) => this.setProductField('isFeatured', checked)}
              />
              <Form.Input
                labelPosition="right"
                placeholder="Amount"
                name="priceUsd"
                type="number"
                onChange={(e, { value }) => this.setProductField('priceUsd', parseInt(value, 10))}
                value={product.priceUsd || ''}>
                <Label basic>$</Label>
                <input />
                <Label>.00</Label>
              </Form.Input>
              <DateTimeField
                name="expiresAt"
                value={product.expiresAt || new Date()}
                label="Expiration Date and Time"
                onChange={(value) => this.setProductField('expiresAt', value)}
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
                onChange={(e, { value }) => this.setProductField('sellingPoints', value)}
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
            content={this.isUpdate() ? 'Update' : 'Create'}
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }

}
