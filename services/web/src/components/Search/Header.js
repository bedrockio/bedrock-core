import { Table } from '@mantine/core';

import SortableHeader from './SortableHeader';

export default function Header(props) {
  if (props.name) {
    return <SortableHeader {...props} />;
  } else {
    return <Table.Th {...props} />;
  }
}
