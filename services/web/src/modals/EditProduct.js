import React from 'react';
import { Modal, Form, Button, Message } from 'semantic';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import { modal } from 'helpers';

// --- Generator: imports
import DateField from 'components/form-fields/Date';
import UploadsField from 'components/form-fields/Uploads';
import CurrencyField from 'components/form-fields/Currency';
// --- Generator: end

@modal
export default class EditProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      product: props.product || {},
    };
  }

  isUpdate() {
    return !!this.props.product;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      product: {
        ...this.state.product,
        [name]: value,
      },
    });
  };

  setNumberField = (evt, { name, value }) => {
    this.setField(evt, { name, value: Number(value) });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
    });
    const { product } = this.state;

    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/products/${product.id}`,
          body: {
            // --- Generator: refs
            shop: this.props.shop.id,
            // --- Generator: end
            ...product,
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/products',
          body: {
            // --- Generator: refs
            shop: this.props.shop.id,
            // --- Generator: end
            ...product,
          },
        });
      }
      this.props.onSave();
      this.props.close();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { product, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${product.name}"` : 'New Product'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              noValidate
              id="edit-product"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              {/* --- Generator: fields */}
              <Form.Input
                required
                type="text"
                name="name"
                label="Name"
                value={product.name || ''}
                onChange={this.setField}
              />
              <Form.TextArea
                name="description"
                label="Description"
                value={product.description || ''}
                onChange={this.setField}
              />
              <Form.Checkbox
                name="isFeatured"
                label="Is Featured?"
                checked={product.isFeatured || false}
                onChange={this.setCheckedField}
              />
              <CurrencyField
                name="priceUsd"
                label="Price"
                value={product.priceUsd || ''}
                onChange={this.setField}
              />
              <DateField
                time
                name="expiresAt"
                value={product.expiresAt}
                label="Expiration Date and Time"
                onChange={this.setField}
              />
              <Form.Dropdown
                name="sellingPoints"
                search
                selection
                multiple
                allowAdditions
                options={
                  product.sellingPoints?.map((value) => {
                    return {
                      value,
                      text: value,
                    };
                  }) || []
                }
                label="Selling Points"
                onAddItem={(evt, { name, value }) => {
                  this.setField(evt, {
                    name,
                    value: [...(product.sellingPoints || []), value],
                  });
                }}
                onChange={this.setField}
                value={product.sellingPoints || []}
              />
              <UploadsField
                name="images"
                label="Images"
                value={product.images || []}
                onChange={this.setField}
                onError={(error) => this.setState({ error })}
              />
              {/* --- Generator: end */}
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-product"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
