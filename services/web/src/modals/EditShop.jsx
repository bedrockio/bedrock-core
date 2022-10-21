import React from 'react';
import { Form, Modal, Button } from '/semantic';
import { request } from '/utils/api';
import AutoFocus from '/components/AutoFocus';
import modal from '/helpers/modal';

import UploadsField from '/components/form-fields/Uploads';
import CountriesField from '/components/form-fields/Countries';
import AddressField from '/components/form-fields/Address';
import ErrorMessage from '/components/ErrorMessage';
import SearchDropdown from '/components/form-fields/SearchDropdown';

class EditShop extends React.Component {
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
      this.props.close();
      this.props.onSave();
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
              <ErrorMessage error={error} />
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
              <CountriesField
                name="country"
                label="Country"
                value={shop.country || ''}
                onChange={this.setField}
              />
              <SearchDropdown
                name="categories"
                value={shop.categories || []}
                multiple
                onChange={this.setField}
                searchPath="/1/categories/search"
                label="Categories"
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

export default modal(EditShop);
