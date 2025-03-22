import { Group, Center, Text, UnstyledButton, Table } from '@mantine/core';
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from '@tabler/icons-react';

import classes from './SortableTh.module.css';

export default function SortableTh({ children, sorted, onClick, ...props }) {
  const Icon = sorted
    ? sorted == 'ascending'
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;

  return (
    <Table.Th style={{ padding: 0 }} {...props}>
      <UnstyledButton onClick={onClick} className={classes.control}>
        <Group justify="space-between">
          <Text fw="bold" fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}
