import React from 'react';
import { Form } from 'semantic';
import { pick, omit } from 'lodash';

import SearchDropdown from '../SearchDropdown';

const fieldTypes = Object.keys(Form.Field.propTypes);

export default class FormSearchDropdown extends React.Component {
  render() {
    const { label, ...fieldProps } = pick(this.props, fieldTypes);
    const dropdownProps = omit(this.props, fieldTypes);
    return (
      <Form.Field {...fieldProps}>
        <label>{label}</label>
        <SearchDropdown fluid {...dropdownProps} />
      </Form.Field>
    );
  }
}
