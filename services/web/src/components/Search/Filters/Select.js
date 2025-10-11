import { Select } from '@mantine/core';
import PropTypes from 'prop-types';

import SearchDropdown from 'components/SearchDropdown';

import { useSearch } from '../Context';

export default function SelectFilter(props) {
  const { name, data, multiple, ...rest } = props;

  const { filters, setFilters } = useSearch();

  function getDefaultValue() {
    return multiple ? [] : '';
  }

  function getValue() {
    return filters[name] || getDefaultValue();
  }

  function getData() {
    if (!data) {
      const value = getValue();
      const arr = Array.isArray(value) ? value : [value];
      return arr.map((value) => {
        return {
          key: value,
          value,
          text: value,
        };
      });
    }
    return data;
  }

  function render() {
    if (props.onDataNeeded) {
      const { label, ...rest } = props;
      return (
        <SearchDropdown
          label={label}
          objectMode={false}
          value={getValue()}
          onChange={(value) => {
            setFilters({
              [name]: value,
            });
          }}
          {...rest}
        />
      );
    } else {
      return (
        <Select
          value={getValue()}
          data={getData()}
          onChange={(value) => {
            setFilters({
              [name]: value,
            });
          }}
          {...rest}
        />
      );
    }
  }

  return render();
}

SelectFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

SelectFilter.defaultProps = {
  clearable: true,
};
