import { Group, Center, Text, UnstyledButton, Table } from '@mantine/core';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

import classes from './SortableTh.module.css';

export default function SortableTh({ children, sorted, onClick, ...props }) {
  const Icon = sorted === 'descending' ? FaChevronDown : FaChevronUp;

  const hasSort = !!sorted;

  return (
    <Table.Th {...props} className={classes.th}>
      <UnstyledButton
        onClick={onClick}
        className={classes.control}
        data-sorted={hasSort}>
        <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
          <Text span fw="bold" fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ fontSize: '11px' }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}
