import React from 'react';
import { Form, Modal, Message, Button } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';

// --- Generator: imports
import UploadsField from 'components/form-fields/Uploads';
import CountriesField from 'components/form-fields/Countries';
import CategoriesField from 'components/form-fields/Categories';
// --- Generator: end

export default class EditShop extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      error: null,
      loading: false,
      shop: props.shop || {},
    };
  }

  componentDidUpdate(lastProps) {
    const { shop } = this.props;
    if (shop && shop !== lastProps.shop) {
      this.setState({
        shop,
      });
    }
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
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { shop } = this.state;
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
        this.setState({
          shop: {},
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
    const { shop, open, loading, error } = this.state;
    return (
      <Modal
        closeIcon
        open={open}
        trigger={trigger}
        closeOnDimmerClick={false}
        onOpen={() => this.setState({ open: true })}
        onClose={() => this.setState({ open: false })}>
        <Modal.Header>{this.isUpdate() ? `Edit "${shop.name}"` : 'New Shop'}</Modal.Header>
        <Modal.Content scrolling>
          <AutoFocus>
            <Form
              noValidate
              id="edit-shop"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              {/* --- Generator: fields */}
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
              <CountriesField label="Country" name="country" value={shop.country || 'US'} onChange={this.setField} />
              <CategoriesField name="categories" value={shop.categories || []} onChange={this.setField} />
              <UploadsField
                name="images"
                label="Images"
                value={shop.images || []}
                onChange={(data) => this.setField(null, data)}
                onError={(error) => this.setState({ error })}
              />
              {/* --- Generator: end */}
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
      </Modal>
    );
  }
}
