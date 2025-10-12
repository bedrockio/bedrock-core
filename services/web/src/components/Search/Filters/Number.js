import { NumberInput } from '@mantine/core';
import PropTypes from 'prop-types';

import NumberField from 'components/form-fields/Number';

import { useSearch } from '../Context';

export default function NumberFilter(props) {
  const { name, value, label, min, max, ...rest } = props;

  const { filters, setFilters } = useSearch();

  function onChange({ name, value }) {
    setFilters({
      [name]: value,
    });
  }

  return (
    <NumberField
      {...rest}
      name={name}
      min={min}
      max={max}
      label={label}
      value={filters[name] || ''}
      onChange={onChange}
    />
  );
}

NumberFilter.propTypes = {
  ...NumberInput.propTypes,
  name: PropTypes.string.isRequired,
};
