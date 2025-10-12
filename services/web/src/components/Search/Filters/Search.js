import SearchDropdown from 'components/SearchDropdown';

import { useSearch } from '../Context';

export default function Search(props) {
  const { name } = props;

  const { filters, setFilters } = useSearch();

  function getValue() {
    return filters[name] || '';
  }

  function onChange(value) {
    setFilters({
      [name]: value,
    });
  }
  return (
    <SearchDropdown
      {...props}
      value={getValue()}
      onChange={onChange}
      objectMode={false}
    />
  );
}
