import { TextInput } from '@mantine/core';
import PropTypes from 'prop-types';
import { PiXBold } from 'react-icons/pi';

import { useSearch } from '../Context';

export default function InputFilter(props) {
  const { name } = props;

  const { loading, filters, setFilters } = useSearch();

  function getValue() {
    return filters[name] || '';
  }

  function onClearClick() {
    setFilters({
      [name]: '',
    });
  }
  function onChange(evt) {
    setFilters({
      [name]: evt.target.value,
    });
  }

  function render() {
    return (
      <TextInput
        {...props}
        disabled={loading}
        style={{ minWidth: '220px' }}
        placeholder="Search by keyword"
        rightSection={renderIcon()}
        value={getValue()}
        onChange={onChange}
      />
    );
  }

  function renderIcon() {
    if (getValue()) {
      return <PiXBold onClick={onClearClick} />;
    }
  }

  return render();
}

InputFilter.propTypes = {
  name: PropTypes.string.isRequired,
};
