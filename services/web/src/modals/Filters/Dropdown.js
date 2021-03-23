import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';
import { Form } from 'semantic-ui-react';
import SearchDropdown from 'components/SearchDropdown';

export default class DropdownFilter extends React.Component {
  render() {
    if (this.props.options) {
      return <Form.Dropdown {...this.props} />;
    } else {
      const { label, disabled, error, ...rest } = this.props;
      return (
        <Form.Field disabled={disabled} error={error}>
          <label>{label}</label>
          <SearchDropdown {...rest} />
        </Form.Field>
      );
    }
  }
}

DropdownFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

DropdownFilter.defaultProps = {
  fluid: true,
  search: false,
  clearable: true,
  selection: true,
};
