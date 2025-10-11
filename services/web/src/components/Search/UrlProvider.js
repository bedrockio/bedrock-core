import { useNavigate, useSearch } from '@bedrockio/router';

import Provider from './Provider';

export default function UrlProvider(props) {
  const { sort: defaultSort } = props;

  const search = useSearch();

  const navigate = useNavigate();

  const {
    skip,
    'sort.field': sortField,
    'sort.order': sortOrder,
    ...rest
  } = search;

  const params = {
    filters: rest,
    skip: Number(search.skip) || 0,
    sort: {
      ...defaultSort,
      ...(sortField && {
        field: sortField,
      }),
      ...(sortOrder && {
        order: sortOrder,
      }),
    },
  };

  function onParamsChange(state) {
    const { sort, skip, limit, ...rest } = state;
    const params = new URLSearchParams(rest);

    const { field, order } = sort || {};

    if (field && field !== defaultSort?.field) {
      params.set('sort.field', field);
    }

    if (order && order !== defaultSort?.order) {
      params.set('sort.order', order);
    }

    if (skip) {
      params.set('skip', skip);
    }

    navigate.replace(params.size ? `?${params}` : '');
  }

  return <Provider {...props} {...params} onParamsChange={onParamsChange} />;
}
