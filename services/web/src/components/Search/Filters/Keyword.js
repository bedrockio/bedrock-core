import { Search as SearchIcon, X } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';

import { useDebounce } from 'hooks/debounce';

import { useSearch } from '../Context';

export default function KeywordFilter() {
  const { loading, filters, setFilters } = useSearch();

  const [keyword, setKeyword] = useState(filters.keyword || '');

  const setFilterDeferred = useDebounce({
    run(newKeyword) {
      setFilters({ keyword: newKeyword });
    },
    timeout: 500,
    deps: [setFilters],
  });

  function onChange(evt) {
    const { value } = evt.currentTarget;
    setKeyword(value);
    setFilterDeferred(value);
  }

  function onKeyDown(evt) {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      setFilters({ keyword });
      setFilterDeferred.cancel();
    }
  }

  function onClearClick() {
    setKeyword('');
    setFilters({ keyword: '' });
  }

  return (
    <div className="relative min-w-[220px]">
      <Input
        disabled={loading}
        type="search"
        placeholder="Search by keyword"
        className="pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        value={keyword}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <span className="text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-3">
        {keyword ? (
          <X className="size-4 cursor-pointer" onClick={onClearClick} />
        ) : (
          <SearchIcon className="size-4" />
        )}
      </span>
    </div>
  );
}
