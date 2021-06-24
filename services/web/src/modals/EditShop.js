import React from 'react';
import { Form, Modal, Message, Button } from 'semantic';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import { modal } from 'helpers';

import UploadsField from 'components/form-fields/Uploads';
import CategoriesField from 'components/form-fields/Categories';
import AddressField from 'components/form-fields/Address';

@modal
export default class EditShop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      shop: props.shop || {},
    };
  }

  isUpdate() {
    return !!this.props.shop;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      shop: {
        ...this.state.shop,
        [name]: value,
      },
    });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  setNumberField = (evt, { name, value }) => {
    this.setField(evt, { name, value: Number(value) });
  };

  onSubmit = async () => {
    this.setState({
      error: null,
      loading: true,
    });
    const { shop } = this.state;
    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/shops/${shop.id}`,
          body: shop,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/shops',
          body: shop,
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
    const { shop, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${shop.name}"` : 'New Shop'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              noValidate
              id="edit-shop"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                type="text"
                name="name"
                label="Name"
                value={shop.name || ''}
                onChange={this.setField}
              />
              <Form.TextArea
                name="description"
                label="Description"
                type="text"
                value={shop.description || ''}
                onChange={this.setField}
              />
              <CategoriesField
                name="categories"
                value={shop.categories || []}
                onChange={this.setField}
              />
              <UploadsField
                name="images"
                label="Images"
                value={shop.images || []}
                onChange={this.setField}
                onError={(error) => this.setState({ error })}
              />
              <AddressField
                value={shop.address}
                onChange={this.setField}
                name="address"
                autoComplete="off"
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-shop"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
