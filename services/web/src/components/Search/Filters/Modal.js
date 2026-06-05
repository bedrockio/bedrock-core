import { omit } from 'lodash';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { SearchContext, useSearch } from '../Context';

function FilterModal(props) {
  const { children } = props;

  const search = useSearch();

  const [opened, setOpened] = useState(false);
  const [filters, setFilters] = useState({ ...search.filters });

  function updateFilters(newFilters) {
    setFilters((current) => ({ ...current, ...newFilters }));
  }

  useEffect(() => {
    setFilters({ ...omit(search.filters, 'keyword') });
  }, [opened]);

  function getFilterCount() {
    return Object.keys(omit(search.filters, 'keyword')).length;
  }

  function hasFilters() {
    return getFilterCount() > 0;
  }

  function onSubmit(evt) {
    evt.preventDefault();
    search.setFilters(filters);
    setOpened(false);
  }

  function onResetClick() {
    if (hasFilters()) {
      setFilters({});
      search.resetFilters();
    }
    setOpened(false);
  }

  const count = getFilterCount();

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="size-4" />
          Filter
          {!search.loading && count > 0 && (
            <Badge className="ml-1 size-5 rounded-full p-0">{count}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>
        <form id="filters" onSubmit={onSubmit}>
          <SearchContext
            value={{
              ...search,
              filters,
              setFilters: updateFilters,
            }}>
            <div className="flex flex-col gap-4">{children}</div>
          </SearchContext>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onResetClick}>
            Reset
          </Button>
          <Button type="submit" form="filters">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FilterModal;
