import React from 'react';

import { PageContext } from 'stores/page';

import { formatDateTime } from 'utils/date';

import Menu from './Menu';
import Meta from 'components/Meta';
import { Table, Divider } from '@mantine/core';
import { useContext } from 'react';

export default function OrganizationOverview() {
  const { organization } = useContext(PageContext);

  return (
    <React.Fragment>
      <Meta title={organization.name} />
      <Menu />
      <Divider hidden />
      <Table variant="vertical" layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td w={160}>Name</Table.Td>
            <Table.Td>{organization.name}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td w={160}>Created At</Table.Td>
            <Table.Td>{formatDateTime(organization.createdAt)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Updated At</Table.Td>
            <Table.Td>{formatDateTime(organization.updatedAt)}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </React.Fragment>
  );
}
