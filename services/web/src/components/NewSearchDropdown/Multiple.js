import { Loader, MultiSelect } from '@mantine/core';
import { useRef } from 'react';

import useSearchOptions from './useSearchOptions';

export default function NewSearchDropdownMultiple(props) {
  const { name, value, label, placeholder } = props;

  function getValue() {
    return value.map((obj) => {
      return obj.id || obj;
    });
  }

  // NOTE: Mantine calls this both on blur and when an
  // option is selected for some reason.
  function onSearchChange(keyword) {
    const isFocused = ref.current === document.activeElement;

    if (isFocused && keyword) {
      loadOptionsDeferred(keyword);
    }
  }

  function onChange(ids) {
    const docs = options
      .filter((option) => {
        return ids.includes(option.data.id);
      })
      .map((option) => {
        return option.data;
      });

    props.onChange(name, docs);
    loadOptionsDeferred.cancel();
  }

  function onKeyDown(evt) {
    if (evt.key === 'Enter') {
      const { value: keyword } = evt.target;
      evt.preventDefault();
      evt.stopPropagation();
      runSearch({
        keyword,
      });
    }
  }

  // ----

  const ref = useRef();

  const { error, loading, options, runSearch, loadOptionsDeferred } =
    useSearchOptions(props);

  function render() {
    return (
      <MultiSelect
        {...getRightProps()}
        ref={ref}
        label={label}
        error={!!error}
        data={options}
        value={getValue()}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        onSearchChange={onSearchChange}
        nothingFoundMessage={renderNothingFound()}
        searchable
      />
    );
  }

  function renderNothingFound() {
    if (loading) {
      return 'Loading...';
    } else {
      return 'No results';
    }
  }

  function getRightProps() {
    if (loading) {
      return {
        rightSection: <Loader size="xs" />,
      };
    }
  }

  return render();
}
