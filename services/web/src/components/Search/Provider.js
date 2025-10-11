import { useEffect, useState } from 'react';

import { useRequest } from 'hooks/request';

import { stripEmpty } from 'utils/object';

import { SearchContext } from './Context';

const DEFAULT_SORT = { field: '_id', order: 'asc' };

export default function SearchProvider(props) {
  const { children, skip = 0, limit = 20, onDataNeeded } = props;

  const { run, result, loading, error } = useRequest(onDataNeeded);

  const [params, setParams] = useState({
    ...props.filters,
    sort: {
      ...DEFAULT_SORT,
      ...props.sort,
    },
    skip,
    limit,
  });

  useEffect(() => {
    run(params);
  }, [params]);

  const context = {
    error,
    reload,
    loading,
    setSort,
    setSkip,
    setFilters,
    resetFilters,
    onDataNeeded,
    sort: params.sort,
    filters: getFilters(),
    items: result?.data || [],
    meta: result?.meta,
  };

  function getFilters() {
    const { sort, skip, limit, ...filters } = params;
    return filters;
  }

  function setFilters(newFilters) {
    const newParams = stripEmpty({
      ...params,
      ...newFilters,
      skip: 0,
    });
    setParams(newParams);
  }

  function resetFilters() {
    const { keyword, sort, limit } = params;
    setParams({
      sort,
      limit,
      keyword,
      skip: 0,
    });
  }

  function setSort(newSort) {
    setParams({
      ...params,
      sort: newSort,
      skip: 0,
    });
  }

  function setSkip(newSkip) {
    setParams({
      ...params,
      skip: newSkip,
    });
  }

  function reload() {
    run(params);
  }

  function render() {
    return <SearchContext value={context}>{renderChildren()}</SearchContext>;
  }

  function renderChildren() {
    return children(context);
  }

  return render();
}
