import React from 'react';
import { Modal, Form, Label, Button, Message } from 'semantic-ui-react';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import DateTimeField from 'components/form-fields/DateTime';
import UploadsField from 'components/form-fields/Uploads';

export default class EditProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      touched: false,
      loading: false,
      error: null,
      hasError: false,
      item: {
        ...props.item,
        shop: props.shopId,
      },
      sellingPoints: props.item?.sellingPoints || [],
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
      this.setState({
        loading: true,
        touched: true,
      });
      const { item } = this.state;
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/products/${item.id}`,
          body: {
            ...item,
            images: (item.images || []).map((image) => image.id),
          },
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/products',
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
      this.setState({
        error,
        loading: false,
      });
    }
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
        <Modal.Header>{this.isUpdate() ? `Edit "${item.name}"` : 'New Product'}</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form error={touched && (!!error || hasError)}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                name="name"
                label="Name"
                type="text"
                value={item.name || ''}
                onChange={(e, { value }) => this.setField('name', value)}
              />
              <Form.TextArea
                name="description"
                label="Description"
                value={item.description || ''}
                onChange={(e, { value }) => this.setField('description', value)}
              />
              <Form.Checkbox
                label="Is Featured?"
                name="isFeatured"
                checked={item.isFeatured || false}
                onChange={(e, { checked }) => this.setField('isFeatured', checked)}
              />
              <Form.Input
                labelPosition="right"
                placeholder="Amount"
                name="priceUsd"
                type="number"
                onChange={(e, { value }) => this.setField('priceUsd', parseInt(value, 10))}
                value={item.priceUsd || ''}>
                <Label basic>$</Label>
                <input />
                <Label>.00</Label>
              </Form.Input>
              <DateTimeField
                name="expiresAt"
                value={item.expiresAt || new Date()}
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
                onChange={(e, { value }) => this.setField('sellingPoints', value)}
                value={item.sellingPoints || []}
              />
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
