import React from 'react';
import { Form, Label } from 'semantic-ui-react';
import inject from 'stores/inject';

import DateTimeField from 'components/form-fields/DateTime';
import EditModal from './EditModal';

@inject('products')
export default class EditProduct extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      product: {
        ...props.product,
        shopId: props.shopId,
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
    const { product } = this.state;
    if (this.isUpdate()) {
      await this.context.products.update(product);
    } else {
      await this.context.products.create(product);
    }
  };

  render() {
    const { trigger, onSave } = this.props;
    const { product } = this.state;
    return (
      <EditModal
        onSave={onSave}
        trigger={trigger}
        header={this.isUpdate() ? `Edit "${product.name}"` : 'New Product'}
        submitText={this.isUpdate() ? 'Update' : 'Create'}
        onSubmit={this.onSubmit}>
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
      </EditModal>
    );
  }
}
