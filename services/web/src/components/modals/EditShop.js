import React from 'react';
import { Form, Modal, Message, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import inject from 'stores/inject';
import AutoFocus from 'components/AutoFocus';
import SearchDropDown from 'components/SearchDropdown';
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';

@inject('shops')
export default class EditShop extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      touched: false,
      loading: false,
      error: null,
      shop: props.shop || {},
    };
  }

  isUpdate() {
    return !!this.props.shop;
  }

  setShopField(name, value) {
    this.setState({
      shop: {
        ...this.state.shop,
        [name]: value,
      }
    });
  }

  onSubmit = async () => {
    try {
      const { shop } = this.state;
      this.setState({
        loading: true,
        touched: true,
      });
      if (this.isUpdate()) {
        await this.context.shops.update(shop);
      } else {
        await this.context.shops.create(shop);
        this.setState({
          shop: {},
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

  fetchCategories = (filter) => {
    return request({
      method: 'POST',
      path: '/1/categories/search',
      body: {
        ...filter,
      },
    });
  };

  render() {
    const { trigger } = this.props;
    const { shop, open, touched, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${shop.name}"` : 'New Shop'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error}>
              {error && <Message error content={error.message} />}
              <Form.Input
                name="name"
                label="Name"
                required
                type="text"
                value={shop.name || ''}
                onChange={(e, { value }) => this.setShopField('name', value)}
              />
              <Form.TextArea
                name="description"
                label="Description"
                type="text"
                value={shop.description || ''}
                onChange={(e, { value }) => this.setShopField('description', value)}
              />
              <CountriesField
                label="Country"
                name="country"
                value={shop.country || 'US'}
                onChange={(code) => this.setShopField('country', code)}
              />
              <Form.Field>
                <label>
                  Categories
                  <SearchDropDown
                    multiple
                    value={shop.categories || []}
                    onChange={(e, { value }) => this.setShopField('categories', value)}
                    fetchData={this.fetchCategories}
                    fluid
                  />
                </label>
              </Form.Field>
              <UploadsField
                label="Images"
                name="images"
                value={shop.images || []}
                onChange={(value) => this.setShopField('images', value)}
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
