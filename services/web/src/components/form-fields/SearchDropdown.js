import React from 'react';
import { Form } from 'semantic';
import { omit } from 'lodash';

import SearchDropdown from '../SearchDropdown';

export default class FormSearchDropdown extends React.Component {
  render() {
    const { label, required, ...props } = omit(
      this.props,
      Form.Field.propTypes
    );
    return (
      <Form.Field required={required}>
        <label>{label}</label>
        <SearchDropdown fluid {...props} />
      </Form.Field>
    );
  }
}
