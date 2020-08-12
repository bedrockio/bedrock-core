import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

export default class DropdownFilter extends React.Component {
  render() {
    return <Form.Dropdown id={this.props.name} {...this.props} />;
  }
}

DropdownFilter.propTypes = {
  ...Form.Dropdown.propTypes,
  name: PropTypes.string.isRequired,
};

DropdownFilter.defaultProps = {
  fluid: true,
  search: false,
  clearable: true,
  selection: true,
};
