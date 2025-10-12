import { Checkbox } from '@mantine/core';
import PropTypes from 'prop-types';

import { useSearch } from '../Context';

export default function CheckboxFilter(props) {
  const { name, ...rest } = props;

  const { filters, setFilters } = useSearch();

  function onChange(evt) {
    setFilters({
      [name]: evt.target.checked,
    });
  }

  return (
    <Checkbox
      id={name}
      name={name}
      checked={filters[name] || false}
      onChange={onChange}
      {...rest}
    />
  );
}

CheckboxFilter.propTypes = {
  ...Checkbox.propTypes,
  name: PropTypes.string.isRequired,
};
