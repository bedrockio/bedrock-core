import React from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Message, Modal, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';
import AutoFocus from 'components/AutoFocus';
import SearchDropDown from 'components/SearchDropdown';

@inject('shops')
@observer
export default class EditShop extends React.Component {

  static defaultProps = {
    onSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      touched: false,
      shop: props.shop || {},
    };
  }

  isUpdate() {
    return !!this.props.shop;
  }

  onChange = (evt) => {
    const { name, value } = evt.target;
    this.setShopField(name, value);
  }

  onCountryChange = (code) => {
    this.setShopField('country', code);
  }

  onCategoryChange = (e, { value }) => {
    this.setShopField('categories', value);
  };

  onImagesChange = (value) => {
    this.setShopField('images', value);
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

    try {
      this.setState({
        loading: true,
        touched: true,
      });

      if (this.isUpdate()) {
        await this.props.shops.update(shop);
      } else {
        await this.props.shops.create(shop);
      }

      this.setState({
        open: false,
        loading: false,
        touched: false,
        shop: {},
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
    const { open, shop, touched, loading, error } = this.state;

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
        <Modal.Header>
          {this.isUpdate() ? `Edit "${shop.name}"` : 'New Shop'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && error} onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Input
                name="name"
                label="Name"
                required
                type="text"
                value={shop.name || ''}
                onChange={this.onChange}
              />

              <Form.TextArea
                name="description"
                label="Description"
                type="text"
                value={shop.description || ''}
                onChange={this.onChange}
              />
              <CountriesField
                label="Country"
                name="country"
                value={shop.country || 'US'}
                onChange={this.onCountryChange}
              />
              <Form.Field>
                <label>
                  Categories
                  <SearchDropDown
                    multiple
                    value={shop.categories || []}
                    onChange={this.onCategoryChange}
                    fetchData={this.fetchCategories}
                    fluid
                  />
                </label>
              </Form.Field>
              <UploadsField
                label="Images"
                name="images"
                value={shop.images || []}
                onChange={this.onImagesChange}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            loading={loading}
            onClick={this.onSubmit}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
