import { Group, Table } from '@mantine/core';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

import { useSearch } from './Context';

export default function SortableHeader(props) {
  const { name, children, ...rest } = props;

  const { sort, setSort } = useSearch();

  function getSorted() {
    const { field, order } = sort || {};

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

  function render() {
    return (
      <Table.Th {...rest} onClick={onClick} style={{ cursor: 'pointer' }}>
        <Group justify="space-between" wrap="no-wrap">
          {children}
          {renderIcon()}
        </Group>
      </Table.Th>
    );
  }

  function renderIcon() {
    const sorted = getSorted();
    if (sorted === 'asc') {
      return <FaChevronUp />;
    } else if (sorted === 'desc') {
      return <FaChevronDown />;
    }
  }

  return render();
}
