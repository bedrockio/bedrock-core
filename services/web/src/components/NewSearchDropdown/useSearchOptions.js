import { isPlainObject } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from 'hooks/debounce';

import { request } from 'utils/api';

export default function useSearchOptions(props) {
  const { searchPath, searchBody } = props;

  function mapOptions(data) {
    return data.map((doc) => {
      return {
        label: doc.name,
        value: doc.id,
        data: doc,
      };
    });
  }

  function getValues() {
    const { value } = props;
    if (Array.isArray(value)) {
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

  function loadInitialOptions() {
    const ids = getUnpopulated();
    if (ids.length) {
      runSearch({
        ids,
      });
    }
  }

  const runSearch = useCallback(async (params) => {
    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      const { data } = await request({
        method: 'POST',
        path: searchPath,
        body: {
          ...searchBody,
          ...params,
        },
      });

      setOptions(mapOptions(data));
      setLoading(false);

      return data;
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }, []);

  const clearOptions = useCallback(() => {
    setOptions([]);
  });

  const runSearchDeferred = useDebounce((keyword) => {
    runSearch({
      keyword,
    });
  });

  // -----------------

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(mapOptions(getPopulated()));

  useEffect(() => {
    loadInitialOptions();
  }, []);

  return {
    error,
    loading,
    options,
    runSearch,
    clearOptions,
    runSearchDeferred,
  };
}
