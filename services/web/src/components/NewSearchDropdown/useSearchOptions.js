import { isPlainObject } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from 'hooks/debounce';

import { request } from 'utils/api';

export default function useSearchOptions(props) {
  const { searchPath, searchBody } = props;

  function isMultiple() {
    const { value } = props;
    return Array.isArray(value);
  }

  function mapOptions(data) {
    return data.map((doc) => {
      // Best guess at data name.
      const label = doc.name || doc.description || 'Unknown';
      return {
        label,
        value: doc.id,
        data: doc,
      };
    });
  }

  function getValues() {
    const { value } = props;
    if (isMultiple()) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }

  function getPopulated() {
    return getValues().filter((obj) => {
      return isPlainObject(obj);
    });
  }

  function getUnpopulated() {
    return getValues().filter((obj) => {
      return typeof obj === 'string';
    });
  }

  async function loadInitial() {
    const ids = getUnpopulated();
    if (ids.length) {
      const data = await runSearch({
        ids,
      });

      const { name } = props;
      const value = isMultiple ? data : data[0];

      props.onChange(name, value);
      setOptions(mapOptions(data));
    }
  }

  const runSearch = useCallback(
    async (params) => {
      setError(null);
      setLoading(true);

      try {
        const { data } = await request({
          method: 'POST',
          path: searchPath,
          body: {
            ...searchBody,
            ...params,
          },
        });

        setLoading(false);

        return data;
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    },
    [props.value],
  );

  async function loadOptions(params) {
    const data = await runSearch(params);

    const populated = getPopulated();

    for (let document of populated) {
      const hasDocument = data.some((d) => {
        return d.id === document.id;
      });

      if (!hasDocument) {
        data.push(document);
      }
    }

    setOptions(mapOptions(data));
  }

  const clearOptions = useCallback(() => {
    setOptions([]);
  });

  const loadOptionsDeferred = useDebounce({
    run(keyword) {
      loadOptions({
        keyword,
      });
    },
    deps: [props.value],
  });

  // -----------------

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(mapOptions(getPopulated()));

  useEffect(() => {
    loadInitial();
  }, []);

  return {
    error,
    loading,
    options,
    runSearch,
    clearOptions,
    loadOptionsDeferred,
  };
}
