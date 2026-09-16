import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

/**
 * Shared list-screen toolbar: the filter modal on the left, the result count and
 * keyword search on the right. Pass the screen's filter fields as children —
 * they render inside the filter modal.
 *
 * Wraps at two levels so it never overflows a phone: the right group drops below
 * the filter button when the row is tight, and the result count drops above the
 * keyword input (which carries a 220px floor) when even that line is too narrow.
 */
export default function ListToolbar({ children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <SearchFilters.Modal>{children}</SearchFilters.Modal>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Search.Status />
        <SearchFilters.Keyword />
      </div>
    </div>
  );
}
