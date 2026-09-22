import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

import { useSearch } from './Context';

/**
 * Skeleton rows shown inside a table body while a search is loading, so the
 * grid holds its shape instead of flashing empty. Render inside <TableBody>:
 *
 *   <Search.Loading columns={5} />
 */
export default function SearchLoading({ columns = 4, rows = 6 }) {
  const { loading } = useSearch();

  if (!loading) {
    return null;
  }

  return Array.from({ length: rows }).map((_, row) => (
    <TableRow key={row}>
      {Array.from({ length: columns }).map((__, col) => (
        <TableCell key={col}>
          <Skeleton
            className="h-4"
            style={{ width: col === 0 ? '60%' : '40%' }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
