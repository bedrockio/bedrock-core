import React from 'react';
import PropTypes from 'prop-types';
import DateField from 'components/form-fields/Date';

export default class DateFilter extends React.Component {
  render() {
    const { name } = this.props;
    return (
      <DateField
        id={name}
        clearable
        placeholder="Select Date"
        {...this.props}
      />
    );
  }
}

DateFilter.propTypes = {
  ...DateField.propTypes,
  name: PropTypes.string.isRequired,
};
