import React from 'react';
import { Form } from 'semantic-ui-react';
import { request } from 'utils/api';
import inject from 'stores/inject';
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';
import SearchDropDown from 'components/SearchDropdown';
import EditModal from './EditModal';

@inject('shops')
export default class EditShop extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
    const { shop } = this.state;
    if (this.isUpdate()) {
      await this.context.shops.update(shop);
    } else {
      await this.context.shops.create(shop);
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
    const { trigger, onSave } = this.props;
    const { shop } = this.state;
    return (
      <EditModal
        onSave={onSave}
        trigger={trigger}
        header={this.isUpdate() ? `Edit "${shop.name}"` : 'New Shop'}
        submitText={this.isUpdate() ? 'Update' : 'Create'}
        onSubmit={this.onSubmit}>
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
      </EditModal>
    );
  }
}
