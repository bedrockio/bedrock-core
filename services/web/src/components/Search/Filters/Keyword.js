import { TextInput } from '@mantine/core';
import { useState } from 'react';
import { PiMagnifyingGlass, PiXBold } from 'react-icons/pi';

import { useDebounce } from 'hooks/debounce';

import { useSearch } from '../Context';

export default function KeywordFilter(props) {
  const { loading, filters, setFilters } = useSearch();

  const [keyword, setKeyword] = useState(filters.keyword || '');

  function onChange(evt) {
    const { value } = evt.currentTarget;
    setKeyword(value);
    setFilterDeferred(value);
  }

  function onClearClick() {
    setKeyword('');
    setFilters({
      keyword: '',
    });
  }

  const setFilterDeferred = useDebounce({
    run(newKeyword) {
      setFilters({
        keyword: newKeyword,
      });
    },
    timeout: 500,
    deps: [setFilters],
  });

  function render() {
    return (
      <TextInput
        {...props}
        disabled={loading}
        type="search"
        style={{ minWidth: '220px' }}
        placeholder="Search by keyword"
        rightSection={renderIcon()}
        value={keyword}
        onChange={onChange}
      />
    );
  }

  function renderIcon() {
    if (keyword) {
      return <PiXBold onClick={onClearClick} />;
    } else {
      return <PiMagnifyingGlass />;
    }
  }

  return render();
}

KeywordFilter.propTypes = {
  ...TextInput.propTypes,
};
