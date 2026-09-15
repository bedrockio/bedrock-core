import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { useSearch } from './Context';

export default function SortableHeader(props) {
  const { name, children, className, ...rest } = props;

  const { sort, setSort } = useSearch();

  function getSorted() {
    let { field, order } = sort || {};

    // Note that _id is a default that serves as a proxy for createdAt.
    // https://github.com/bedrockio/model?tab=readme-ov-file#default-sort-order
    if (field === '_id') {
      field = 'createdAt';
    }

    if (name !== field) {
      return;
    }

    return order;
  }

  function onClick() {
    setSort({
      field: name,
      order: getSorted() === 'asc' ? 'desc' : 'asc',
    });
  }

  const sorted = getSorted();

  return (
    <TableHead
      {...rest}
      onClick={onClick}
      className={cn(
        'group hover:text-foreground cursor-pointer transition-colors select-none',
        sorted && 'text-foreground',
        className,
      )}>
      <div className="flex items-center justify-between gap-2">
        {children}
        {sorted === 'asc' ? (
          <ChevronUp className="text-primary size-3.5" />
        ) : sorted === 'desc' ? (
          <ChevronDown className="text-primary size-3.5" />
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
        )}
      </div>
    </TableHead>
  );
}
