import { useQuery } from '@bedrockio/router';
import { Loader, Select } from '@mantine/core';
import { useEffect, useRef } from 'react';

import useSearchOptions from './useSearchOptions';

export default function NewSearchDropdownSingle(props) {
  const { name, value, label, placeholder, useParams, onLoaded } = props;

  function getValue() {
    return value?.id || value || '';
  }

  function onClear() {
    clearOptions();
    props.onChange(name, null);
    runSearchDeferred.cancel();
  }

  // NOTE: Mantine calls this both on blur and when an
  // option is selected for some reason.
  function onSearchChange(keyword) {
    const isFocused = ref.current === document.activeElement;

    if (isFocused) {
      if (keyword) {
        if (keyword !== value?.name) {
          runSearchDeferred(keyword);
        }
      } else {
        clearOptions();
      }
    }
  }

  function onOptionSubmit(id) {
    const option = options.find((option) => {
      return option.data.id === id;
    });
    if (option) {
      props.onChange(name, option.data);
    }
    runSearchDeferred.cancel();
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

  async function loadParams() {
    if (useParams) {
      const id = queryParams[name];
      if (id) {
        const [first] = await runSearch({
          ids: [id],
        });

        if (first) {
          onLoaded?.(first);
          props.onChange(name, first);
        }
      }
    }
  }

  // ----

  const ref = useRef();
  const queryParams = useQuery();

  useEffect(() => {
    loadParams();
  }, []);

  const {
    error,
    loading,
    options,
    runSearch,
    clearOptions,
    runSearchDeferred,
  } = useSearchOptions(props);

  function render() {
    return (
      <Select
        {...getRightProps()}
        ref={ref}
        label={label}
        error={!!error}
        onClear={onClear}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onSearchChange={onSearchChange}
        onOptionSubmit={onOptionSubmit}
        nothingFoundMessage="No results"
        value={getValue()}
        data={options}
        allowDeselect={false}
        withCheckIcon={false}
        searchable
      />
    );
  }

  function getRightProps() {
    if (loading) {
      return {
        rightSection: <Loader size="xs" />,
      };
    } else {
      return {
        clearable: true,
      };
    }
  }

  return render();
}
