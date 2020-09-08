import React from 'react';
import { Form, Modal, Message, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import SearchDropdown from 'components/SearchDropdown';
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';

export default class EditShop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      touched: false,
      loading: false,
      error: null,
      hasError: false,
      item: props.item || {},
    };
  }

  isUpdate() {
    return !!this.props.item;
  }

  setField(name, value) {
    this.setState({
      item: {
        ...this.state.item,
        [name]: value,
      },
    });
  }

  onSubmit = async () => {
    try {
      const { item } = this.state;
      this.setState({
        loading: true,
        touched: true,
      });
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/shops/${item.id}`,
          body: {
            ...item,
            images: (item.images || []).map((image) => image.id),
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/shops',
          body: {
            ...item,
            images: (item.images || []).map((image) => image.id),
          },
        });
        this.setState({
          item: {},
          touched: false,
        });
      }
      this.setState({
        open: false,
        loading: false,
      });
      this.props.onSave();
    } catch (error) {
      console.log(error);
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
    const { item, open, touched, loading, error, hasError } = this.state;
    return (
      <Modal
        closeIcon
        closeOnDimmerClick={false}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}>
        <Modal.Header>{this.isUpdate() ? `Edit "${item.name}"` : 'New Shop'}</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && (error || hasError)}>
              {error && <Message error content={error.message} />}
              <Form.Input
                name="name"
                label="Name"
                required
                type="text"
                value={item.name || ''}
                onChange={(e, { value }) => this.setField('name', value)}
              />
              <Form.TextArea
                name="description"
                label="Description"
                type="text"
                value={item.description || ''}
                onChange={(e, { value }) => this.setField('description', value)}
              />
              <CountriesField
                label="Country"
                name="country"
                value={item.country || 'US'}
                onChange={(code) => this.setField('country', code)}
              />
              <Form.Field>
                <label>
                  Categories
                  <SearchDropdown
                    multiple
                    value={item.categories || []}
                    onChange={(e, { value }) => this.setField('categories', value)}
                    fetchData={this.fetchCategories}
                    fluid
                  />
                </label>
              </Form.Field>
              <UploadsField
                label="Images"
                name="images"
                value={item.images || []}
                onChange={(value) => this.setField('images', value)}
                onError={() => this.setState({ touched: true, hasError: true })}
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
