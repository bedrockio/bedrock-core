import React from 'react';
import { Form } from 'semantic-ui-react';
import { request } from 'utils/api';
import SearchDropdown from '../SearchDropdown';

export default class Categories extends React.Component {

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
    return (
      <Form.Field>
        <label>
          Categories
        </label>
        <SearchDropdown
          fluid
          multiple
          fetchData={this.fetchCategories}
          {...this.props}
        />
      </Form.Field>
    );
  }

}
