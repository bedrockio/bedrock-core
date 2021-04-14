import React from 'react';
import { Form } from 'semantic';
import { request } from 'utils/api';
import SearchDropdown from '../SearchDropdown';

export default class Categories extends React.Component {

  fetchCategories = async (query) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/categories/search',
      body: {
        name: query,
      },
    });
    return data;
  };

  render() {
    return (
      <Form.Field>
        <label>
          Categories
        </label>
        <SearchDropdown
          fluid
          multiple
          onDataNeeded={this.fetchCategories}
          {...this.props}
        />
      </Form.Field>
    );
  }

}
