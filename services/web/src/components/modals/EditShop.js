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
    initialValues: {}
  };

  state = {
    open: false,
    formValues: { ...this.props.initialValues }
  };

  componentDidUpdate(prevProps) {
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setState({
        touched: false,
        formValues: { ...this.props.initialValues }
      });
    }
  }

  handleSubmit = async () => {
    const { shops, initialValues } = this.props;
    this.setState({
      touched: true
    });

    const action = initialValues.id
      ? shops.update.bind(shops)
      : shops.create.bind(shops);

    try {
      await action(this.state.formValues);
      this.setState({
        formValues: this.props.initialValues,
        open: false,
        touched: false
      });
      this.props.onSave();
    } catch(err) {
      // TODO: handle this
      this.setState({
        error: err
      });
    }
  };

  setField(name, value) {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [name]: value
      }
    });
  }

  fetchCategories = (filter) => {
    return request({
      method: 'POST',
      path: '/1/categories/search',
      body: {
        ...filter
      }
    });
  };

  handleOnCategoryChange = (e, { value }) => {
    this.setField('categories', value);
  };

  render() {
    const { shops, initialValues, trigger } = this.props;
    const { formValues = {}, touched, open } = this.state;

    const isUpdate = !!initialValues.id;
    const status = isUpdate
      ? shops.getStatus('update')
      : shops.getStatus('create');

    return (
      <Modal
        closeIcon
        onClose={() =>
          this.setState({
            open: false,
            formValues: this.props.initialValues,
            touched: false
          })
        }
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}
      >
        <Modal.Header>
          {isUpdate ? `Edit "${initialValues.name}"` : 'New Shop'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              error={touched && Boolean(status.error)}
              onSubmit={() => this.handleSubmit()}
            >
              {status.error && <Message error content={status.error.message} />}
              <Form.Input
                value={formValues.name || ''}
                name="name"
                label="Name"
                required
                type="text"
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <Form.TextArea
                value={formValues.description || ''}
                name="description"
                label="Description"
                type="text"
                onChange={(e, { name, value }) => this.setField(name, value)}
              />

              <CountriesField
                label="Country"
                name="country"
                value={formValues.country || 'United States'}
                onChange={(value) => this.setField('country', value)}
              />
              <Form.Field>
                <label>
                  Categories
                  <SearchDropDown
                    onChange={this.handleOnCategoryChange}
                    value={formValues.categories || []}
                    multiple
                    fetchData={this.fetchCategories}
                    fluid
                  />
                </label>
              </Form.Field>

              <UploadsField
                label="Images"
                name="images"
                value={formValues.images || []}
                onChange={(value) => this.setField('images', value)}
              />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            loading={status.request === true}
            primary
            content={isUpdate ? 'Update' : 'Create'}
            onClick={this.handleSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}
