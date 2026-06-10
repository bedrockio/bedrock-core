import { TableHead } from '@/components/ui/table';

import SortableHeader from './SortableHeader';

export default function Header(props) {
  if (props.name) {
    return <SortableHeader {...props} />;
  } else {
    return <TableHead {...props} />;
  }
}
